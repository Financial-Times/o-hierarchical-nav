/*global require,module,document,HTMLElement*/
'use strict';

var SquishyList = require('o-squishy-list');
var DomDelegate = require('ftdomdelegate');
var oViewport = require('o-viewport');
var Nav = require('./Nav');

function ResponsiveNav(rootEl) {

	var rootDelegate;
	var nav;
	var contentFilterEl;
	var contentFilter;
	var moreEl;
	var moreListEl;

	// Check if element is a controller of another DOM element
	function isMegaDropdownControl(el) {
		return (el && el.hasAttribute('aria-controls'));
	}

	// On resize, apply o-squishy-list, and, if it has a sub-level dom, populate more list
	function resize() {
		nav.resize();

		if (contentFilter) {
			contentFilter.squish();
			if (!isMegaDropdownControl(moreEl)) {
				populateMoreList(contentFilter.getHiddenItems());
			}
		}
	}

	// Empty the more list
	function emptyMoreList() {
		if (moreListEl) {
			moreListEl.innerHTML = '';
		}
	}

	// Get the information from the element and create a new li tag with the element's text to append more list
	function addItemToMoreList(text, href) {
		var itemEl = document.createElement('li');
		var aEl = document.createElement('a');

		if (typeof aEl.textContent !== 'undefined') {
			aEl.textContent = text;
		} else {
			aEl.innerText = text;
		}

		aEl.href = href;
		itemEl.appendChild(aEl);
		moreListEl.appendChild(itemEl);
	}

	function cloneItemToMoreList(el) {
		var cloneEl = el.cloneNode(true);
		// remove the attributes that are only applicable to higher level
		cloneEl.removeAttribute('data-priority');
		cloneEl.removeAttribute('aria-hidden');
		cloneEl.removeAttribute('data-o-hierarchical-nav--is-cloneable');
		moreListEl.appendChild(cloneEl);
	}

	// For every hidden item, add it to the more list
	function populateMoreList(hiddenEls) {
		emptyMoreList();

		for (var c = 0, l = hiddenEls.length; c < l; c++) {
			var aEl = hiddenEls[c].querySelector('a');
			var ulEl = hiddenEls[c].querySelector('ul');

			if (hiddenEls[c].hasAttribute('data-o-hierarchical-nav--is-cloneable')) {
				cloneItemToMoreList(hiddenEls[c]);
			} else {
				var aText = (typeof aEl.textContent !== 'undefined') ? aEl.textContent : aEl.innerText;
				addItemToMoreList(aText, aEl.href, ulEl);
			}
		}
	}

	// If all elements are hidden, add the all modifier, if not, the some modifier
	function setMoreElClass(remainingItems) {
		if (!moreEl) {
			return;
		}

		if (remainingItems === 0) {
			moreEl.classList.add('o-hierarchical-nav__more--all');
			moreEl.classList.remove('o-hierarchical-nav__more--some');
		} else {
			moreEl.classList.add('o-hierarchical-nav__more--some');
			moreEl.classList.remove('o-hierarchical-nav__more--all');
		}
	}

	// When there's an o-squishy-list change, collapse all elements and run the setMoreElClass method with number of non-hidden elements
	function contentFilterChangeHandler(ev) {
		if (ev.target === contentFilterEl && ev.detail.hiddenItems.length > 0) {
			nav.collapseAll();
			setMoreElClass(ev.detail.remainingItems.length);
		}
	}

	// If more button is clicked, populate it
	function navExpandHandler(ev) {
		if (ev.target === moreEl) {
			populateMoreList(contentFilter.getHiddenItems());
		}
	}

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		nav = new Nav(rootEl);
		rootDelegate = new DomDelegate(rootEl);
		contentFilterEl = rootEl.querySelector('ul');
		moreEl = rootEl.querySelector('[data-more]');

		if (contentFilterEl) {
			contentFilter = new SquishyList(contentFilterEl, { filterOnResize: false });
		}

		// If there's a more element, add a ul tag where hidden elements will be appended
		if (moreEl) {
			moreEl.setAttribute('aria-hidden', 'true');

			if (!isMegaDropdownControl(moreEl)) {
				moreListEl = document.createElement('ul');
				moreListEl.setAttribute('data-o-hierarchical-nav-level', '2');
				moreEl.appendChild(moreListEl);
				rootDelegate.on('oLayers.new', navExpandHandler);
			}
		}

		rootDelegate.on('oSquishyList.change', contentFilterChangeHandler);

		var bodyDelegate = new DomDelegate(document.body);

		// Force a resize when it loads, in case it loads on a smaller screen
		resize();

		oViewport.listenTo('resize');
		bodyDelegate.on('oViewport.resize', resize);
	}

	function destroy() {
		rootDelegate.destroy();
		rootEl.removeAttribute('data-o-hierarchical-nav--js');
	}

	init();

	this.resize = resize;
	this.destroy = destroy;
}

// Initializes all nav elements in the page or whatever element is passed to it
ResponsiveNav.init = function(el) {
	if (!el) {
		el = document.body;
	} else if (!(el instanceof HTMLElement)) {
		el = document.querySelector(el);
	}

	var navEls = el.querySelectorAll('[data-o-component="o-hierarchical-nav"]');
	var responsiveNavs = [];

	for (var c = 0, l = navEls.length; c < l; c++) {
		if (!navEls[c].hasAttribute('data-o-hierarchical-nav--js')) {
			// If it's a vertical nav, we don't need all the responsive methods
			if (navEls[c].getAttribute('data-o-hierarchical-nav-orientiation') === 'vertical') {
				responsiveNavs.push(new Nav(navEls[c]));
			} else {
				responsiveNavs.push(new ResponsiveNav(navEls[c]));
			}
		}
	}

	return responsiveNavs;
};

module.exports = ResponsiveNav;
