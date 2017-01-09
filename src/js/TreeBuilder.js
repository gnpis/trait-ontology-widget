
var $ = require('jquery');
var Arrays = require('./utils').Arrays;
var BreedingAPIClient = require("./BreedingAPIClient");

/**
 * Transforms a Breeding API ontology into a jstree root node
 */
function ontologyAsRootNode(ontology) {
  return {
    "id": ontology.ontologyDbId,
    "parent": "#",
    "text": ontology.ontologyName,
    "data": ontology,
    "type": "ontology"
  };
}

/**
 * Transforms a Breeding API variable into jstree nodes for the trait class,
 * the trait and variable
 */
function variableAsNodes(variable, traitClassIds, traitIds) {
  var nodes = [];
  var baseNodeData = {
    "ontologyName": variable["ontologyName"]
  }

  var variableParent = variable.ontologyDbId;

  // Variable display name
  var variableText = variable.name;
  if (variable.synonyms && variable.synonyms.length) {
    variableText += ": " + variable.synonyms[0];
  }

  // If has a trait
  var trait = variable.trait;
  if (trait) {
    var traitParent = variable.ontologyDbId;
    var traitId = trait.traitDbId;
    variableParent = traitId;

    // If has a trait class
    var traitClass = trait.class;
    if (traitClass) {
      traitClass = traitClass.trim();
      var traitClassId = variable.ontologyDbId + ":" + traitClass;
      traitParent = traitClassId;

      // Test to avoid duplicate trait class node
      if (!Arrays.contains(traitClassIds, traitClassId)) {
        traitClassIds.push(traitClassId);

        // Add trait class node
        nodes.push({
          "id": traitClassId,
          "parent": variable.ontologyDbId,
          "text": traitClass,
          "data": $.extend({}, baseNodeData, {
            "name": traitClass,
          }),
          "type": "traitClass"
        });
      }
    }

    // Test to avoid duplicate trait node
    if (!Arrays.contains(traitIds, traitId)) {
      traitIds.push(traitId);

      // Add trait node
      nodes.push({
        "id": traitId,
        "parent": traitParent,
        "text": trait.name,
        "data": $.extend({}, baseNodeData, trait),
        "type": "trait"
      });
    }
  }

  // Add variable node
  nodes.push({
    "id": variable.observationVariableDbId,
    "parent": variableParent,
    "text": variableText,
    "data": variable,
    "type": "variable",
  });

  return nodes;
}

function treeReady(widget) {
  var deferred = $.Deferred();
  widget.$tree.on('ready.jstree', deferred.resolve);
  return deferred;
}

module.exports = function TreeBuilder(widget, allNodeIds) {
  var breedingAPIClient = new BreedingAPIClient(widget.breedingAPIEndpoint)

  var traitClassIds = [];
  var traitIds = [];

  /**
   * Loads jstree nodes from Breeding API ontologies & varaibles
   */
  this.buildTree = function(self, cb) {
    // Fetch all ontologies
    var ontologiesRequest = breedingAPIClient.fetchOntologies();

    // Fetch all variables
    var variablesRequest = breedingAPIClient.fetchVariables();

    ontologiesRequest.then(function(ontologies) {
      var rootNodes = [];

      // Add ontology root node
      $.map(ontologies, function(ontology) {
        var ontologyRootNode = ontologyAsRootNode(ontology);
        allNodeIds.push(ontologyRootNode.id);
        rootNodes.push(ontologyRootNode);
      });

      // Display root nodes (ontologies)
      cb.call(self, rootNodes);

      // Wait for jstree to be ready & Variables to be loaded
      $.when(treeReady(widget), variablesRequest).then(function(readyEvent, variables) {

        // Load variables separatly because jstree can't handle more than 1500 nodes at once
        $.map(variables, function(variable) {
          // Transform Breeding API variable into trait class, trait and variable nodes
          var childNodes = variableAsNodes(variable, traitClassIds, traitIds);

          // Add nodes to tree
          $.map(childNodes, function(childNode) {
            allNodeIds.push(childNode.id);
            var parent = childNode.parent;
            widget.jstree.create_node(parent, childNode);
          });
        });
      });
    });
  }
}
