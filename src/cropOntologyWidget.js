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
 * @author Cyril Pommier
 * 
 */
/*
 * 
 * Extension of code from http://alexmarandon.com/articles/web_widget_jquery/  
 * 
 */

/*
 * TODO : try to do this with shadow DOM
 */
/*
(function(){
	

})();
*/
(
		function(factory) {
			"use strict";
			if (typeof define === 'function' && define.amd) {
				define([ 'jquery' ], factory);
			} else if (typeof module !== 'undefined' && module.exports) {
				module.exports = factory(require('jquery'));
			} else {
				factory(jQuery);
			}
		}
		

		(
				function($, undefined) {
					"use strict";
					//TODO: This var must be set according to the enclosing page. To adjust
//					var libLocalPath="../common/javaScript/brapiOntoWidget/"
					var libLocalPath=location.pathname+"/";
					

					// prevent another load? maybe there is a better way?
					if ($.cropOntologyWidget) {
						return;
					}

					// Localize jQuery variable
					var jQuery;
					var cropOntologyTreeWidgetSrc ;
					var showCheckBoxes;

					$.cropOntologyWidget = {
							version : '1',

							defaults : {
								cropOntologyTreeWidgetSrc : "Provide json URL",
								showCheckBoxes : false
							}
					};

					function libraryLoader() {
		/** ****** Load jQuery if not present ******** */
//		if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.11.3') {
		if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.11.3') {
			var script_tag = document.createElement('script');
			script_tag.setAttribute("type", "text/javascript");
			script_tag.setAttribute("src", libLocalPath+"lib/jquery.js");
			// TODO: use min version of the lib ASAP
			if (script_tag.readyState) {
				script_tag.onreadystatechange = function() { // For old  versions of IE
					if (this.readyState == 'complete'
						|| this.readyState == 'loaded') {
						scriptLoadHandler();
					}
				};
			} else { // Other browsers
				script_tag.onload = scriptLoadHandler();

			}
			// Try to find the head, otherwise default to the
			// documentElement
			(document.getElementsByTagName("head")[0] || document.documentElement)
			.appendChild(script_tag);
			loadJsTree();
		} else {
			// The jQuery version on the window is the one we want to
			// use
			jQuery = window.jQuery;
			loadJsTree();
		}

	}
	
	window.libraryloader = libraryLoader;
	function loadJsTree(){
		/** ****** Load jStree if not present ******** */
		/*
		 * DRY violated here to clean when possible
		 */
		// window.jQuery likely mistake, use $ ?
//		if (jQuery.jstree === undefined
//		|| jQuery.jstree.version !== '3.2.1') {
		var script_tag_jstree = document.createElement('script');
		script_tag_jstree.setAttribute("type", "text/javascript");
		script_tag_jstree.setAttribute("src", libLocalPath+"lib/jstree.min.js");
		if (script_tag_jstree.readyState) {
			script_tag_jstree.onreadystatechange = function() { // For
				// old
				// versions of
				// IE
				if (this.readyState == 'complete'
					|| this.readyState == 'loaded') {
					scriptLoadHandler();
				}
			};
		} else { // Other browsers
			script_tag_jstree.onload = scriptLoadHandler;
		}
		// Try to find the head, otherwise default to the
		// documentElement
		(document.getElementsByTagName("head")[0] || document.documentElement)
		.appendChild(script_tag_jstree);
//		} else {
//		// The jQuery version on the window is the one we want to
//		// use
//		jQuery.jstree = jQuery.jstree;
////		main();
//		}
		/** ***** Load CSS ****** */
		var css_link = $(
				"<link>",
				{
					rel : "stylesheet",
					type : "text/css",
					href : libLocalPath+"lib/themes/default/style.min.css"
				});
		css_link.appendTo('head');
		var css_link = $(
				"<link>",
				{
					rel : "stylesheet",
					type : "text/css",
					href : libLocalPath+"cropOntologyWidget.css"
				});
		css_link.appendTo('head');

	}
	window.loadJsTree = loadJsTree;

//	libraryLoader();
	
	/** ****** Called once jQuery has loaded ***** */
	function scriptLoadHandler() {
		// Restore $ and window.jQuery to their previous values and
		// store the
		// new jQuery in our local jQuery variable
		jQuery = window.jQuery.noConflict(true);
		// Call our main function
		// main();
	}
					

					$.fn.cropOntologyWidget = function(arg) {

						// check for string argument
//						var is_method = (typeof arg === 'string'), args = Array.prototype.slice
//						.call(arguments, 1), result = null;
//						if (arg === true && !this.length) {
//						return false;
//						}
//						this.each(function() {
//						// get the instance (if there is one) and method (if it
//						// exists)
//						var instance = $.jstree.reference(this), method = is_method
//						&& instance ? instance[arg] : null;
//						// if calling a method, and method is available - execute on
//						// the instance
//						result = is_method && method ? method.apply(instance, args)
//						: null;
//						// if there is no instance and no method is being called -
//						// create one
//						if (!instance && !is_method
//						&& (arg === undefined || $.isPlainObject(arg))) {
//						$.jstree.create(this, arg);
//						}
//						// if there is an instance and no method is called - return
//						// the instance
//						if ((instance && !is_method) || arg === true) {
//						result = instance || false;
//						}
//						// if there was a method call which returned a result -
//						// break and return the value
//						if (result !== null && result !== undefined) {
//						return false;
//						}
//						});
						libraryLoader();
						// Restore $ and window.jQuery to their previous values and
						// store the
						// new jQuery in our local jQuery variable
						// already done correcly in library loader
//						jQuery = window.jQuery.noConflict(true);

						if (arg.cropOntologyTreeWidgetSrc !== undefined){
							cropOntologyTreeWidgetSrc = arg.cropOntologyTreeWidgetSrc;
						}
						if (arg.showCheckBoxes !== undefined){
							showCheckBoxes = arg.showCheckBoxes;
						}


						// Call our main function
						main();
						// if there was a method call with a valid return value - return
						// that, otherwise continue the chain
//						return result !== null && result !== undefined ? result : this;
					};



					/** ****** Our main function ******* */
					function main() {
						jQuery(document)
						.ready(function($) {
							// TODO: All library handling must be perfected, Have a look
							// at bower for that.

							

							/** ***** Load tree ****** */
							var request = $.getJSON(cropOntologyTreeWidgetSrc);
							var ontologyJson;

							request.complete(function() {

								ontologyJson = request.responseText;

								// 6 create an instance when the
								// DOM is ready
								$('#brapiCropOntoWidget').addClass("ontology-widget");
								$('#brapiCropOntoWidget').append('<div id ="brapiCropOntoWidget-tree-box" class="treeBox" ></div>');
								$('#brapiCropOntoWidget-tree-box').append('<h2>Traits, methods and scales</h2>');
								$('#brapiCropOntoWidget-tree-box').append('<div id ="brapiCropOntoWidget-tree" class="tree" ></div>');
								
								$('#brapiCropOntoWidget-tree')
								.jstree(
										{
											"core" : {
												'data' : $
												.parseJSON(ontologyJson),
												"themes" : {
													"variant" : "large",
													"icons" : false,
													"stripes" : true,
													"expand_selected_onload" : true
												}
											},
											"checkbox" : {
												"keep_selected_style" : false,
												"visible" : showCheckBoxes
											},
											"plugins" : ["wholerow","checkbox" ]
										});
								// 7 bind to events triggered on
								// the tree
								$('#brapiCropOntoWidget-tree')
														.on('activate_node.jstree',
																function(node,
																		data) {
																	displayDetails(data);
																});

							});
							$('#brapiCropOntoWidget').append('<div id ="brapiCropOntoWidget-details-box" class="details"></div>');
							$('#brapiCropOntoWidget-details-box').append('<h2>Details</h2>');
							$('#brapiCropOntoWidget-details-box').append('<div id ="brapiCropOntoWidget-details" class="details-content"></div>');
							

						});
					}
					
					function displayDetails(data){
						var fullNode = $('#brapiCropOntoWidget-tree')
						.jstree(true).get_node(data.node.id);
						$('#brapiCropOntoWidget-details').empty();
						appendDetails("Variable name", fullNode.data.VariableName);
						appendDetails("Variable ID", fullNode.data.VariableID);
						appendDetails("Short name", fullNode.data.VariableShortName);
						appendDetails("Description", fullNode.data.Description);
						appendDetails("Unit", fullNode.data.Unit);
					}
					
					function appendDetails(text, data){
						if (data != null){
							$('#brapiCropOntoWidget-details').append('<div class="detail-element"><span>'+text+": </span> "+data+"</div>");
						}
					}

					function getSelectedNodeIds(){
						return $("#brapiCropOntoWidget-tree").jstree('get_selected');
					}

					window.getSelectedNodeIds = getSelectedNodeIds;

				}
		)
);


