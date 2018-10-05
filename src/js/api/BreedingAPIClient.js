const $ = require('jquery')

import { whenAll, isEmpty } from '../utils'

export default class BreedingAPIClient {

  constructor(breedingAPIEndpoint) {
    this.breedingAPIEndpoint = breedingAPIEndpoint
  }

  /**
  * Asynchronously load list of observation variable ontologies of a BreedingAPI endpoint
  */
  fetchOntologies() {
    return fetchAllPages(this.breedingAPIEndpoint, "/ontologies", { pageSize: 100 })
  }

  /**
   * Asynchronously load list of observation variables of a BreedingAPI endpoint
   */
  fetchVariables() {
    return fetchAllPages(this.breedingAPIEndpoint, "/variables", { pageSize: 200 })
  }
}


function joinPaths(base, extension) {
  return base.replace(/\/?$/, '') + '/' + extension.replace(/^\/?/, '')
}

/**
 * Extract data from Breeding API response or throw an error if any occured
 */
function getBrapiData(brapiResponse) {
  if (!isEmpty(brapiResponse.metadata.status)) {
    throw brapiResponse.metadata.status
  }
  return brapiResponse.result.data
}

/**
 * Asynchronously fetch all pages of a Breeding API call
 */
function fetchAllPages(breedingAPIEndpoint, path, params) {
  let url = joinPaths(breedingAPIEndpoint, path)
  let deferred = $.Deferred()

  // override default query parameters with user given parameters
  let page = 0
  let req = $.get(url, {...params, page})

  // Request successfull
  req.done(function(response) {
    // results of the first page
    let firstPageData
    try {
      firstPageData = getBrapiData(response)
    } catch(error) {
      return deferred.reject(error)
    }
    let totalPages = response.metadata.pagination.totalPages

    // Prepare Ajax request for all other pages (if any)
    let requests = []
    while (page < totalPages - 1) {
      page++
      requests.push($.get(url, {...params, page}))
    }

    if (requests.length >= 1) {
      // Executing all page requests asynchronously
      whenAll(requests).done(function(responses) {
        // Aggregate results of all pages (except the first)
        let otherPagesData = $.map(responses, function(response) {
          try {
            return getBrapiData(response[0])
          } catch(error) {
            return deferred.reject(error)
          }
        })

        // concat results and resolve the deferred
        deferred.resolve(firstPageData.concat(otherPagesData))
      })
    } else {
      // Only one page
      deferred.resolve(firstPageData)
    }
  })

  // Request failed
  req.fail(deferred.reject)

  // Return "deferred" value (aka. "future" value)
  return deferred
}
