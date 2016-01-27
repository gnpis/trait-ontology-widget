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
(function () {
	"use strict";

	window.errors = []
	function dump() { errors.push(arguments);console.error(arguments); }

	// Prevent multiple load
	if (window.CropOntologyWidget) return;

	/*
	 * Async load appropriate jQuery version without external conflict
	 */
	function loadjQuery(main) {
		function scriptLoadHandler() {
			main(window.jQuery.noConflict(true));
		}
		if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.11.3') {
			var script_tag = document.createElement('script');
			script_tag.setAttribute("type", "text/javascript");
			script_tag.setAttribute("src", "https://code.jquery.com/jquery-1.11.3.js");

			if (script_tag.readyState) {
				// For old  versions of IE
				script_tag.onreadystatechange = function() {
					if (this.readyState == 'complete' || this.readyState == 'loaded') {
						scriptLoadHandler();
					}
				};
			} else {
				// Other browsers
				script_tag.onload = scriptLoadHandler;
			}
			(document.getElementsByTagName("head")[0] || document.documentElement)
				.appendChild(script_tag);
		} else {
			main(window.jQuery);
		}
	}

	function loadCSS($, href) {
		$("<link>", {rel: "stylesheet", type: "text/css", href: href})
			.appendTo('head');
	}

	function dirname(path) {
		var dir = path.replace(/\/[^\/]*\/?$/, '');
		if (dir === path) return "";
		return dir;
	}

	var defaultOptions = {
		showCheckBoxes: false,
		useSearchField: false
	}

	/*
	 * Initialize CropOntologyWidget with jQuery
	 */
	function initialize($, widget) {
		// Find script base path
		$("script").each(function (i, script) {
			var path = $(script).attr("src");
			if (path && path.match(/cropOntologyWidget(\.min)?\.js$/)) {
				widget.basePath = dirname(path);
				return false;
			}
		});
		if (widget.basePath === undefined) {
			console.log("ERROR: Cannot initialize CropOntologyWidget. Unable to find base path.");
			return;
		}

		widget.$root = $(widget.selector);
		if (widget.$root.size() === 0) {
			console.log("ERROR: Cannot initialize CropOntologyWidget. Cannot find element '"+selector+"'.");
			return;
		}

		// Build Components
		widget.$root.addClass("ontology-widget");
		widget.$treeBox = $('<div class="treeBox" ></div>');
		widget.$root.append(widget.$treeBox);

		widget.$treeBox.append('<h2>Traits, methods and scales</h2>');

		widget.$searchBox = $('<div class="searchBox"></div>');
		widget.$treeBox.append(widget.$searchBox);


		widget.$tree = $('<div class="tree"></div>');
		widget.$treeBox.append(widget.$tree);

		widget.$details = $('<div class="details"></div>');
		widget.$details.append('<h2>Details</h2>');
		widget.$root.append(widget.$details);

		widget.$detailList = $('<dl></dl>');
		widget.$details.append(widget.$detailList);
		//$details.append('<div id ="brapiCropOntoWidget-details" class="details-content"></div>');

		// Load required CSS
		loadCSS($, widget.basePath + "/lib/themes/default/style.min.css");
		loadCSS($, widget.basePath + "/cropOntologyWidget.css");

		// Load JS tree
		var oldjQuery = window.jQuery;
		var old$ = window.$;
		window.jQuery = window.$ = $;
		$.ajaxSetup({async: false, cache: true});
		$.getScript(widget.basePath + "/lib/jstree.min.js", function () {
			$.ajaxSetup({async: true, cache: false});
			window.jQuery =oldjQuery;
			window.$ = old$;

			// Load data
			loadData($, widget);
		});
	}

	function loadData($, widget) {
		var ontologyTerms = [];

		// Load Ontology repository JSON
		$.getJSON(
			widget.ontologyRepositoryFile
		).then(function(ontologyRepository) {
			// Load all ontology JSON from ontology repository
			return $.when.apply($, $.map(ontologyRepository, function(ontology) {
				return $.getJSON(widget.ontologyBasePath+"/"+ontology, function (terms) {
					$.map(terms, function(term) {
						ontologyTerms.push(term);
					});
				});
			}));
		}).then(function () {
			// Ontologies loaded

			var coreOptions = {
				"data": ontologyTerms,
				"themes": {
					"variant": "large", "icons": false,
					"stripes": true, "expand_selected_onload": true
				}
			};
			var checkBoxOptions = {
				"keep_selected_style": false,
				"visible": widget.showCheckBoxes
			}

			if (!widget.useSearchField) {
				widget.$tree.jstree({
					"core": coreOptions,
					"checkbox": checkBoxOptions,
					"plugins": ["checkbox"]
				});
			} else {
				var $input = $('<input placeholder="Search terms..." class="treeSearch" type="text">');
				widget.$searchBox.append($input);
				widget.$tree.jstree({
					"core": coreOptions,
					"checkbox": checkBoxOptions,
					"search": {
						"show_only_matches": true
					},
					"plugins": ["checkbox", "search"]
				});

				var to = false;
				$input.keyup(function() {
					if (to) clearTimeout(to);

					to = setTimeout(function() {
						var v = $input.val();
						widget.$tree.jstree(true).search(v);
					}, 250);
				});
			}

			widget.$tree.on('activate_node.jstree', function (_, data) {
				widget.clearDetails();
				var fullNode = widget.$tree.jstree(true).get_node(data.node.id);
				$.each(fullNode.data, widget.appendDetails);
			});
		});
	}

	window.CropOntologyWidget = function(selector, options) {
		this.version = '1';
		this.basePath;

		// Components
		this.selector = selector;
		this.$root;
		this.$tree;
		this.$treeBox;
		this.$searchBox;
		this.$details;
		this.$detailList;

		// Options
		this.showCheckBoxes = options.showCheckBoxes || defaultOptions.showCheckBoxes;
		this.useSearchField = options.useSearchField || defaultOptions.useSearchField;
		this.ontologyRepositoryFile = options.ontologyRepositoryFile;
		if(!this.ontologyRepositoryFile) {
			console.log("ERROR: Cannot initialize CropOntologyWidget. Missing parameter 'ontologyRepositoryFile'.");
			return;
		}
		this.ontologyBasePath = dirname(this.ontologyRepositoryFile);

		// Public methods
		this.clearDetails = function() {
			widget.$detailList.empty();
		}
		this.appendDetails = function(text, data) {
			if (data) {
				widget.$detailList.append("<dt>" + text + "</dt><dd>" + data + "</dd>");
			}
		}
		this.getSelectedNodeIds = function(){
			return widget.$tree.jstree('get_selected');
		}

		// Delayed initialization with jQuery
		var widget = this;
		loadjQuery(function($) { initialize($, widget) });

		// End of CropOntologyWidget constructor
		return this;
	}
})();
