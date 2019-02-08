import oHierarchicalNav from './src/js/ResponsiveNav';

const constructAll = function() {
	oHierarchicalNav.init();
	document.removeEventListener('o.DOMContentLoaded', constructAll);
};
document.addEventListener('o.DOMContentLoaded', constructAll);

export default oHierarchicalNav;
