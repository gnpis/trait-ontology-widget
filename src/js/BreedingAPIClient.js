var $ = require('jquery');

function joinPaths(base, extension) {
  return base.replace(/\/?$/, '') + "/" + extension.replace(/^\/?/, '') ;
}

/**
 * Extract data from Breeding API response or throw an error if any occured
 */
function getBrapiData(brapiResponse) {
  if (brapiResponse.metadata.status != null && brapiResponse.metadata.status.length > 0) {
    throw brapiResponse.metadata.status;
  }
  return brapiResponse.result.data;
}

/**
 * Fetch all pages of a Breeding API call
 */
function fetchAllPages(breedingAPIEndpoint, path, pageSize) {
  var url = joinPaths(breedingAPIEndpoint, path);
  var pagination = {
    page: 0, pageSize: pageSize
  };
  var deferred = $.Deferred();

  $.get(url, pagination).done(function(response) {
    // results of the first page
    var firstPageData = getBrapiData(response);
    var totalPages = response.metadata.pagination.totalPages;

    // Prepare Ajax request for all other pages (if any)
    var requests = [];
    while (pagination.page < totalPages - 1) {
      pagination.page++;
      var currentPage = $.extend({}, pagination);
      requests.push($.get(url, currentPage));
    }

    if (requests.length > 0) {
      // Executing all page requests asynchronously
      $.when.apply($, requests).done(function() {
        // Aggregate results of all pages (except the first)
        var otherPagesData = $.map(arguments, function(pageReponse) {
          return getBrapiData(pageReponse[0]);
        })

        // concat results and resolve the deferred
        deferred.resolve(firstPageData.concat(otherPagesData));
      })
    } else {
      // Only one page
      deferred.resolve(firstPageData);
    }
  });
  return deferred;
}


module.exports = function BreedingAPIClient(breedingAPIEndpoint) {
  /**
  * Asynchronously load list of observation variable ontologies of a BreedingAPI endpoint
  */
  this.fetchOntologies= function() {
    return fetchAllPages(breedingAPIEndpoint, "/ontologies", 100);
  }

  /**
   * Asynchronously load list of observation variables of a BreedingAPI endpoint
   */
  this.fetchVariables = function () {
    return fetchAllPages(breedingAPIEndpoint, "/variables", 200);
  }
}
