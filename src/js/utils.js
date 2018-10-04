/*
 * Utilities used throughout the project
 */

export const Arrays = {
  // Array contains
  contains(arr, item) {
    return arr.indexOf(item) !== -1
  },

  // Array remove
  remove(arr, item) {
    arr.splice(arr.indexOf(item), 1)
  }
}
