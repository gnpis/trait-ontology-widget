var $ = require('jquery');

module.exports = function SearchField(widget) {
  var $searchBox = $('<div class="searchBox"></div>');
  var $input = $('<input placeholder="Search terms..." type="text">');
  $searchBox.append($input);

  /**
   * Returns the jQuery element
   */
  this.getElement = function() {
    return $searchBox;
  }

  /**
   * Clear search input & trigger empty search
   */
  this.clear = function () {
    $input.val("").trigger("keyup");
  }

  /**
   * Predicate function returning true if the node matches the searched text
   */
  this.nodeMatchesText = function(searchText, node) {
    if (node.state && node.state.hidden === true) {
      return false;
    }
    if (node.text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
      return true;
    }
    /* Search in node data =>
    if (node.data) {
      for (var key in node.data) {
        var val = node.data[key];
        if (typeof val === "string" && val.indexOf(searchText) !== -1) {
          return true;
        }
      }
    }*/
    return false;
  }

  // Initialize keyup event on the search input field
  var to = false;
  $input.keyup(function() {
    if (to) clearTimeout(to);
    to = setTimeout(function() {
      var v = $input.val();
      widget.jsTreePanel.jstree.search(v);
    }, 250);
  });
}
