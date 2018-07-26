const $ = require('jquery')
require('jstree')

import { Arrays } from '../utils'
import { TreeBuilder } from '../tree/TreeBuilder'
import { SearchField } from './SearchField'

export class JSTreePanel {
  constructor(widget) {
    // Initialize the tree builder
    this.treeBuilder = new TreeBuilder(widget)

    // Base jstree options
    this.jsTreeOptions = {
      'core': {
        'check_callback' : true,
        'themes': {
          'variant': 'large', 'icons': false,
          'stripes': true, 'expand_selected_onload': true
        },
        'data': (self, callback) => {
          this.treeBuilder.buildTree(callback.bind(self))
        }
      },
      'checkbox': {
        'keep_selected_style': false,
        'visible': widget.showCheckBoxes
      },
      // Define types of nodes
      'types': {
        'ontology': {
          'valid_children': [ 'trait', 'traitClass', 'variable' ],
          'a_attr': { 'class': 'ontology labeled' }
        },
        'traitClass': {
          'valid_children': [ 'trait', 'variable' ],
          'a_attr': { 'class': 'traitClass labeled' }
        },
        'trait': {
          'valid_children': [ 'variable' ],
          'a_attr': { 'class': 'trait labeled' }
        },
        'variable': {
          'valid_children': [],
          'a_attr': { 'class': 'variable labeled' }
        }
      },
      'plugins': [ 'checkbox', 'types', 'sort' ]
    }

    // Initialize panel div
    this.$treeBox = $('<div class="treeBox"></div>')

    // Add the title
    var $title = $('<h2>Traits, methods and scales</h2>')
    this.$treeBox.append($title)

    // Initialize search field if requested
    this.searchField = null
    if (widget.useSearchField) {
      this.searchField = new SearchField(widget)
      this.jsTreeOptions['search'] = {
        'show_only_matches': true,
        'search_callback': this.searchField.nodeMatchesText
      }
      this.jsTreeOptions['plugins'].push('search')

      // Add the search field
      this.$treeBox.append(this.searchField.getElement())
    }

    // Add the jstree div
    this.$tree = $('<div class="tree"></div>')
    this.$treeBox.append(this.$tree)

    this.customSelectionHandlers = []
    this.customClickHandlers = []
    this.jstree = null

    /**
     * Delegate method
     * Get deferred list of node ids
     */
    this.getAllNodeIds = () => this.treeBuilder.getAllNodeIds()
  }

  /**
  * Initializes jsTree
  */
  initializeJSTree() {
    // Initializes logic for custom click & selection event handling on jstree
    // nodes
    this.$tree.on('click', '.jstree-anchor', (event) => {
      var $target = $(event.target)
      var $targetItem = $target.parents('li').eq(0)

      var targetNodeId = $targetItem.attr('id')
      var targetNode = this.jstree.get_node(targetNodeId)

      $.map(this.customClickHandlers, function(clickHandler) {
        clickHandler($targetItem, targetNode)
      })

      if (!$target.is('.jstree-checkbox')) {
        // Click on node (not checkbox)

        //prevent node selection, just display details
        event.stopImmediatePropagation()
      } else {
        // Click on checkbox => selection handling

        $.map(this.customSelectionHandlers, function(selectionHandler) {
          setTimeout(function() {
            selectionHandler($targetItem, targetNode)
          }, 0)
        })
      }
      event.preventDefault()
    })

    // Initializes jsTree
    this.$tree.jstree(this.jsTreeOptions)
    this.jstree = this.$tree.jstree(true)
  }

  /**
  * Returns the jQuery element
  */
  getElement() {
    return this.$treeBox
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
  treeReady() {
    var deferred = $.Deferred()
    this.$tree.on('ready.jstree', deferred.resolve)
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
    var filtered = []
    $.map(nodes, (node) => {
      if (predicate(node)) {
        filtered.push(node.id)
      }
      if (node.children) {
        filtered = filtered.concat(this.searchNodeIds(node.children, predicate))
      }
    })
    return filtered
  }

  /**
  * Hide all nodes except the given nodes, their parents and their children
  */
  showOnly(requiredNodeIds) {
    this.treeBuilder.getAllNodeIds().then((allNodeIds) => {
      var shownNodeIds = []
      var hiddenNodeIds = []
      $.map(allNodeIds, (nodeId) => {
        if(requiredNodeIds.indexOf(nodeId) !== -1) {
          var node = this.jstree.get_node(nodeId)
          shownNodeIds.push(nodeId)
          if (node.children_d) shownNodeIds = shownNodeIds.concat(node.children_d)
          if (node.parents) shownNodeIds = shownNodeIds.concat(node.parents)
        } else {
          hiddenNodeIds.push(nodeId)
        }
      })
      // using setTimeout to delay DOM modifications (reducing UI blocking)
      setTimeout(() => {
        $.map(hiddenNodeIds, (nodeId) => {
          if(!Arrays.contains(shownNodeIds, nodeId)) {
            this.jstree.hide_node(nodeId)
            this.jstree.deselect_node(nodeId)
          }
        })
      }, 0)
      setTimeout(() => {
        $.map(shownNodeIds, (nodeId) => {
          this.jstree.show_node(nodeId)
        })
      }, 0)
    })
  }

  /**
  * Set selected nodes by id
  */
  setSelectedNodeIds(nodeIds) {
    this.resetSelection()
    if (nodeIds && nodeIds.length) {
      this.treeBuilder.getAllNodeIds().then(() => {
        $.map(nodeIds, (nodeId) => {
          this.jstree.select_node(nodeId)
        })
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
      var node = this.jstree.get_node(id)
      return (!node.children.length && node.state.selected)
    })
  }
}
