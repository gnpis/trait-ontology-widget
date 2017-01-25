var $ = require('jquery');
var Arrays = require('./utils').Arrays;

// key defining identifiers
var identifierKeys = ["ontologyDbId", "observationVariableDbId", "traitDbId", "methodDbId", "scaleDbId"];
// all ignored keys
var ignoredKeys =  ["name", "links", "language"].concat(identifierKeys);

function isEmptyString(string) {
  return typeof string !== "string" || string.length < 0 || string.trim().length < 0;
}

function isNotEmptyArrayOfString(array) {
  if (!array || !$.isArray(array) || array.length <= 0) {
    return false;
  } else {
    ok = true;
    $.each(array, function(element) {
      if (!isEmptyString(element)) {
        return ok = false;
      }
    });
    return ok;
  }
}

function formatKey(str) {
  return str
    // split camel case: insert a space before all caps
    .replace(/([A-Z][a-z])/g, ' $1')
    .toLowerCase().trim()
    // uppercaser first letter
    .replace(/^./, function(str){ return str.toUpperCase(); })
}

function createSection(name, type) {
  return $('<tr>')
    .append(
      $('<th class="section" colspan=2>')
        .append($('<h3 class="labeled '+type+'">').text(formatKey(name))));
}

function createRow(key, value) {
  if (key && value && value.jquery) {
    var $row = $('<tr>');
    $('<td class="key">').text(formatKey(key)).appendTo($row);;
    $('<td class="value">').append(value).appendTo($row);
    return $row;
  }
}

function createValueView(value) {
  if ($.isArray(value) && value.length > 1) {
    var $ul = $('<ul>');
    // Append values as unordered list (ul) of list item (li)
    return $ul.append.apply($ul, $.map(value, function(v) {
      return $('<li>').text(v);
    }));
  } else if (value.match && value.match(/^https?:\/\/.+/)) {
    return $('<a>').text(value).attr("href", value).attr("target", "_blank");
  }
  return $('<span>').text(value);
}

function createLinks(links) {
  var $ul = $('<ul>');
  // Append links as unordered list (ul) of list item (li) of anchor (a)
  return $ul.append.apply($ul, $.map(links, function(link) {
    return $('<li>').append($('<a>').attr("href", link["href"]).text(link["rel"]));
  }));
}

function createDetailView(nodeData) {
  var rows = [];
  $.each(nodeData, function(key, value) {
    // Ignored keys
    if (Arrays.contains(ignoredKeys, key)) {
      if (key === "links") {
        rows.push(createRow(key, createLinks(value)));
      }
      return;
    };

    if ($.isPlainObject(value)) {
      var name = value["name"];

      if (name) {
        var section = createSection(name, key);
        var subRows = createDetailView(value);

        if (subRows && subRows.length > 0) {
          rows.push(section);
          rows = rows.concat(subRows);
        }
      }
    } else if (isNotEmptyArrayOfString(value) || !isEmptyString(value)) {
      rows.push(createRow(key, createValueView(value)));
    }
  });
  return rows;
}

// Details panel view
module.exports = function DetailsPanel(widget) {
  var detailsPanel = this;
  var $details = $('<div class="details"></div>');
  var defaultTilte = "Details";
  var $title = $('<h2>'+defaultTilte+'</h2>').appendTo($details);

  //var $detailList = $('<dl></dl>');
  //$details.append($detailList);

  var $detailsTable = $('<table></table>');
  $details.append($detailsTable);

  // Add to widget
  widget.$root.append($details);

  // Clear details
  this.clear = function() {
    $detailsTable.empty();
    $title.attr("class", "");
    $title.text(defaultTilte);
  }

  // Display details for a node of the jstree
  this.display = function(node) {
    detailsPanel.clear();
    $title.attr("class", node.type+" labeled");
    $title.text(node.text);
    $detailsTable.append.apply($detailsTable, createDetailView(node.data));
  }

  // Display error message in detail panel
  this.displayError = function(errorMessage) {
    detailsPanel.clear();
    var errorCell = $("<td class='error'></td>").text(errorMessage);
    var errorRow = $("<tr>").append(errorCell);
    $detailsTable.append(errorRow);
  }

  return this;
};
