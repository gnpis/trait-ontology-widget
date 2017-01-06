/**
 *
 */

// Array contains
function contains(arr, item) {
	return arr.indexOf(item) !== -1;
}

/**
 * Transforms a Breeding API ontology into a jstree root node
 */
function ontologyAsRootNode(ontology) {
  return {
    "id": ontology.ontologyDbId,
    "parent": "#",
    "text": ontology.ontologyName,
    "data": ontology
  };
}

/**
 * Transforms a Breeding API variables into a jstree nodes for the trait class,
 * the trait and variable
 */
function variableAsNodes(variable) {
  var nodes = [];
  var traitClassIds = [];
  var traitIds = [];

  var variableParent = variable.ontologyDbId;

  // Variable display name
  var variableText = variable.name;
  if (variable.synonyms && variable.synonyms.length) {
    variableText += ": " + variable.synonyms[0];
  }

  // If has a trait
  if (variable.trait) {
    var traitParent = variable.ontologyDbId;
    var traitId = variable.trait.traitDbId;
    variableParent = traitId;

    // If has a trait class
    var traitClass = variable.trait.class;
    if (traitClass) {
      var traitClassId = variable.ontologyDbId + ":" + traitClass;
      traitParent = traitClassId;

      // Test to avoid duplicate trait class node
      if (!contains(traitClassIds, traitClassId)) {
        traitClassIds.push(traitClassId);

        // Add trait class node
        nodes.push({
          "id": traitClassId,
          "parent": variable.ontologyDbId,
          "text": traitClass,
					"state": { "opened": true },
          "data": { "name": traitClass }
        });
      }
    }

    // Test to avoid duplicate trait node
    if (!contains(traitIds, traitId)) {
      traitIds.push(traitId);

      // Add trait node
      nodes.push({
        "id": traitId,
        "parent": traitParent,
        "text": variable.trait.name,
        "data": variable.trait
      });
    }
  }

  // Add variable node
  nodes.push({
    "id": variable.observationVariableDbId,
    "parent": variableParent,
    "text": variableText,
    "data": variable
  });

  return nodes;
}

module.exports = {
  ontologyAsRootNode: ontologyAsRootNode,
  variableAsNodes: variableAsNodes
};
