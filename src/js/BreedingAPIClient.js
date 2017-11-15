var $ = require('jquery');
var DEFAULT_PAGINATION = { pageSize: 100, page: 0 };

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
 * Returns a $.Deferred that resolves when all the given deferreds are resolved
 */
function whenAll(deferreds) {
  var res = $.Deferred();

  if (!deferreds || deferreds.length == 0) {
    res.resolve();
  } else if (deferreds.length == 1) {
    deferreds[0].done(function(response) {
      res.resolve(response[1]);
    });
    deferreds[0].fail(res.reject);
  } else {
    var all = $.when.apply($, deferreds);
    all.done(function() {
      res.resolve(arguments);
    });
    all.fail(res.reject);
  }
  return res;
}

/**
 * Asynchronously fetch all pages of a Breeding API call
 */
function fetchAllPages(breedingAPIEndpoint, path, params) {
  var url = joinPaths(breedingAPIEndpoint, path);
  var deferred = $.Deferred();

  // override default query parameters with user given parameters
  var query = $.extend({}, DEFAULT_PAGINATION, params);

  var req = $.get(url, query);

  // Request successfull
  req.done(function(response) {
    // results of the first page
    var firstPageData;
    try {
      firstPageData = getBrapiData(response);
    } catch(error) {
      return deferred.reject(error);
    }
    var totalPages = response.metadata.pagination.totalPages;

    // Prepare Ajax request for all other pages (if any)
    var requests = [];
    while (query.page < totalPages - 1) {
      query.page++;
      // clone query parameters to avoid modifications
      var currentQuery = $.extend({}, query);
      requests.push($.get(url, currentQuery));
    }

    if (requests.length > 1) {
      // Executing all page requests asynchronously
      whenAll(requests).done(function(responses) {
        // Aggregate results of all pages (except the first)
        var otherPagesData = $.map(responses, function(response) {
          try {
            return getBrapiData(response[0]);
          } catch(error) {
            return deferred.reject(error);
          }
        })

        // concat results and resolve the deferred
        deferred.resolve(firstPageData.concat(otherPagesData));
      })
    } else {
      // Only one page
      deferred.resolve(firstPageData);
    }
  });

  // Request failed
  req.fail(deferred.reject);

  // Return "deferred" value (aka. "future" value)
  return deferred;
}


module.exports = function BreedingAPIClient(breedingAPIEndpoint) {
  /**
  * Asynchronously load list of observation variable ontologies of a BreedingAPI endpoint
  */
  this.fetchOntologies= function() {
    return fetchAllPages(breedingAPIEndpoint, "/ontologies", { pageSize: 100 });
  }

  /**
   * Asynchronously load list of observation variables of a BreedingAPI endpoint
   */
  this.fetchVariables = function () {
    return fetchAllPages(breedingAPIEndpoint, "/variables", { pageSize: 200 });
  }
}
