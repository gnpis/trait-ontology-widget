const $ = require('jquery')
import Arrays from './Arrays'

/*
 * Utilities used throughout the project
 */

/**
 * Test if value is empty (null or undefined or empty array or object with empty values)
 */
export function isEmpty(obj) {
  // Null / undefined / zero length
  if (obj === null || obj === undefined || obj.length === 0) return true
  // Empty string
  if (typeof obj === "string" && obj.trim() === "") return true
  // NaN
  if (typeof obj === "number" && obj === NaN) return true

  // Array of empty values
  if ($.isArray(obj)) return Arrays.every(obj, isEmpty)

  if ($.isPlainObject(obj)) {
    // With no property
    if (Object.getOwnPropertyNames(obj).length === 0) return true

    // With empty properties
    let empty = true
    $.each(obj, (k, v) => empty = empty && isEmpty(v))
    return empty
  }

  return false
}


/**
 * Returns a $.Deferred that resolves when all the given deferreds are resolved
 */
export function whenAll(deferreds) {
  let deferred = $.Deferred()

  if (!deferreds || deferreds.length == 0) {
    deferred.resolve()
  } else if (deferreds.length == 1) {
    deferreds[0].done((response) => deferred.resolve([[response]]))
    deferreds[0].fail(deferred.reject)
  } else {
    let all = $.when(...deferreds)
    all.done((...responses) => deferred.resolve(responses))
    all.fail(deferred.reject)
  }
  return deferred
}

/**
 * Walk the object structure and get values in path
 * @return Array of values in path (even if there is only one value in path)
 *
 * Example:
 *  Using integer index of array to get a value
 *    getIn([1, 2, 3], [1])
 *       => [2]
 *  Using integer index of array and string key of object to get a value
 *    getIn([1, {a: "foo"}, 3], [1, "a"])
 *       => ["foo"]
 *
 *  Using "*" as a wildcard to explore sub paths and get all values
 *    getIn([{a: "foo"}, {a: "bar"}, {a: "baz"}], ["*", "a"])
 *       => ["foo", "bar", "baz"]
 *
 */
export function getIn(object, path) {
  if (!object) return []
  let first = path[0]
  if (first === undefined) return [object]
  if (first === "*") {
    let second = path[1]
    if (second && ($.isArray(object) || $.isPlainObject(object))) {
      // Wilcard path => search object
      let restPath = path.slice(2)
      let values = []
      for (let idx in object) {
        let subPath = path
        if (idx === second) subPath = restPath
    	  values = values.concat(
          getIn(object[idx], subPath)
        )
      }
      return values
    }
  } else {
    // Strict path
    let value = object[first]
    if (value) return getIn(value, path.slice(1))
  }
  return []
}
