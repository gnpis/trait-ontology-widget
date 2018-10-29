const $ = require('jquery')

import Arrays from '../utils/Arrays'
import BreedingAPIClient from '../api/BreedingAPIClient'

/**
 * Translate a node to a language
 */
export function getNodeText(node, language) {
  let translatedData = node.data[language]
  if (!translatedData) {
    // No translated data in the current language
    let otherLanguage = Object.getOwnPropertyNames(node.data)[0]
    translatedData = node.data[otherLanguage]
  }
  return nameGenerator(node.type, translatedData)
}

/**
 * Asynchronously loads jstree nodes from Breeding API ontologies & variables
 * @return deferred list of tree node
 */
export function buildTree(breedingAPIEndpoint) {
  let client = new BreedingAPIClient(breedingAPIEndpoint)

  // Fetch BrAPI ontologies, variables and create tree node out of them
  let ontologiesRequest = client.fetchOntologies().then(createOntologyNodes)
  let variablesRequest = client.fetchVariables().then(createVariableNodes)

  let allNodes = $.when(ontologiesRequest, variablesRequest)
    .then((ontologyNodes, variableNodes) => ontologyNodes.concat(variableNodes))
    .catch(() => variablesRequest)

  return allNodes.then(nodes => Arrays.distinctBy(nodes, n => n['id']))
}

// Set 'en' as the default language of the data (if not obtainable in data)
const DEFAULT_DATA_LANG = 'en'


function nameGenerator(type, data) {
  switch (type) {
    case 'ontology':
      return data.ontologyName
    case 'variable':
      return (data.synonyms && data.synonyms.length) ?
             `${data.name}: ${data.synonyms[0]}` :
              data.name
    default:
      return data.name
  }
}

/**
 * Transforms a Breeding API ontology into a jstree root node
 */
function createOntologyNode(ontology, languageCode=DEFAULT_DATA_LANG) {
  return {
    'id': ontology.ontologyDbId,
    'parent': '#',
    'data': {[languageCode.toLowerCase()]: ontology},
    'type': 'ontology'
  }
}
const createOntologyNodes = os => $.map(os, o => createOntologyNode(o))

/**
 * Create tree nodes from BrAPI variables
 */
function createVariableNodes(variables) {
  // Group variables
  let variableByIdByLang = Arrays.groupBy(
    variables,
    // By ID
    v => v['observationVariableDbId'],
    // By language (with DEFAULT_DATA_LANG as a default)
    v => (v['language'] || DEFAULT_DATA_LANG).toLowerCase()
  )

  // Transform to tree node
  return $.map(variableByIdByLang, createVariableNode)
}

/**
 * Transforms a Breeding API variable into jstree nodes for the trait class,
 * the trait and variable
 */
function createVariableNode(variableByLang) {
  let ontologyNode = {'data': {}}
  let traitNode = {'data': {}}
  let traitClassNode = {'data': {}}
  let variableNode = {'data': {}}

  for (let language in variableByLang) {
    let variable = variableByLang[language][0]

    // Ontology node
    let ontology = {
      'ontologyDbId': variable.ontologyDbId,
      'ontologyName': variable.ontologyName
    }
    if (!ontologyNode['id']) {
      ontologyNode = createOntologyNode(ontology, language)
    }
    ontologyNode['data'][language] = {...ontology}

    // Variable node
    if (!variableNode['id']) {
      variableNode['id'] = variable.observationVariableDbId
      variableNode['parent'] = ontologyNode['id']
      variableNode['type'] = 'variable'
    }
    variableNode['data'][language] = {...ontology, ...variable}

    // Trait node
    let trait = variable.trait
    if (trait) {
      if (!traitNode['id']) {
        traitNode['id'] = trait.traitDbId
        traitNode['parent'] = ontologyNode['id']
        traitNode['type'] = 'trait'
      }
      traitNode['data'][language] = {...ontology, ...trait}

      variableNode['parent'] = traitNode['id']

      // Trait class
      let traitClass = trait.class && trait.class.trim()
      if (traitClass) {
        if (! traitClassNode['id']) {
          traitClassNode['id'] = `${ontology.ontologyDbId}:${traitClass}`
          traitClassNode['parent'] = ontologyNode['id']
          traitClassNode['type'] = 'traitClass'
        }
        traitClassNode['data'][language] = {...ontology, 'name': traitClass}

        traitNode['parent'] = traitClassNode['id']
      }
    }
  }

  // List tree nodes in correct dependency order (parent-child node relation)
  let nodes = [ontologyNode]
  if (traitClassNode['id']) nodes.push(traitClassNode)
  if (traitNode['id']) nodes.push(traitNode)
  nodes.push(variableNode)
  return nodes
}
