import Nav from '../../../src/js/Nav';
const navEls = document.querySelectorAll('.o-hierarchical-nav');

for (let c = 0, l = navEls.length; c < l; c++) {
	new Nav(navEls[c]);
}
