/*global require,module*/
'use strict';

var oHierarchicalNav = require('./src/js/ResponsiveNav');
var constructAll = function() {
	oHierarchicalNav.init();
	document.removeEventListener('o.DOMContentLoaded', constructAll);
};
document.addEventListener('o.DOMContentLoaded', constructAll);

module.exports = oHierarchicalNav;
