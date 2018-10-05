const $ = require('jquery')

import Arrays from '../utils/Arrays'
import LangUtils from '../utils/LangUtils'
import { isEmpty } from '../utils'
import { getNodeText } from '../tree/TreeBuilder'
import LanguageSelector from '../ui/LanguageSelector'

// Details panel view
export default class DetailsPanel {
  constructor(widget) {
    this.widget = widget
    this.defaultTilte = 'Details'
    this.$detailsBox = $('<div class="details">')
    this.$details = $('<div>')
    this.$title = $('<h2>').text(this.defaultTilte)
    this.$table = $('<table>')
    this.$detailsBox.append(this.$title, this.$details.append(this.$table))
  }

  /**
  * Returns the jQuery element
  */
  getElement() {
    return this.$detailsBox
  }

  /**
  * Clear details
  */
  clear() {
    this.$table.empty()
    this.$title.attr("class", "")
    this.$title.text(this.defaultTilte)
    this.currentDisplayedNode = null
  }

  refreshItem() {
    if (this.currentDisplayedNode) {
      this.displayItem(this.currentDisplayedNode)
    }
  }

  /**
  * Display details for an item (<li>) of the jstree
  */
  displayItem(node) {
    // Clear details
    this.clear()

    let language = this.widget.jsTreePanel.getSelectedLanguage()
    let translatedData = node.data[language]
    if (!translatedData) {
      let otherLanguage = Object.getOwnPropertyNames(node.data)[0]
      if (node.type != 'ontology' && node.type != 'traitClass') {
        let languageName = LangUtils.getLanguageName(language).toLowerCase()
        let otherLanguageName = LangUtils.getLanguageName(otherLanguage).toLowerCase()
        let nodeType = parseCamelCase(node.type)
        let message = `
          This ${nodeType} description was not translated in ${languageName}
          (the following description remains in ${otherLanguageName}).
        `
        this.displayMessage('warning', message)
      }

      translatedData = node.data[otherLanguage]
      language = otherLanguage
    }

    // Change detail view title
    this.$title
      .addClass(`labeled ${node.type}`)
      .text(getNodeText(node, language))

    // Generate detail view content
    let rows = sectionView(node.type, translatedData)
    this.$table.append(...rows)

    this.currentDisplayedNode = node
  }

  /**
  * Display message in detail panel
  */
  displayMessage(type, message) {
    this.clear()
    this.$table.append(
      $('<tr>').append(
        $('<td colspan=2>').addClass(type).text(message)
      )
    )
  }
}


function parseCamelCase(str) {
  return str
    // split camel case: insert a space before all caps
    .replace(/([A-Z][a-z])/g, ' $1')
    .toLowerCase().trim()
}

// Format a key for display
function formatKey(str) {
  // Convert camel case to words separated by spaces and capitalized first letter
  return parseCamelCase(str)
    // uppercase first letter
    .replace(/^./, s => s.toUpperCase())
}


// Create html to display string, array of string, etc.
function createValueView(value) {
  if ($.isArray(value) && value.length >= 1) {
    // Generate <li>
    let items = $.map(value, (v) => $('<li>').text(v))
    // Append values as unordered list (ul) of list item (li)
    return $('<ul>').append(...items)
  } else if (value.match && value.match(/^https?:\/\/.+/)) {
    // Display links
    return $('<a target="_blank">').attr("href", value).text(value)
  }
  // Display text
  return $('<span>').text(value)
}


// Create list of links (for links on list of ontologies)
function createLinksView(links) {
  let items = $.map(links, ({rel, href}) => {
    return $('<li>').append(
      $('<a target="_blank">').attr('href', href).attr('title', rel).text(rel)
    )
  })
  // Append links as list (ul) of list item (li) of anchor (a)
  return $('<ul>').append(...items)
}


// Initialize a property configuration (type, label function, view function)
function createProperty({label, view} = {}) {
  return {'type': 'property',
          'label': label || formatKey,
          'view': view || createValueView}
}

// Identifier property factory
function createIdentifier() {
  return createProperty({label: () => 'Identifier'})
}

// List in order the first properties for each object types
// (additional properties are display as generic properties)
const PROP_CONFIGS = {
  'ontologyName': createProperty(),
  'observationVariableDbId': createIdentifier(),
  'traitDbId': createIdentifier(),
  'methodDbId': createIdentifier(),
  'scaleDbId': createIdentifier(),
  // Display links with special view
  'links': createProperty({view: createLinksView}),
  'language': {'type': 'hidden'},
  'ontologyDbId': {'type': 'hidden'}
}

function getPropertyConfiguration(propertyName) {
  if (!PROP_CONFIGS.hasOwnProperty(propertyName)) {
    PROP_CONFIGS[propertyName] = createProperty()
  }
  return PROP_CONFIGS[propertyName]
}

// Create view for property (may produce multiple table rows)
function createPropertyView(key, value, config, parentSection) {
  let rows = []
  if ($.isPlainObject(value)) {
    rows = rows.concat(sectionView(key, value, parentSection))
  } else if(!isEmpty(value) && config.type != 'hidden') {
    let keyText = config.label(key)
    let $valueView = config.view(value)
    if (keyText && $valueView && $valueView.jquery) {
      rows.push(
        $('<tr>').append(
          $('<td class="key">').text(keyText),
          $('<td class="value">').append($valueView))
      )
    }
  }
  return rows
}

// Create view for section of data (may produce multiple table rows)
function sectionView(section, data, parentSection) {
  let rows = []
  if (isEmpty(data)) return rows

  // Add section title if not at the root and if the section is labeled
  if (parentSection === 'variable') {
    let sectionTitle = data['name'] || formatKey(section)
    rows.push(
      $('<tr>').append(
        $('<th class="section" colspan=2>').append(
          $(`<h3 class="labeled ${section}">`).text(sectionTitle)))
    )
  }

  // For each properties in data object
  let dataProperties = Object.getOwnPropertyNames(data)
  for (let property of dataProperties) {
    let propConfig = getPropertyConfiguration(property)
    rows = rows.concat(createPropertyView(
      property, data[property], propConfig, section
    ))
  }
  return rows
}
