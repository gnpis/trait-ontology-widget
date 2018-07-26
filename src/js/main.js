/**
 * @author Cyril Pommier, Raphael Flores, Guillaume Cornut
 *
 * Inspired from http://alexmarandon.com/articles/web_widget_jquery/
 * Using Node/NPM dependencies with browserify
 */

// Require jQuery
const $ = require("jquery")

import { JSTreePanel } from './ui/JSTreePanel'
import { DetailsPanel } from './ui/DetailsPanel'

const defaultOptions = {
  showCheckBoxes: false,
  useSearchField: false,
  createDiv: false
}

export class CropOntologyWidget {
    constructor(selector, options) {
      // Options
      this.showCheckBoxes = options.showCheckBoxes || defaultOptions.showCheckBoxes
      this.useSearchField = options.useSearchField || defaultOptions.useSearchField
      this.createDiv = options.createDiv === true || defaultOptions.createDiv
      this.breedingAPIEndpoint = options.breedingAPIEndpoint
      if(!this.breedingAPIEndpoint) {
        throw "Cannot initialize CropOntologyWidget. Missing parameter 'breedingAPIEndpoint'."
      }

      // Initialize details panel (right pane)
      this.detailsPanel = new DetailsPanel()

      // Initialize jsTree panel (left pane)
      this.jsTreePanel = new JSTreePanel(this)
      this.jsTreePanel.initializeJSTree()

      if (this.createDiv) {
        this.$root = $('<div id="'+selector+'">')
        this.$root.addClass("ontology-widget")
        this.$root.append(this.jsTreePanel.getElement())
        this.$root.append(this.detailsPanel.getElement())
      }

      // Attach components on the DOM when ready
      $(global.document).ready(() => {
        if (!this.createDiv) {
          this.$root = $(selector)
          if (this.$root.length === 0) {
            throw "Cannot initialize CropOntologyWidget. Cannot find element '" + selector + "'."
          }
          this.$root.addClass("ontology-widget")
          this.$root.append(this.jsTreePanel.getElement())
          this.$root.append(this.detailsPanel.getElement())
        }

        // Split URL to get termIdentifier
        var url = window.location.href
        var [_, termID] = url.split('termIdentifier=')

        if (termID) {
          this.detailsPanel.displayLoading("Loading " + termID + " details...")
        } else {
          this.detailsPanel.displayLoading("Loading ontologies and variables...")
        }

        this.jsTreePanel.getAllNodeIds().then(() => {
          if (termID) {
            var targetNode = this.jsTreePanel.jstree.get_node(termID)
            if (!targetNode) {
              this.detailsPanel.displayError("Variable " + termID + " doesn't exists")
            } else {
              this.jsTreePanel.setSelectedNodeIds([termID])
              this.detailsPanel.displayItem(null, targetNode)
            }
          } else {
            this.jsTreePanel.getAllNodeIds().then(() => this.detailsPanel.clear())
          }

          // Display details on click
          this.jsTreePanel.addClickHandler(
            ($item, node) => this.detailsPanel.displayItem($item, node)
          )
        })
      })

      // Delegate methods below

      /**
      * Show all nodes
      */
      this.showAll = this.jsTreePanel.showAll.bind(this.jsTreePanel)

      /**
       * Hide all nodes
       */
      this.hideAll = this.jsTreePanel.hideAll.bind(this.jsTreePanel)

      /**
       * Search node identifiers using a predicate on nodes
       */
      this.searchNodeIds = this.jsTreePanel.searchNodeIds.bind(this.jsTreePanel)

      /**
      * Hide all nodes except the given nodes, their parents and their children
      */
      this.showOnly = this.jsTreePanel.showOnly.bind(this.jsTreePanel)

      /**
       * Add a node selection change handler function
       */
      this.addSelectionChangeHandler = this.jsTreePanel.addSelectionChangeHandler.bind(this.jsTreePanel)

      /**
       * Get identifiers of selected nodes
       */
      this.getSelectedNodeIds = this.jsTreePanel.getSelectedNodeIds.bind(this.jsTreePanel)

      /**
       * Set selected nodes by identifiers
       */
      this.setSelectedNodeIds = this.jsTreePanel.setSelectedNodeIds.bind(this.jsTreePanel)

      /**
       * Get identifiers of selected leaf nodes
       */
      this.getSelectedLeafIds = this.jsTreePanel.getSelectedLeafIds.bind(this.jsTreePanel)

      /**
       * Reset node checkbox selection
       */
      this.resetSelection = this.jsTreePanel.resetSelection.bind(this.jsTreePanel)
    }

    /**
     * Reset the widget (reset details panel, search field, node selection, opened nodes)
     */
    reset() {
      this.detailsPanel.clear()
      this.jsTreePanel.reset()
    }
}
global.CropOntologyWidget = CropOntologyWidget
