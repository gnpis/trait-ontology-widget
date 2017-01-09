/**
 * @author Cyril Pommier, Raphael Flores, Guillaume Cornut
 *
 * Inspired from http://alexmarandon.com/articles/web_widget_jquery/
 * Using Node/NPM dependencies with browserify
 */

// Require jQuery & jsTree
var $ = require("jquery");
require("jstree");

var Arrays = require('./utils').Arrays;
var TreeBuilder = require('./TreeBuilder');
var DetailsPanel = require('./DetailsPanel');
var SearchField = require('./SearchField');

var defaultOptions = {
	showCheckBoxes: false,
	useSearchField: false
}

global.CropOntologyWidget = function(selector, options) {
	"use strict";
	var widget = this;

	// Options
	this.showCheckBoxes = options.showCheckBoxes || defaultOptions.showCheckBoxes;
	this.useSearchField = options.useSearchField || defaultOptions.useSearchField;
	this.breedingAPIEndpoint = options.breedingAPIEndpoint;
	if(!this.breedingAPIEndpoint) {
		throw "Cannot initialize CropOntologyWidget. Missing parameter 'breedingAPIEndpoint'.";
	}

	// Build Components
	this.$root = $(selector);
	if (this.$root.size() === 0) {
		throw "ERROR: Cannot initialize CropOntologyWidget. Cannot find element '"+selector+"'.";
	}

	this.$root.addClass("ontology-widget");
	this.$treeBox = $('<div class="treeBox" ></div>').appendTo(this.$root);

	this.$title = $('<h2>Traits, methods and scales</h2>');
	this.$treeBox.append(this.$title);

	this.$tree = $('<div class="tree"></div>');
	this.$treeBox.append(this.$tree);

	var allNodeIds = [];
	var treeBuilder = new TreeBuilder(widget, allNodeIds);

	// Base jstree options
	var jsTreeOptions = {
		"core": {
			"check_callback" : true,
			"themes": {
				"variant": "large", "icons": false,
				"stripes": true, "expand_selected_onload": true
			},
			"data": treeBuilder.buildTree
		},
		"checkbox": {
			"keep_selected_style": false,
			"visible": widget.showCheckBoxes
		},
		// Define types of nodes
		"types": {
			"ontology": {
				"valid_children": [ "trait", "traitClass", "variable" ],
				"a_attr": { "class": "ontology nodeLabeled" }
			},
			"traitClass": {
				"valid_children": [ "trait", "variable" ],
				"a_attr": { "class": "traitClass nodeLabeled" }
			},
			"trait": {
				"valid_children": [ "variable" ],
				"a_attr": { "class": "trait nodeLabeled" }
			},
			"variable": {
				"valid_children": [],
				"a_attr": { "class": "variable nodeLabeled" }
			}
		},
		"plugins": [ "checkbox", "types", "sort" ]
	};

	// Initialize search field if requested
	var searchField;
	if (this.useSearchField) {
		searchField = new SearchField(widget);
		jsTreeOptions["search"] = {
			"show_only_matches": true,
			"search_callback": searchField.searchCallback
		};
		jsTreeOptions["plugins"].push("search");
	}

	// Initialize details view
	var detailsPanel = new DetailsPanel(widget);

	widget.$tree.on('click', '.jstree-anchor', function (event) {
		var $target = $(event.target);
		var nodeId = $target.parents("li").eq(0).attr("id");
		var node = widget.jstree.get_node(nodeId);
		detailsPanel.display(node);

		// Update details panel on click on node (not on checkbox)
		if (!$target.is('.jstree-checkbox')) {

			//prevent node selection, just display details
			event.stopImmediatePropagation();
		}
	});

	this.$tree.jstree(jsTreeOptions);
	this.jstree = this.$tree.jstree(true);

	/**
	* Show all nodes
	*/
	this.showAll = function () {
		widget.jstree.show_all();
	}

	/**
	 * Hide all nodes
	 */
	this.hideAll = function () {
		widget.jstree.hide_all();
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
				filtered = filtered.concat(widget.searchNodeIds(node.children, predicate));
			}
		});
		return filtered;
	}

	/**
	* Hide all nodes except the given nodes, their parents and their children
	*/
	this.showOnly = function(requiredNodeIds) {
		var shownNodeIds = [];
		var hiddenNodeIds = [];
		$.map(allNodeIds, function(nodeId) {
			if(requiredNodeIds.indexOf(nodeId) !== -1) {
				var node = widget.jstree.get_node(nodeId);
				shownNodeIds.push(nodeId);
				if (node.children_d) shownNodeIds = shownNodeIds.concat(node.children_d);
				if (node.parents) shownNodeIds = shownNodeIds.concat(node.parents);
				if (Arrays.contains(hiddenNodeIds, nodeId)) {
					Arrays.remove(hiddenNodeIds, nodeId);
				}
			} else if(!Arrays.contains(shownNodeIds, nodeId)) {
				hiddenNodeIds.push(nodeId);
			}
		})
		// using setTimeout to delay DOM modifications (reducing UI blocking)
		setTimeout(function() {
			$.map(hiddenNodeIds, function(nodeId) {
				widget.jstree.hide_node(nodeId);
				widget.jstree.deselect_node(nodeId);
			});
		}, 0);
		setTimeout(function() {
			$.map(shownNodeIds, function(nodeId) {
				widget.jstree.show_node(nodeId);
			});
		}, 0);
	}

	/**
	 * Add a node selection change handler function
	 */
	this.addSelectionChangeHandler = function(handler) {
		widget.$tree.on('changed.jstree', handler);
	}

	/**
	 * Get identifiers of selected nodes
	 */
	this.getSelectedNodeIds = function() {
		return widget.jstree.get_selected();
	}

	/**
	 * Get identifiers of selected leaf nodes
	 */
	this.getSelectedLeafIds = function() {
		return $.grep(widget.getSelectedNodeIds(), function(id) {
			var node = widget.jstree.get_node(id);
			return (!node.children.length && node.state.selected);
		});
	}

	/**
	 * Reset node selection
	 */
	this.resetSelection = function() {
		widget.jstree.deselect_all();
	}

	/**
	 * Reset the widget (reset details panel, search field, node selection, opened nodes)
	 */
	this.reset = function() {
		detailsPanel.clear();
		if (searchField) searchField.clear();
		widget.resetSelection();
		widget.showAll();
		widget.jstree.close_all();
	}

	return this;
}
