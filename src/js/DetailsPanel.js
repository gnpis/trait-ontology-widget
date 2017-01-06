var $ = require('jquery');

function formatKey(str) {
  return str
    // split camel case: insert a space before all caps
    .replace(/([A-Z][a-z])/g, ' $1')
    .toLowerCase().trim()
    // uppercaser first letter
    .replace(/^./, function(str){ return str.toUpperCase(); })
}

// Details panel view
module.exports = function DetailsPanel(widget) {
  var $details = $('<div class="details"></div>');
  $details.append('<h2>Details</h2>');

  var $detailList = $('<dl></dl>');
  $details.append($detailList);

  // Add to widget
  widget.$root.append($details);

  // Clear details
  this.clear = function() {
    $detailList.empty();
  }

  function appendDetails(text, data, optionalPrefix) {
  	var prefix = optionalPrefix || "";
  	if (data) {
  		if (typeof data === 'string') {
  			var key = formatKey(prefix + text);
  			var value = data;
  			$detailList.append(
  				'<div class="detail">'+
  					'<div class="key">' + key + '</div>'+
  					'<div class="value">' + data + '</div>'+
  				'</div>'
  			);
  		} else if (typeof data === 'object') {
  			$.each(data, function(t, d) {
  				return appendDetails(t, d, prefix + text + " - ");
  			});
  		}
  	}
  }

  // Display details for a node of the jstree
  this.display = function(node) {
  	$.each(node.data, appendDetails);
  }

  return this;
};
