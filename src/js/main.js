/**
 * @author Cyril Pommier, Raphael Flores, Guillaume Cornut
 *
 * Inspired from http://alexmarandon.com/articles/web_widget_jquery/
 * Using Node/NPM dependencies with browserify
 */

// Require jQuery
const $ = require('jquery')

import JSTreePanel from './ui/JSTreePanel'
import DetailsPanel from './ui/DetailsPanel'

const DEFAULT_OPTIONS = {
  showCheckBoxes: false,
  useSearchField: false,
  createDiv: false
}

export class CropOntologyWidget {
    constructor(selector, options) {
      // Options (overide the defaults with options given)
      this.options = {...DEFAULT_OPTIONS, ...options}
      if(!this.options.breedingAPIEndpoint) {
        throw "Cannot initialize CropOntologyWidget. Missing parameter 'breedingAPIEndpoint'."
      }

      // Initialize details panel (right pane)
      this.detailsPanel = new DetailsPanel(this)

      // Initialize jsTree panel (left pane)
      this.jsTreePanel = new JSTreePanel(this)

      if (this.options.createDiv) {
        this.$root = $(`<div id="${selector}">`)
        this.$root.addClass('ontology-widget')
        this.$root.append(this.jsTreePanel.getElement())
        this.$root.append(this.detailsPanel.getElement())
      }

      // Attach components on the DOM when ready
      $(global.document).ready(() => {
        if (!this.options.createDiv) {
          this.$root = $(selector)
          if (this.$root.length === 0) {
            throw `Cannot initialize CropOntologyWidget. Cannot find element '${selector}'.`
          }
          this.$root.addClass("ontology-widget")
          this.$root.append(this.jsTreePanel.getElement())
          this.$root.append(this.detailsPanel.getElement())
        }

        // Split URL to get termIdentifier
        let url = window.location.href
        let [_, termID] = url.split('termIdentifier=')

        // Loading
        this.$root.addClass('loading')
        if (termID) {
          this.detailsPanel.displayMessage('loading', `Loading ${termID} details...`)
        } else {
          this.detailsPanel.displayMessage('loading', 'Loading ontologies and variables...')
        }

        // Load tree
        this.jsTreePanel.load().then(() => {
          // Then
          this.detailsPanel.clear()
          this.$root.removeClass('loading')

          if (termID) {
            let targetNode = this.jsTreePanel.jstree.get_node(termID)
            if (!targetNode) {
              this.detailsPanel.displayMessage('error', `Variable ${termID} doesn't exists`)
            } else {
              this.jsTreePanel.setSelectedNodeIds([termID])
            }
          }

          // Display details on click
          this.jsTreePanel.addClickHandler(
            (_, node) => this.onClickNode(node)
          )
        }).catch(() => {
          this.$root.removeClass('loading')
          this.detailsPanel.displayMessage('error',
            'An error occured while contacting Breeding API endpoint: ' +
            this.breedingAPIEndpoint
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
     * Set max height of the widget
     */
    setHeight(height) {
      this.height = height

      let $treeBox = this.jsTreePanel.$treeBox
      let $tree = this.jsTreePanel.$tree
      let treeHeight = height - ($tree.offset().top - $treeBox.offset().top)
      $tree.css('height', treeHeight)

      let $detailsBox = this.detailsPanel.$detailsBox
      let $details = this.detailsPanel.$details
      let detailsHeight = height - ($details.offset().top - $detailsBox.offset().top)
      $details.css('max-height', detailsHeight)

      if (!this.jsTreePanel.isLoaded()) {
        this.jsTreePanel.load().then(() => {
          this.setHeight(height)
        })
      }
    }

    /**
     * Actions on tree node click
     */
    onClickNode(node) {
      this.detailsPanel.displayItem(node)
      setTimeout(() => {
        this.jsTreePanel.onClickTreeNode(node)
      }, 100)
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
