const $ = require('jquery')

import { Arrays } from '../utils'
import { BreedingAPIClient } from '../api/BreedingAPIClient'

export class TreeBuilder {

  constructor(widget) {
    this.widget = widget
    this.breedingAPIClient = new BreedingAPIClient(widget.breedingAPIEndpoint)

    this.ontologyDbIds = []
    this.traitClassIds = []
    this.traitIds = []
    this.allNodeIds = []

    this.deferredNodeIds = $.Deferred()
  }

  /**
   * Deferred list of all node identifiers (resolved when the tree has
   * been entirely built with `this.buildTree()`)
   */
  getAllNodeIds() {
    return this.deferredNodeIds
  }

  /**
   * Asynchronously loads jstree nodes from Breeding API ontologies & varaibles
   */
  buildTree(callback) {
    // Fetch all ontologies
    var ontologiesRequest = this.breedingAPIClient.fetchOntologies()

    // Fetch all variables
    var variablesRequest = this.breedingAPIClient.fetchVariables()

    // Ontology list request worked (load ontology & then variables)
    ontologiesRequest.done((ontologies) => {
      var rootNodes = $.map(ontologies, (ontology) => {
          var ontologyRootNode = this.ontologyAsRootNode(ontology)
          this.ontologyDbIds.push(ontologyRootNode.id)
          this.allNodeIds.push(ontologyRootNode.id)
          return ontologyRootNode
      })
      callback(rootNodes)
      this.displayVariables(variablesRequest)
    })

    // Ontology list request failed (just load variables without ontology metadata)
    ontologiesRequest.fail(() => {
      // Display empty tree
      callback([])
      // Load variables separatly because jstree can't handle more than 1500 nodes at once
      this.displayVariables(variablesRequest)
    })
  }

  /*
   * Create and display variable nodes
   */
  displayVariables(variablesRequest) {
    // Wait for jstree to be ready & Variables to be loaded
    var ready = $.when(this.widget.jsTreePanel.treeReady(), variablesRequest)

    // Success
    ready.done((readyEvent, variables) => {

      var childNodes = $.map(variables, (variable) => this.variableAsNodes(variable))
      // Add nodes to tree
      $.map(childNodes, (childNode) => {
        this.allNodeIds.push(childNode.id)
        this.widget.jsTreePanel.jstree.create_node(childNode.parent, childNode)
      })

      this.deferredNodeIds.resolve(this.allNodeIds)
    })

    // Failure
    ready.fail(this.deferredNodeIds.reject)
  }

  /**
   * Transforms a Breeding API variable into jstree nodes for the trait class,
   * the trait and variable
   */
  variableAsNodes(variable) {
    var nodes = []

    // Skip variables that are not in english (null values are accepted)
    // Language selection is planned (issue gnpis/trait-ontology-widget#4)
    if (variable.language && variable.language.toUpperCase() !== 'EN') {
      return nodes
    }

    var baseNodeData = {
      'ontologyDbId': variable['ontologyDbId'],
      'ontologyName': variable['ontologyName']
    }

    var ontologyDbId = variable.ontologyDbId
    // Test to avoid duplicate ontology node
    if (!Arrays.contains(this.ontologyDbIds, ontologyDbId)) {
      this.ontologyDbIds.push(ontologyDbId)

      // Add ontology node
      nodes.push(ontologyAsRootNode(baseNodeData))
    }

    var variableParent = ontologyDbId

    // Variable display name
    var variableText = variable.name
    if (variable.synonyms && variable.synonyms.length) {
      variableText += ': ' + variable.synonyms[0]
    }

    // If has a trait
    var trait = variable.trait
    if (trait) {
      var traitParent = ontologyDbId
      var traitId = trait.traitDbId
      variableParent = traitId

      // If has a trait class
      var traitClass = trait.class
      if (traitClass) {
        traitClass = traitClass.trim()
        var traitClassId = ontologyDbId + ':' + traitClass
        traitParent = traitClassId

        // Test to avoid duplicate trait class node
        if (!Arrays.contains(this.traitClassIds, traitClassId)) {
          this.traitClassIds.push(traitClassId)

          // Add trait class node
          nodes.push({
            'id': traitClassId,
            'parent': ontologyDbId,
            'text': traitClass,
            'data': $.extend({}, baseNodeData, {
              'name': traitClass,
            }),
            'type': 'traitClass'
          })
        }
      }

      // Test to avoid duplicate trait node
      if (!Arrays.contains(this.traitIds, traitId)) {
        this.traitIds.push(traitId)

        // Add trait node
        nodes.push({
          'id': traitId,
          'parent': traitParent,
          'text': trait.name,
          'data': $.extend({}, baseNodeData, trait),
          'type': 'trait'
        })
      }
    }

    // Add variable node
    nodes.push({
      'id': variable.observationVariableDbId,
      'parent': variableParent,
      'text': variableText,
      'data': variable,
      'type': 'variable',
    })

    return nodes
  }


  /**
   * Transforms a Breeding API ontology into a jstree root node
   */
  ontologyAsRootNode(ontology) {
    return {
      'id': ontology.ontologyDbId,
      'parent': '#',
      'text': ontology.ontologyName,
      'data': ontology,
      'type': 'ontology'
    }
  }
}
