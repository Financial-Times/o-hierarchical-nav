import DomDelegate from 'ftdomdelegate';
import utils from './utils';


function Nav(rootEl) {

	const bodyDelegate = new DomDelegate(document.body);
	const rootDelegate = new DomDelegate(rootEl);

	// Get sub-level element
	function getChildListEl(el) {
		return el.querySelector('ul');
	}

	// Check if element has sub-level nav
	function hasChildList(el) {
		return !!getChildListEl(el);
	}

	// Get controlled element
	function getMegaDropdownEl(itemEl) {
		if (itemEl.hasAttribute('aria-controls')) {
			return document.getElementById(itemEl.getAttribute('aria-controls'));
		}
	}

	// Check if element is a controller of another DOM element
	function isControlEl(el) {
		return !!(getChildListEl(el) || getMegaDropdownEl(el));
	}

	// Check if element has been expanded
	function isExpanded(el) {
		return el.getAttribute('aria-expanded') === 'true';
	}

	// Check if a certain element is inside the root nav
	function isElementInsideNav(el) {
		const expandedLevel1El = rootEl.querySelector('[data-o-hierarchical-nav-level="1"] > [aria-expanded="true"]');
		let expandedMegaDropdownEl;
		let allLevel1Els;

		if (expandedLevel1El) {
			expandedMegaDropdownEl = getMegaDropdownEl(expandedLevel1El);
			if (expandedMegaDropdownEl && expandedMegaDropdownEl.contains(el)) {
				return true;
			}
		}

		allLevel1Els = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="1"] > li');

		for (let c = 0, l = allLevel1Els.length; c < l; c++) {
			if (allLevel1Els[c].contains(el)) {
				return true;
			}
		}
		return false;
	}

	// Get the level a nav is in
	function getLevel(el) {
		return parseInt(el.parentNode.getAttribute('data-o-hierarchical-nav-level'), 10);
	}

	// Check if a level 2 nav will fit in the window
	function level2ListFitsInWindow(l2El) {
		return l2El.getBoundingClientRect().right < window.innerWidth;
	}

	// Check if an element will have enough space to its right
	function elementFitsToRight(el1, el2) {
		return el1.getBoundingClientRect().right + el2.offsetWidth < window.innerWidth;
	}

	// Depending on if an element fits to its right or not, change its class to apply correct css
	function positionChildListEl(parentEl, childEl) {
		parentEl.classList.remove('o-hierarchical-nav--align-right');
		parentEl.classList.remove('o-hierarchical-nav__outside-right');
		parentEl.classList.remove('o-hierarchical-nav--left');

		if (!childEl) {
			return;
		}

		if (getLevel(parentEl) === 1) {
			if (!level2ListFitsInWindow(childEl)) {
				parentEl.classList.add('o-hierarchical-nav--align-right');
			}
		} else {
			if (elementFitsToRight(parentEl, childEl)) {
				parentEl.classList.add('o-hierarchical-nav__outside-right');
			}
		}
	}

	// Hide an element
	function hideEl(el) {
		if (el) {
			el.setAttribute('aria-hidden', 'true');
		}
	}

	// Display an element
	function showEl(el) {
		if (el) {
			el.removeAttribute('aria-hidden');
		}
	}

	// Collapse all items from a certain node list
	function collapseAll(nodeList) {
		if (!nodeList) {
			nodeList = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="1"] > li[aria-expanded=true]');
		}

		utils.nodeListToArray(nodeList).forEach(function(childListItemEl) {
			if (isExpanded(childListItemEl)) {
				collapseItem(childListItemEl);
			}
		});
	}

	// Set an element as not expanded, and if it has children, do the same to them
	function collapseItem(itemEl) {
		itemEl.setAttribute('aria-expanded', 'false');

		if (utils.isIE8) {
			itemEl.classList.add('forceIErepaint');
			itemEl.classList.remove('forceIErepaint');
		}

		if (hasChildList(itemEl)) {
			collapseAll(getChildListEl(itemEl).children);
		}

		hideEl(getMegaDropdownEl(itemEl));
		dispatchCloseEvent(itemEl);
	}

	// Get same level items and collapse them
	function collapseSiblingItems(itemEl) {
		const listLevel = itemEl.closest('ul').getAttribute('data-o-hierarchical-nav-level');
		const listItemEls = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="' + listLevel + '"] > li[aria-expanded="true"]');

		for (let c = 0, l = listItemEls.length; c < l; c++) {
			collapseItem(listItemEls[c]);
		}
	}

	// Expand a nav item
	function expandItem(itemEl) {
		collapseSiblingItems(itemEl);
		itemEl.setAttribute('aria-expanded', 'true');
		positionChildListEl(itemEl, getChildListEl(itemEl));
		showEl(getMegaDropdownEl(itemEl));
		dispatchExpandEvent(itemEl);
	}

	// Helper method to dispatch o-layers new event
	function dispatchExpandEvent(itemEl) {
		utils.dispatchCustomEvent(itemEl, 'oLayers.new', {'zIndex': 10, 'el': itemEl});
	}

	// Helper method to dispatch o-layers close event
	function dispatchCloseEvent(itemEl) {
		utils.dispatchCustomEvent(itemEl, 'oLayers.close', {'zIndex': 10, 'el': itemEl});
	}

	// Handle clicks ourselved by expanding or collapsing selected element
	function handleClick(ev) {
		const itemEl = ev.target.closest('li');

		if (itemEl && isControlEl(itemEl)) {
			ev.preventDefault();

			if (!isExpanded(itemEl)) {
				expandItem(itemEl);
			} else {
				collapseItem(itemEl);
			}
		}
	}

	// Position a level 3 nav and deeper
	function positionExpandedLevels() {
		// find deepest expanded menu element
		const openMenus = rootEl.querySelectorAll('li[aria-expanded="true"] > ul[data-o-hierarchical-nav-level]');

		// find the deepest level currently open
		let deepestLevel = -1;
		for (let c = 0, l = openMenus.length; c < l; c++) {
			deepestLevel = Math.max(deepestLevel, openMenus[c].getAttribute("data-o-hierarchical-nav-level"));
		}

		// start checking space / collapsing where needed
		for (let l = 2; l <= deepestLevel; l++) {
			const openLevelParentEl = rootEl.querySelector('[data-o-hierarchical-nav-level="'+l+'"] > [aria-expanded="true"]');
			const openLevelChildEl = rootEl.querySelector('[data-o-hierarchical-nav-level="'+l+'"] > [aria-expanded="true"] > ul');

			if (openLevelParentEl && openLevelChildEl) {
				positionChildListEl(openLevelParentEl, openLevelChildEl);
			}
		}
	}

	// Position level 3 and below on resize
	function resize() {
		positionExpandedLevels();
	}

	// Set all tabIndexes of a tags to 0
	function setTabIndexes() {
		const aEls = rootEl.querySelectorAll('li > a');

		for (let c = 0, l = aEls.length; c < l; c++) {
			if (!aEls[c].hasAttribute('href')) {
				if (aEls[c].tabIndex === 0) { // Don't override tabIndex if something else has set it, but otherwise set it to zero to make it focusable.
					aEls[c].tabIndex = 0;
				}
			}
		}
	}

	function setLayersContext() {
		// We'll use the body as the default context
		bodyDelegate.on('oLayers.new', function(e) {
			if (!isElementInsideNav(e.detail.el)) {
				collapseAll();
			}
		});
	}

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		rootEl.setAttribute('data-o-hierarchical-nav--js', '');
		setTabIndexes();
		setLayersContext();
		rootDelegate.on('click', handleClick);
		rootDelegate.on('keyup', function(ev) { // Pressing enter key on anchors without @href won't trigger a click event
			if (!ev.target.hasAttribute('href') && ev.keyCode === 13 && isElementInsideNav(ev.target)) {
				handleClick(ev);
			}
		});

		// Collapse all elements if the user clicks outside the nav
		bodyDelegate.on('click', function(ev) {
			if (!isElementInsideNav(ev.target)) {
				collapseAll();
			}
		});
	}

	function destroy() {
		rootDelegate.destroy();
		bodyDelegate.destroy();
		rootEl.removeAttribute('data-o-hierarchical-nav--js');
	}

	init();

	this.resize = resize;
	this.collapseAll = collapseAll;
	this.destroy = destroy;
}

export default Nav;
