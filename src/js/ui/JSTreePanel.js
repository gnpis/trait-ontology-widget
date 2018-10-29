const $ = require('jquery')
require('jstree')

import Arrays from '../utils/Arrays'
import LangUtils from '../utils/LangUtils'
import { isEmpty, whenAll } from '../utils'

import { buildTree, getNodeText } from '../tree/TreeBuilder'
import SearchField from './SearchField'
import LanguageSelector from './LanguageSelector'

export default class JSTreePanel {
  constructor(widget) {
    this.widget = widget

    // Base jstree options
    let jsTreeOptions = {
      'core': {
        'check_callback' : true, 'data': [],
        'themes': {
          'variant': 'large', 'icons': false,
          'stripes': true, 'expand_selected_onload': true
        }
      },
      'checkbox': {
        'keep_selected_style': false, 'visible': widget.options.showCheckBoxes
      },
      'types': {
        'ontology': { 'a_attr': { 'class': 'ontology labeled' } },
        'traitClass': { 'a_attr': { 'class': 'traitClass labeled' } },
        'trait': { 'a_attr': { 'class': 'trait labeled' } },
        'variable': { 'a_attr': { 'class': 'variable labeled' } }
      },
      'plugins': [ 'checkbox', 'types', 'sort' ]
    }

    this.$title = $('<h2>').text('Traits, methods and scales')

    // Initialize panel div with title
    this.$treeBox = $('<div class="treeBox">').append(this.$title)

    // Initialize search field if requested
    this.searchField = null
    if (widget.options.useSearchField) {
      this.searchField = new SearchField(widget, jsTreeOptions)
      // Add the search field
      this.$treeBox.append(this.searchField.getElement())
    }

    // Add the jstree div
    this.$tree = $('<div class="tree">')
    this.$treeBox.append(this.$tree)

    this.customSelectionHandlers = []
    this.customClickHandlers = []
    this.jstree = null

    // Initializes logic for custom click & selection event handling on jstree
    // nodes
    this.$tree.on('click', '.jstree-anchor', (event) => {
      let $target = $(event.target)
      let $targetItem = $target.parents('li').eq(0)

      let targetNodeId = $targetItem.attr('id')
      let targetNode = this.jstree.get_node(targetNodeId)

      // Activate all click handlers
      for (let handler of this.customClickHandlers) {
        handler($targetItem, targetNode)
      }

      if ($target.is('.jstree-checkbox')) {
        // Click on checkbox => activate all selection handlers
        for (let handler of this.customSelectionHandlers) {
          setTimeout(() => handler($targetItem, targetNode), 0)
        }
      } else {
        // Not on checkbox: prevent node selection
        event.stopImmediatePropagation()
      }
      event.preventDefault()
    })

    // Initializes jsTree
    this.$tree.jstree(jsTreeOptions)
    this.jstree = this.$tree.jstree(true)
  }

  /**
   * @return true if data is loaded in tree
   */
  isLoaded() {
    return this.allNodeIds
  }

  /**
   * Load tree data
   *
   * @returns Deferred list of all node identifiers
   */
  load() {
    if (this.deferredLoaded) return this.deferredLoaded
    this.deferredLoaded = $.Deferred()

    // Wait for jstree and TreeBuilder results
    // Initialize the tree builder
    let treeNodes = buildTree(this.widget.options.breedingAPIEndpoint)
    $.when(
      this.treeReady(), treeNodes
    ).then((treeReady, nodes) => {
      let language = LangUtils.getInitialLanguageCode()

      let allNodeIds = []
      for (let node of nodes) {
        allNodeIds.push(node.id)
        // Generate text
        node['text'] = getNodeText(node, language)
        // Add node to tree
        this.jstree.create_node(node.parent, node)
      }
      this.deferredLoaded.resolve(allNodeIds)
      this.allNodeIds = allNodeIds

      // Regroup all languages
      let langs = Arrays.distinct(
        $.map(nodes, n => Object.getOwnPropertyNames(n.data))
      )
      // Show language selector if there is more than one language
      if (langs.length > 1){
        this.displayLanguageSelector(langs)
      }
    })
    return this.deferredLoaded
  }

  /**
   * Actions on tree node click
   */
  onClickTreeNode(node) {
    this.$tree.find('li.displayed').removeClass('displayed')
    let $item = this.getItemByNodeId(node.id)
    if ($item.length === 1) {
      $item.addClass('displayed')

      // item is not in viewport if its top offset is more than the
      // scroll panel top position plus its height
      let treeScrollPanelBottom = this.$tree.offset().top + this.$tree.outerHeight()
      let itemTop = $item.offset().top
      if (itemTop > treeScrollPanelBottom) {
        // item not in scroll view port => scroll to item
        this.$tree.animate({scrollTop: itemTop})
      }
    }
  }

