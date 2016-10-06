/*
 * Copyright (c) 2015, INRA
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  * Neither the name of trait-ontology-widget nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * @author Cyril Pommier, Raphael Flores, Guillaume Cornut
 *
 * Inspired from http://alexmarandon.com/articles/web_widget_jquery/
 * Using Node/NPM dependencies with browserify
 */

// Require jQuery & jsTree
var $ = require("jquery");
require("jstree");

var defaultOptions = {
	showCheckBoxes: false,
	useSearchField: false
}

// Array contains
function contains(arr, item) {
	return arr.indexOf(item) !== -1;
}
// Array remove
function remove(arr, item) {
	arr.splice(arr.indexOf(item), 1);
}

global.CropOntologyWidget = function(selector, options) {
	"use strict";

	this.version = '1';
	var widget = this;

	// Options
	this.showCheckBoxes = options.showCheckBoxes || defaultOptions.showCheckBoxes;
	this.useSearchField = options.useSearchField || defaultOptions.useSearchField;
	this.ontologyRepositoryFile = options.ontologyRepositoryFile;
	if(!this.ontologyRepositoryFile) {
		console.log("ERROR: Cannot initialize CropOntologyWidget. Missing parameter 'ontologyRepositoryFile'.");
		return;
	}
	this.ontologyBasePath = dirname(this.ontologyRepositoryFile);

	// Build Components
	this.$root = $(selector);
	if (this.$root.size() === 0) {
		console.log("ERROR: Cannot initialize CropOntologyWidget. Cannot find element '"+selector+"'.");
		return;
	}

	this.$root.addClass("ontology-widget");
	this.$treeBox = $('<div class="treeBox" ></div>');
	this.$root.append(this.$treeBox);

	this.$treeBox.append('<h2>Traits, methods and scales</h2>');

	this.$searchBox = $('<div class="searchBox"></div>');
	this.$treeBox.append(this.$searchBox);

	this.$tree = $('<div class="tree"></div>');
	this.$treeBox.append(this.$tree);

	this.$details = $('<div class="details"></div>');
	this.$details.append('<h2>Details</h2>');
	this.$root.append(this.$details);

	this.$detailList = $('<dl></dl>');
	this.$details.append(this.$detailList);

	var allNodeIds = [];
	function loadOntologyData(self, cb) {
		var ontologyTerms = [];
		// Load Ontology repository JSON
		$.getJSON(widget.ontologyRepositoryFile)
			.then(function(ontologyRepository) {
				// Load all ontology JSON from ontology repository
				return $.when.apply($, $.map(ontologyRepository, function(ontology) {
					return $.getJSON(widget.ontologyBasePath+"/"+ontology);
				}));
			}).then(function() {
				// Ontologies loaded
				function loadTerms(jsonResult) {
					if (jsonResult[1] === "success" && $.isArray(jsonResult[0])) {
						$.map(jsonResult[0], function (term) {
							if ($.isPlainObject(term)) {
								ontologyTerms.push(term);
								allNodeIds.push(term.id);
							}
						});
					}
				}
				if(typeof arguments[1] === "string") {
					// Only one ontology loaded
					loadTerms(arguments);
				} else {
					// Multiple ontologies
					$.map(arguments, loadTerms);
				}
				cb.call(self, ontologyTerms);
			});
	}

	var jsTreeOptions = {
		"core": {
			"themes": {
				"variant": "large", "icons": false,
				"stripes": true, "expand_selected_onload": true
			},
			"data": function (obj, cb) {
				loadOntologyData(this, cb);
			}
		},
		"checkbox": {
			"keep_selected_style": false,
			"visible": widget.showCheckBoxes
		},
		"plugins": ["checkbox"]
	};
	if (this.useSearchField) {
		this.$input = $('<input placeholder="Search terms..." class="treeSearch" type="text">');
		this.$searchBox.append(this.$input);
		jsTreeOptions["search"] = {
			"show_only_matches": true,
			"search_callback": function (searchText, node) {
				if (node.state && node.state.hidden === true) {
					return false;
				}
				if (node.text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
					return true;
				}
				/* Search in node data =>
				if (node.data) {
					for (var key in node.data) {
						var val = node.data[key];
						if (typeof val === "string" && val.indexOf(searchText) !== -1) {
							return true;
						}
					}
				}*/
				return false;
			}
		};
		jsTreeOptions["plugins"].push("search");

		var to = false;
		this.$input.keyup(function() {
			if (to) clearTimeout(to);
			to = setTimeout(function() {
				var v = widget.$input.val();
				widget.jstree.search(v);
			}, 250);
		});
	}
	this.$tree.jstree(jsTreeOptions);
	this.jstree = this.$tree.jstree(true);

	function clearDetails() {
		widget.$detailList.empty();
	}
	function formatKey(str) {
		return str
			// split camel case: insert a space before all caps
			.replace(/([A-Z][a-z])/g, ' $1')
			.toLowerCase().trim()
			// uppercaser first letter
			.replace(/^./, function(str){ return str.toUpperCase(); })
	}
	function appendDetails(text, data, optionalPrefix) {
		var prefix = optionalPrefix || "";
		if (data) {
			if (typeof data === 'string') {
				var key = formatKey(prefix + text);
				var value = data;
				widget.$detailList.append(
					'<div class="detail">'+
						'<div class="key">' + key + '</div>'+
						'<div class="value">' + data + '</div>'+
					'</div>'
				);
			} else if (typeof data === 'object') {
				$.each(data, function(t, d) {
					return appendDetails(t, d, prefix + text + " - ");
				});
			}
		}
	}
	this.$tree.on('activate_node.jstree', function (_, data) {
		clearDetails();
		var fullNode = widget.jstree.get_node(data.node.id);
		if (!fullNode.children.length) {
			appendDetails("Variable name", data.node.text);
		}
		$.each(fullNode.data, appendDetails);
	});

	this.showAll = function () {
		widget.jstree.show_all();
	}
	this.hideAll = function () {
		widget.jstree.hide_all();
	}
	/**
	 * Search node identifier using a predicate on nodes
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
				if (contains(hiddenNodeIds, nodeId)) {
					remove(hiddenNodeIds, nodeId);
				}
			} else if(!contains(shownNodeIds, nodeId)) {
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
	this.setSelectionChangeHandler = function(handler) {
		widget.$tree.on('changed.jstree', handler);
	}
	this.getSelectedNodeIds = function() {
		return widget.jstree.get_selected();
	}
	this.getSelectedLeafIds = function() {
		return $.grep(widget.getSelectedNodeIds(), function(id) {
			var node = widget.jstree.get_node(id);
			return (!node.children.length && node.state.selected);
		});
	}
	this.resetSelection = function() {
		widget.jstree.deselect_all();
	}
	this.reset = function(){
		widget.showAll();
		widget.$input.val("").trigger("keyup");
		widget.jstree.close_all();
	}

	return this;
}

function dirname(path) {
	var dir = path.replace(/\/[^\/]*\/?$/, '');
	if (dir === path) return "";
	return dir;
}
