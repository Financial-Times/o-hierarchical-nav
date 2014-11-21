/*global require*/
'use strict';

var Nav = require('../../src/js/Nav');
var navEls = document.querySelectorAll('.o-hierarchical-nav');

for (var c = 0, l = navEls.length; c < l; c++) {
	new Nav(navEls[c]);
}
