const $ = require('jquery')

export class SearchField {

  constructor(widget) {
    this.widget = widget

    this.$searchBox = $('<div class="searchBox"></div>')
    this.$input = $('<input placeholder="Search terms..." type="text">')
    this.$searchBox.append(this.$input)

    // Initialize keyup event on the search input field
    // With 250ms event throttling to prevent to much call to jstree.search
    let searching = false
    this.$input.keyup(() => {
      if (searching) clearTimeout(searching)
      searching = setTimeout(() => {
        this.widget.jsTreePanel.jstree.search(this.$input.val())
      }, 250)
    })
  }

  /**
   * Returns the jQuery element
   */
  getElement() {
    return this.$searchBox
  }

  /**
   * Clear search input & trigger empty search
   */
  clear() {
    this.$input.val('').trigger('keyup')
  }

  /**
   * Predicate function returning true if the node matches the searched text
   */
  nodeMatchesText(searchText, node) {
    if (node.state && node.state.hidden === true) {
      return false
    }
    if (node.text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
      return true
    }
    /* Search in node data =>
    if (node.data) {
      for (var key in node.data) {
        var val = node.data[key]
        if (typeof val === "string" && val.indexOf(searchText) !== -1) {
          return true
        }
      }
    }*/
    return false
  }
}