  /**
   * Create a language selector
   */
  displayLanguageSelector(languages) {
    this.languageSelector = new LanguageSelector(languages)
    this.$title.append(this.languageSelector.getElement())

    this.languageSelector.addSelectHandler(language => {
      // Refresh details on current displayed node (if any) for new language
      this.widget.detailsPanel.refreshItem()

      // Rename tree node text
      let renameLater = []
      for (let nodeId of this.allNodeIds) {
        let node = this.jstree.get_node(nodeId)
        let item = this.getItemByNodeId(nodeId)

        let oldText = node['text']
        let newText = getNodeText(node, language)

        // Ignore nodes that don't change
        if (oldText === newText) continue

        if (item.length > 0 && item.is(':visible')) {
          // First rename nodes displayed in tree
          this.jstree.rename_node(node, newText)
        } else {
          // Rename later other nodes
          renameLater.push([node, newText])
        }
      }

      // Rename other nodes later (to reduce UI freeze)
      setTimeout(() => {
        for (let [node, newText] of renameLater) {
          this.jstree.rename_node(node, newText)
        }
      }, 300)
    })
  }

  /**
   * Get language selected
   */
  getSelectedLanguage() {
    if (this.languageSelector) return this.languageSelector.getSelected()
    return LangUtils.getInitialLanguageCode()
  }

  /**
  * Returns the jQuery element
  */
  getElement() {
    return this.$treeBox
  }

  /**
   * Get li using the node id
   */
  getItemByNodeId(nodeId) {
    let escapedId = $.escapeSelector(nodeId)
    return this.$tree.find(`li#${escapedId}`)
  }

  /**
  * Adds a selection handler to the jstree nodes
  */
  addSelectionChangeHandler(handler) {
    this.customSelectionHandlers.push(handler)
  }

  /**
  * Adds a click handler on jstree nodes
  */
  addClickHandler(handler) {
    this.customClickHandlers.push(handler)
  }

  /**
  * Returns a deferred value that is resolved when the tree has loaded
  */
  treeReady(callback) {
    let deferred = $.Deferred()
    this.$tree.on('ready.jstree', deferred.resolve)
    if (callback) deferred.then(callback)
    return deferred
  }

  /**
  * Reset node selection
  */
  resetSelection() {
    this.jstree.deselect_all()
  }

  /**
  * Reset the jsTreePanel (reset search field, node selection, opened nodes)
  */
  reset() {
    if (this.searchField) this.searchField.clear()
    this.resetSelection()
    this.showAll()
    this.jstree.close_all()
  }

  /**
  * Show all nodes
  */
  showAll() {
    this.jstree.show_all()
  }

  /**
  * Hide all nodes
  */
  hideAll() {
    this.jstree.hide_all()
  }

  /**
  * Search node identifiers using a predicate on nodes
  */
  searchNodeIds(nodes, predicate) {
    let filtered = []
    for (let node of nodes) {
      if (predicate(node)) {
        filtered.push(node.id)
      }
      if (node.children) {
        filtered = filtered.concat(this.searchNodeIds(node.children, predicate))
      }
    }
    return filtered
  }

  /**
  * Hide all nodes except the given nodes, their parents and their children
  */
  showOnly(requiredNodeIds) {
    this.load().then(allNodeIds => {
      let shownNodeIds = []
      let hiddenNodeIds = []
      for (let nodeId of allNodeIds) {
        if(requiredNodeIds.indexOf(nodeId) !== -1) {
          let node = this.jstree.get_node(nodeId)
          shownNodeIds.push(nodeId)
          if (node.children_d) shownNodeIds = shownNodeIds.concat(node.children_d)
          if (node.parents) shownNodeIds = shownNodeIds.concat(node.parents)
        } else {
          hiddenNodeIds.push(nodeId)
        }
      }
      // using setTimeout to delay DOM modifications (reducing UI blocking)
      setTimeout(() => {
        for (let nodeId of hiddenNodeIds) {
          if(!Arrays.contains(shownNodeIds, nodeId)) {
            this.jstree.hide_node(nodeId)
            this.jstree.deselect_node(nodeId)
          }
        }
      }, 0)
      setTimeout(() => {
        for (let nodeId of shownNodeIds) {
          this.jstree.show_node(nodeId)
        }
      }, 0)
    })
  }

  /**
  * Set selected nodes by id
  */
  setSelectedNodeIds(nodeIds) {
    this.resetSelection()
    if (!isEmpty(nodeIds)) {
      this.load().then(() => {
        if (nodeIds.length == 1) {
          this.widget.onClickNode(this.jstree.get_node(nodeIds[0]))
        }
        for (let nodeId of nodeIds) {
          this.jstree.select_node(nodeId)
        }
      })
    }
  }

  /**
  * Get identifiers of selected nodes
  */
  getSelectedNodeIds() {
    return this.jstree.get_selected()
  }

  /**
  * Get identifiers of selected leaf nodes
  */
  getSelectedLeafIds() {
    return $.grep(this.getSelectedNodeIds(), (id) => {
      let node = this.jstree.get_node(id)
      return (!node.children.length && node.state.selected)
    })
  }
}
