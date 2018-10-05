const $ = require('jquery')

import Arrays from '../utils/Arrays'
import { getIn, isEmpty } from '../utils'

export default class SearchField {

  constructor(widget, jsTreeOptions) {
    this.widget = widget
    this.$searchBox = $('<div class="searchBox"></div>')
    this.$input = $('<input placeholder="Search terms..." type="text">')
    this.$searchBox.append(this.$input)

    // Initialize jsTree options for search
    jsTreeOptions['search'] = {
      'show_only_matches': true,
      'search_callback': this.nodeMatchesText
    }
    jsTreeOptions['plugins'].push('search')

    // Initialize keyup event on the search input field
    // With event throttling to prevent to much call to jstree.search
    let searching = false
    this.$input.keyup(() => {
      if (searching) clearTimeout(searching)
      searching = setTimeout(() => {
        this.widget.jsTreePanel.jstree.search(this.$input.val())
        searching = false
      }, 200) // delay in milliseconds
    })
  }

  /**
   * Returns the jQuery element
   */
  getElement() {
    return this.$searchBox
  }

  /**
   * Clear search input & trigger empty search
   */
  clear() {
    this.$input.val('').trigger('keyup')
  }

  /**
   * Predicate function returning true if the node matches the searched text
   */
  nodeMatchesText(searchText, node) {
    if (node.state && node.state.hidden === true) return false
    if (!node.searchIndex) node.searchIndex = createSearchIndex(node)

    // Split search text by spaces to get a list of terms
    let searchTerms = searchText.trim().split(/\s+/)

    // Every terms should match the current node
    return Arrays.every(
      searchTerms,

      // Some of the index value should match the search term
      (searchTerm) => Arrays.some(
        node.searchIndex,
        (value) => valueMatches(value, searchTerm)
      )
    )
  }
}

/**
 * Given value should match the search text
 */
function valueMatches(value, searchText) {
  if (typeof value === 'string') {
    // Value is a string
    // Value contains (ingore case) the search text ?
    return value.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
  }
  return false
}

/**
 * Generate list of all values of SEARCH_FIELDS for given node to use later as
 * a search index
 */
function createSearchIndex(node) {
  // Get all values of SEARCH_FIELDS in the current node
  let values = $.map(SEARCH_FIELDS, field => getIn(node, field))
  // Flatten values and get distinct list
  return Arrays.distinct(Arrays.flatten(values))
}

// List of path to fields that should be searched in the tree node object
// "*" serves as wilcard to explore every languages and sub sections in node data
const SEARCH_FIELDS = [
  ['text'],
  ['data', '*', 'observationVariableDbId'],
  ['data', '*', 'name'],
  ['data', '*', 'synonyms'],
  ['data', '*', 'traitDbId'],
  ['data', '*', 'description'],
  ['data', '*', 'mainAbbreviation'],
  ['data', '*', 'alternativeAbbreviations'],
  ['data', '*', 'entity'],
  ['data', '*', 'attribute'],
  ['data', '*', 'scaleDbId'],
  ['data', '*', 'methodDbId'],
  ['data', '*', 'xref'],
]
