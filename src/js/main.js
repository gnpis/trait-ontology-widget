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
  useSearchField: false,
  createDiv: false
}

global.CropOntologyWidget = function(selector, options) {
  "use strict";
  var widget = this;

  // Options
  this.showCheckBoxes = options.showCheckBoxes || defaultOptions.showCheckBoxes;
  this.useSearchField = options.useSearchField || defaultOptions.useSearchField;
  this.createDiv = options.createDiv === true || defaultOptions.createDiv;
  this.breedingAPIEndpoint = options.breedingAPIEndpoint;
  if(!this.breedingAPIEndpoint) {
    throw "Cannot initialize CropOntologyWidget. Missing parameter 'breedingAPIEndpoint'.";
  }

  // Initialize details panel (right pane)
  var detailsPanel = this.detailsPanel = new DetailsPanel();

  // Initialize jsTree panel (left pane)
  var jsTreePanel = this.jsTreePanel = new JSTreePanel(widget);
  jsTreePanel.initializeJSTree();

  // Display details on click
  jsTreePanel.addClickHandler(detailsPanel.displayItem);

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
   * Set selected nodes by identifiers
   */
  this.setSelectedNodeIds = jsTreePanel.setSelectedNodeIds;

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

  if (widget.createDiv) {
    widget.$root = $('<div id="'+selector+'">');
    widget.$root.addClass("ontology-widget");
    widget.$root.append(jsTreePanel.getElement());
    widget.$root.append(detailsPanel.getElement());
  }

  // Attach components on the DOM when ready
  $(global.document).ready(function() {
    if (!widget.createDiv) {
      widget.$root = $(selector);
      if (widget.$root.length === 0) {
        throw "Cannot initialize CropOntologyWidget. Cannot find element '" + selector + "'.";
      }
      widget.$root.addClass("ontology-widget");
      widget.$root.append(jsTreePanel.getElement());
      widget.$root.append(detailsPanel.getElement());
    }


    // Split URL to get termIdentifier
    var url = window.location.href;
    var urlSplit = url.split('termIdentifier=');

    var termID = null;
    if (urlSplit.length > 1) {
      termID = urlSplit[1];
    }

    if (termID != null) {
      detailsPanel.displayInfo("Loading " + termID + " details");

      jsTreePanel.getAllNodeIds().then(function() {
        var targetNode = jsTreePanel.jstree.get_node(termID);
        if (!targetNode) {
          detailsPanel.displayError("Variable " + termID + " doesn't exists");
        } else {
          jsTreePanel.setSelectedNodeIds([termID]);
          detailsPanel.displayItem(null, targetNode);
        }
      });

    }
  });

  return this;
}
