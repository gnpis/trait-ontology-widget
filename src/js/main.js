/**
 * @author Cyril Pommier, Raphael Flores, Guillaume Cornut
 *
 * Inspired from http://alexmarandon.com/articles/web_widget_jquery/
 * Using Node/NPM dependencies with browserify
 */

// Require jQuery
var $ = require("jquery");

var JSTreePanel = require('./ui/JSTreePanel');
var DetailsPanel = require('./ui/DetailsPanel');

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
    throw "Cannot initialize CropOntologyWidget. Cannot find element '"+selector+"'.";
  }
  this.$root.addClass("ontology-widget");

  // Initialize jsTree panel (left pane)
  var jsTreePanel = this.jsTreePanel = new JSTreePanel(widget);
  this.$root.append(jsTreePanel.getElement());

  // Initialize details panel (right pane)
  var detailsPanel = this.detailsPanel = new DetailsPanel(widget);
  this.$root.append(detailsPanel.getElement());

  jsTreePanel.initializeJSTree();

  // Display details on click
  jsTreePanel.addClickHandler(function($targetElement, targetNode) {
    detailsPanel.displayItem($targetElement, targetNode);
  });

  // Methods below

  /**
  * Show all nodes
  */
  this.showAll = jsTreePanel.showAll;

  /**
   * Hide all nodes
   */
  this.hideAll = jsTreePanel.hideAll;

  /**
   * Search node identifiers using a predicate on nodes
   */
  this.searchNodeIds = jsTreePanel.searchNodeIds;

  /**
  * Hide all nodes except the given nodes, their parents and their children
  */
  this.showOnly = jsTreePanel.showOnly;

  /**
   * Add a node selection change handler function
   */
  this.addSelectionChangeHandler = jsTreePanel.addSelectionChangeHandler;

  /**
   * Get identifiers of selected nodes
   */
  this.getSelectedNodeIds = jsTreePanel.getSelectedNodeIds;

  /**
   * Get identifiers of selected leaf nodes
   */
  this.getSelectedLeafIds = jsTreePanel.getSelectedLeafIds;

  /**
   * Reset node checkbox selection
   */
  this.resetSelection = jsTreePanel.resetSelection;

  /**
   * Reset the widget (reset details panel, search field, node selection, opened nodes)
   */
  this.reset = function() {
    detailsPanel.clear();
    jsTreePanel.reset();
  }

}
