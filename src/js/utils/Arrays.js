const $ = require('jquery')

/*
 * Arrays utilities used throughout the project
 */

export default class Arrays {
  // Array contains
  static contains(array, item) {
    return array.indexOf(item) !== -1
  }

  // Array remove
  static remove(array, item) {
    array.splice(array.indexOf(item), 1)
  }

  /**
   * Keep only distinct values according to a function apply to the
   * array elements
   *
   * example 1 (normal distinct using identity function):
   *  distinctBy(["a", "b", "b"], s => s)
   *    => ["a", "b"]
   *
   * example 2 (distinct by object property value):
   *  distinctBy([{id: 1, k1: "v1"}, {id: 1, k2: "v2"}], o => o.id)
   *    => [{id: 1, k1: "v1"}]
   */
  static distinctBy(array, fn) {
    if (console) {
      console.assert(array)
      console.assert(fn)
    }
    let idx = {}
    let res = []
    for (let i = 0; i < array.length; i++) {
      let element = array[i]
      let r = fn(element)
      if (!idx[r]) {
        idx[r] = true
        res.push(element)
      }
    }
    return res
  }

  /**
   * Distinct values in array
   */
  static distinct(array) {
    return Arrays.distinctBy(array, e=>e)
  }

  /**
   * Flatten array of arrays into an array of elements
   */
  static flatten(array) {
    return $.map(array, element => {
      if ($.isArray(element)) {
        return Arrays.flatten(element)
      } else {
        return element
      }
    })
  }

  /**
   * Index array values using values from functions applied to its elements
   *
   * example 1:
   *  groupBy(["a", "b"], s => s)
   *    => {"a": ["a"], "b": ["b"]}
   *
   * example 2 (group by string length and by wether or not they include "a"):
   *  groupBy(["aa", "a", "b", "bb", "cc"], s => s.length, s => s.includes("a"))
   *    => {1: {true: ["a"], false: ["b"]},
   *        2: {true: ["aa"], false: ["bb", "cc"]}}
   */
  static groupBy(array, fn, ...fns) {
    if (console) {
      console.assert(array)
      console.assert(fn)
    }
    let groups = {}
    for (let i = 0; i < array.length; i++) {
      let element = array[i]
      let id = fn(element)
      groups[id] = groups[id] || []
      groups[id].push(element)
    }
    if (fns && fns.length) {
      for (let id in groups) {
        groups[id] = Arrays.groupBy(groups[id], fns[0], ...fns.slice(1))
      }
    }
    return groups
  }

  /**
   * Make batches from an array and a batch size
   */
  static batch(array, size) {
    let res = []
    for (let element of array) {
      let batch = res[res.length-1]
      if (!batch || batch.length >= size) {
        res.push(batch = [])
      }
      batch.push(element)
    }
    return res
  }


  /**
   * Returns true if some element of the array match the predicate
   */
  static some(array, predicate) {
    for (let element of array) {
      if (predicate(element)) return true
    }
    return false
  }

  /**
   * Returns true if every element of the array match the predicate
   */
  static every(array, predicate) {
    for (let element of array) {
      if (!predicate(element)) return false
    }
    return true
  }

}
