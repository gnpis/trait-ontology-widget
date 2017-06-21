var $ = require('jquery');
var Arrays = require('../utils').Arrays;

// List of keys that should appear on top of the detail view
var prioritizedKeys = ["ontologyName"];

// Special keys (keys that are displayed in a special way or not displayed at all)
var specialKeys =  ["ontologyDbId", "links", "language"];

// Map from key name (BrAPI field) to display name
var keyDisplayName = {
  "observationVariableDbId": "Identifier",
  "traitDbId": "Identifier",
  "methodDbId": "Identifier",
  "scaleDbId": "Identifier"
};

// List of sections
var variableSections = ["trait", "method", "scale"];

// Test if value can de displayed
function isDisplayable(obj) {
  if (obj !== null && obj !== undefined) {
    // Not empty string
    if (typeof obj === "string" && obj.trim() !== "") return true;
    // Valid number
    if (typeof obj === "number" && obj !== NaN) return true;
    // Not empty array of displayable values
    if ($.isArray(obj) && obj.length >= 1) {
      var ok = true;
      $.each(obj, function(element) {
        return ok = ok && isDisplayable(element);
      });
      return ok;
    }
  }
  return false;
}

// Format a key for display
function formatKey(str) {
  if (keyDisplayName[str]) {
    // Use preformated key names from "keyDisplayName" map
    return keyDisplayName[str];
  } else {
    // Or convert camel case to words separated by spaces and capitalized first letter
    return str
      // split camel case: insert a space before all caps
      .replace(/([A-Z][a-z])/g, ' $1')
      .toLowerCase().trim()
      // uppercase first letter
      .replace(/^./, function(str){ return str.toUpperCase(); })
  }
}

// Create a new table section (ex: trait, method, scale)
function createSection(name, type) {
  var $tr = $('<tr>');
  var $th = $('<th class="section" colspan=2>').appendTo($tr);
  var $h3 = $('<h3 class="labeled '+type+'">').text(name).appendTo($th);
  return $tr;
}

// Create a new table row with key and value columns
function createRow(key, value) {
  if (key && value && value.jquery) {
    var $tr = $('<tr>');
    var keyDisplayName = formatKey(key);
    $('<td class="key">').text(keyDisplayName).appendTo($tr);
    $('<td class="value">').append(value).appendTo($tr);
    return $tr;
  }
}

// Create html to display string, array of string, etc.
function createValueView(value) {
  if ($.isArray(value) && value.length >= 1) {
    // Display list of values
    var $ul = $('<ul>');
    // Append values as unordered list (ul) of list item (li)
    return $ul.append.apply($ul, $.map(value, function(v) {
      return $('<li>').text(v);
    }));
  } else if (value.match && value.match(/^https?:\/\/.+/)) {
    // Display links
    return $('<a>').text(value).attr("href", value).attr("target", "_blank");
  }
  // Display text
  return $('<span>').text(value);
}

// Create list of links (for links on list of ontologies)
function createLinks(links) {
  var $ul = $('<ul>');
  // Append links as unordered list (ul) of list item (li) of anchor (a)
  return $ul.append.apply($ul, $.map(links, function(link) {
    return $('<li>').append($('<a>').attr("href", link["href"]).text(link["rel"]));
  }));
}

function createRows(key, value) {
  var rows = [];
  if (Arrays.contains(specialKeys, key)) {
    // Special cases (custom display)

    if (key === "links") {
      rows.push(createRow(key, createLinks(value)));
    }

  } else {
    // Any other keys
    if ($.isPlainObject(value)) {

      if (Arrays.contains(variableSections, key)) {
        // Variable section (trait, method or scale)

        // Section name
        var name = value["name"];
        if (name) {
          // Format name
          name = formatKey(name);
        } else {
          // Use the identifier as section name (unformated)
          name = value[key+'DbId'];
        }

        // Create new section & content
        var section = createSection(name, key);
        var subRows = createDetailView(value);

        // Content not empty
        if (subRows && subRows.length > 0) {
          rows.push(section);
          rows = rows.concat(subRows);
        }
      } else {
        // Display object (like scale.validValues)
        var subRows = $.map(value, function(i, subKey) {
          return createRows(subKey, value[subKey]);
        });

        if (subRows && subRows.length > 0) {
          rows = rows.concat(subRows);
        }
      }
    } else if (isDisplayable(value)) {
      rows.push(createRow(key, createValueView(value)));
    }
  }
  return rows;
}

function createDetailView(nodeData) {
  var rows = [];

  // Display prioritized keys first
  $.each(nodeData, function(key, value) {
    if (Arrays.contains(prioritizedKeys, key)) {
      rows = rows.concat(createRows(key, value));
    }
  });

  // Display other keys
  $.each(nodeData, function(key, value) {
    if (!Arrays.contains(prioritizedKeys, key)) {
      rows = rows.concat(createRows(key, value));
    }
  });
  return rows;
}

// Details panel view
module.exports = function DetailsPanel() {
  var detailsPanel = this;
  var $details = $('<div class="details"></div>');
  var defaultTilte = "Details";
  var $title = $('<h2>'+defaultTilte+'</h2>').appendTo($details);

  var $detailsTable = $('<table></table>');
  $details.append($('<div>').append($detailsTable));

  /**
   * Returns the jQuery element
   */
  this.getElement = function() {
    return $details;
  }

  /**
   * Clear details
   */
  this.clear = function() {
    $detailsTable.empty();
    $title.attr("class", "");
    $title.text(defaultTilte);
  }

  /**
   * Display details for an item (<li>) of the jstree
   */
  var currentDisplayedItem = null;
  this.displayItem = function($item, node) {
    // Clear details
    detailsPanel.clear();

    // Change detail view title
    $title.attr("class", node.type+" labeled");
    $title.text(node.text);

    // Generate detail view content
    $detailsTable.append.apply($detailsTable, createDetailView(node.data));

    // Update style to indicate the item that is being displayed in the detail view
    if (currentDisplayedItem != null) {
      currentDisplayedItem.removeClass("displayed");
    }
    $item.addClass("displayed");
    currentDisplayedItem = $item;
  }

  /**
   * Display error message in detail panel
   */
  this.displayError = function(errorMessage) {
    detailsPanel.clear();

    var errorCell = $("<td class='error'></td>").text(errorMessage);
    var errorRow = $("<tr>").append(errorCell);
    $detailsTable.append(errorRow);
  }

};
