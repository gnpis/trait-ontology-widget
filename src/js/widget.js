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
 * Extension of code from http://alexmarandon.com/articles/web_widget_jquery/
 * TODO : try to do this with shadow DOM
 */

// Require jQuery & jsTree
var $ = require("jquery");
require("jstree");

var defaultOptions = {
	showCheckBoxes: false,
	useSearchField: false
}

global.CropOntologyWidget = function(selector, options) {
	"use strict";

	this.version = '1';
	var widget = this;
	this.basePath;

	// Options
	this.showCheckBoxes = options.showCheckBoxes || defaultOptions.showCheckBoxes;
	this.useSearchField = options.useSearchField || defaultOptions.useSearchField;
	this.ontologyRepositoryFile = options.ontologyRepositoryFile;
	if(!this.ontologyRepositoryFile) {
		console.log("ERROR: Cannot initialize CropOntologyWidget. Missing parameter 'ontologyRepositoryFile'.");
		return;
	}
	this.ontologyBasePath = dirname(this.ontologyRepositoryFile);

	$("script").each(function (i, script) {
		var path = $(script).attr("src");
		if (path && path.match(/cropOntologyWidget(\.min)?\.js$/)) {
			widget.basePath = dirname(path);
			return false;
		}
	});
	if (this.basePath === undefined) {
		console.log("Warning: Cannot load CropOntologyWidget CSS: Unable to find base path.");
	} else {
		// Load required CSS
		loadCSS(this.basePath + "/css/themes/default/style.min.css");
		loadCSS(this.basePath + "/css/cropOntologyWidget.css");
	}

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

	function hideRecusivly(node) {
		widget.jstree.hide_node(node.id);
		widget.jstree.deselect_node(node.id);
		if (node.children && node.children.length > 0) {
			setTimeout(function () {
				$.map(node.children, hideRecusivly);
			}, 0);
		}
	}
	function clearDetails() {
		widget.$detailList.empty();
	}
	function appendDetails(text, data) {
		if (data) {
			widget.$detailList.append("<dt>" + text + "</dt><dd>" + data + "</dd>");
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
	this.showOnlyParents = function(nodeIds) {
		widget.showAll();
		$.map(widget.jstree.get_json(), function(node) {
			var hide = true;
			$.each(nodeIds, function(i, requiredID) {
				if (node.id === requiredID) {
					return hide = false;
				}
			});
			if (hide) {
				hideRecusivly(node);
			}
		});
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

function loadCSS(href) {
	$("<link>", {rel: "stylesheet", type: "text/css", href: href}).appendTo('head');
}

function dirname(path) {
	var dir = path.replace(/\/[^\/]*\/?$/, '');
	if (dir === path) return "";
	return dir;
}
