
module.exports = {

  Arrays: {
    // Array contains
    contains: function (arr, item) {
      return arr.indexOf(item) !== -1;
    },

    // Array remove
    remove: function (arr, item) {
      arr.splice(arr.indexOf(item), 1);
    }
  }
  
}
