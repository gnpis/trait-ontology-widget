var $ = require('jquery');
require("jstree");

var Arrays = require('../utils').Arrays;

var TreeBuilder = require('../TreeBuilder');
var SearchField = require('./SearchField');

module.exports = function JSTreePanel (widget) {
  var jsTreePanel = this;

  // Initialize the tree builder
  var treeBuilder = new TreeBuilder(widget);

  // Base jstree options
  var jsTreeOptions = {
    "core": {
      "check_callback" : true,
      "themes": {
        "variant": "large", "icons": false,
        "stripes": true, "expand_selected_onload": true
      },
      "data": function(self, callback) {
        treeBuilder.buildTree(callback.bind(self));
      }
    },
    "checkbox": {
      "keep_selected_style": false,
      "visible": widget.showCheckBoxes
    },
    // Define types of nodes
    "types": {
      "ontology": {
        "valid_children": [ "trait", "traitClass", "variable" ],
        "a_attr": { "class": "ontology labeled" }
      },
      "traitClass": {
        "valid_children": [ "trait", "variable" ],
        "a_attr": { "class": "traitClass labeled" }
      },
      "trait": {
        "valid_children": [ "variable" ],
        "a_attr": { "class": "trait labeled" }
      },
      "variable": {
        "valid_children": [],
        "a_attr": { "class": "variable labeled" }
      }
    },
    "plugins": [ "checkbox", "types", "sort" ]
  };

  // Initialize panel div
  var $treeBox = $('<div class="treeBox" ></div>');

  // Add the title
  var $title = $('<h2>Traits, methods and scales</h2>');
  $treeBox.append($title);

  // Initialize search field if requested
  var searchField;
  if (widget.useSearchField) {
    searchField = new SearchField(widget);
    jsTreeOptions["search"] = {
      "show_only_matches": true,
      "search_callback": searchField.nodeMatchesText
    };
    jsTreeOptions["plugins"].push("search");

    // Add the search field
    $treeBox.append(searchField.getElement());
  }

  // Add the jstree div
  var $tree = $('<div class="tree"></div>');
  $treeBox.append($tree);

  var customSelectionHandlers = [];
  var customClickHandlers = [];
  this.jstree = null;

  // Methods below

  /**
   * Initializes jsTree
   */
  this.initializeJSTree = function() {
    // Initializes logic for custom click & selection event handling on jstree
    // nodes
    $tree.on('click', '.jstree-anchor', function (event) {
      var $target = $(event.target);
      var $targetItem = $target.parents('li').eq(0);

      var targetNodeId = $targetItem.attr('id');
      var targetNode = widget.jsTreePanel.jstree.get_node(targetNodeId);

      $.map(customClickHandlers, function(clickHandler) {
        clickHandler($targetItem, targetNode);
      });

      if (!$target.is('.jstree-checkbox')) {
        // Click on node (not checkbox)

        //prevent node selection, just display details
        event.stopImmediatePropagation();
      } else {
        // Click on checkbox => selection handling

        $.map(customSelectionHandlers, function(selectionHandler) {
          selectionHandler($targetItem, targetNode);
        });
      }
      event.preventDefault();
    });

    // Initializes jsTree
    $tree.jstree(jsTreeOptions);
    jsTreePanel.jstree = $tree.jstree(true);
  }

  /**
   * Returns the jQuery element
   */
  this.getElement = function() {
    return $treeBox;
  }

  /**
   * Adds a selection handler to the jstree nodes
   */
  this.addSelectionChangeHandler = function(handler) {
    customSelectionHandlers.push(handler);
  }

  /**
   * Adds a click handler on jstree nodes
   */
  this.addClickHandler = function(handler) {
    customClickHandlers.push(handler);
  }

  /**
   * Returns a deferred value that is resolved when the tree has loaded
   */
  this.treeReady = function() {
    var deferred = $.Deferred();
    $tree.on('ready.jstree', deferred.resolve);
    return deferred;
  }

  /**
   * Reset node selection
   */
  this.resetSelection = function() {
    jsTreePanel.jstree.deselect_all();
  }

  /**
   * Reset the jsTreePanel (reset search field, node selection, opened nodes)
   */
  this.reset = function() {
    if (searchField) searchField.clear();
    jsTreePanel.resetSelection();
    jsTreePanel.showAll();
    jsTreePanel.jstree.close_all();
  }

  /**
  * Show all nodes
  */
  this.showAll = function () {
    jsTreePanel.jstree.show_all();
  }

  /**
   * Hide all nodes
   */
  this.hideAll = function () {
    jsTreePanel.jstree.hide_all();
  }

  /**
   * Search node identifiers using a predicate on nodes
   */
  this.searchNodeIds = function(nodes, predicate) {
    var filtered = [];
    $.map(nodes, function(node) {
      if (predicate(node)) {
        filtered.push(node.id);
      }
      if (node.children) {
        filtered = filtered.concat(jsTreePanel.searchNodeIds(node.children, predicate));
      }
    });
    return filtered;
  }

  /**
  * Hide all nodes except the given nodes, their parents and their children
  */
  this.showOnly = function(requiredNodeIds) {
    treeBuilder.getAllNodeIds().then(function(allNodeIds) {
      var shownNodeIds = [];
      var hiddenNodeIds = [];
      $.map(allNodeIds, function(nodeId) {
        if(requiredNodeIds.indexOf(nodeId) !== -1) {
          var node = jsTreePanel.jstree.get_node(nodeId);
          shownNodeIds.push(nodeId);
          if (node.children_d) shownNodeIds = shownNodeIds.concat(node.children_d);
          if (node.parents) shownNodeIds = shownNodeIds.concat(node.parents);
        } else {
          hiddenNodeIds.push(nodeId);
        }
      });
      // using setTimeout to delay DOM modifications (reducing UI blocking)
      setTimeout(function() {
        $.map(hiddenNodeIds, function(nodeId) {
          if(!Arrays.contains(shownNodeIds, nodeId)) {
            jsTreePanel.jstree.hide_node(nodeId);
            jsTreePanel.jstree.deselect_node(nodeId);
          }
        });
      }, 0);
      setTimeout(function() {
        $.map(shownNodeIds, function(nodeId) {
          jsTreePanel.jstree.show_node(nodeId);
        });
      }, 0);
    });
  }

  /**
   * Get identifiers of selected nodes
   */
  this.getSelectedNodeIds = function() {
    return jsTreePanel.jstree.get_selected();
  }

  /**
   * Get identifiers of selected leaf nodes
   */
  this.getSelectedLeafIds = function() {
    return $.grep(jsTreePanel.getSelectedNodeIds(), function(id) {
      var node = jsTreePanel.jstree.get_node(id);
      return (!node.children.length && node.state.selected);
    });
  }

  /**
   * Get deferred list of node ids
   */
  this.getAllNodeIds = treeBuilder.getAllNodeIds;

};
