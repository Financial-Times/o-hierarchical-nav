/*global require, module*/

var DomDelegate = require('dom-delegate'),
    oDom = require('o-dom'),
    utils = require('./utils');

function Nav(rootEl) {
    "use strict";

    var bodyDelegate = new DomDelegate(document.body),
        rootDelegate = new DomDelegate(rootEl);

    function getChildListEl(el) {
        return el.querySelector('ul');
    }

    function hasChildList(el) {
        return !!getChildListEl(el);
    }

    function getMegaDropdownEl(itemEl) {
        if (itemEl.hasAttribute('aria-controls')) {
            return document.getElementById(itemEl.getAttribute('aria-controls'));
        }
    }

    function isControlEl(el) {
        return !!(getChildListEl(el) || getMegaDropdownEl(el));
    }

    function isExpanded(el) {
        return el.getAttribute('aria-expanded') === 'true';
    }

    function isElementInsideNav(el) {
        var expandedLevel1El = rootEl.querySelector('[data-o-hierarchical-nav-level="1"] > [aria-expanded="true"]'),
            expandedMegaDropdownEl,
            allLevel1Els;
        if (expandedLevel1El) {
            expandedMegaDropdownEl = getMegaDropdownEl(expandedLevel1El);
            if (expandedMegaDropdownEl && expandedMegaDropdownEl.contains(el)) {
                return true;
            }
        }
        allLevel1Els = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="1"] > li');
        for (var c = 0, l = allLevel1Els.length; c < l; c++) {
            if (allLevel1Els[c].contains(el)) {
                return true;
            }
        }
        return false;
    }

    function getLevel(el) {
        return parseInt(el.parentNode.getAttribute('data-o-hierarchical-nav-level'), 10);
    }

    function level2ListFitsInWindow(l2El) {
        return l2El.getBoundingClientRect().right < window.innerWidth;
    }

    function elementFitsToRight(el1, el2) {
        return el1.getBoundingClientRect().right + el2.offsetWidth < window.innerWidth;
    }

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

    function hideEl(el) {
        if (el) {
            el.setAttribute('aria-hidden', 'true');
        }
    }

    function showEl(el) {
        if (el) {
            el.removeAttribute('aria-hidden');
        }
    }

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

    function collapseItem(itemEl) {
        itemEl.setAttribute('aria-expanded', 'false');
        if (hasChildList(itemEl)) {
            collapseAll(getChildListEl(itemEl).children);
        }
        hideEl(getMegaDropdownEl(itemEl));
        dispatchCloseEvent(itemEl);
    }

    function collapseSiblingItems(itemEl) {
        var listLevel = oDom.getClosestMatch(itemEl, 'ul').getAttribute('data-o-hierarchical-nav-level'),
            listItemEls = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="' + listLevel + '"] > li[aria-expanded="true"]');
        for (var c = 0, l = listItemEls.length; c < l; c++) {
            collapseItem(listItemEls[c]);
        }
    }

    function expandItem(itemEl) {
        collapseSiblingItems(itemEl);
        itemEl.setAttribute('aria-expanded', 'true');
        positionChildListEl(itemEl, getChildListEl(itemEl));
        showEl(getMegaDropdownEl(itemEl));
        dispatchCloseAllEvent(itemEl);
        dispatchExpandEvent(itemEl);
    }

    function dispatchExpandEvent(itemEl) {
        utils.dispatchCustomEvent(itemEl, 'oLayers.new', {'zIndex': 10, 'el': itemEl});
    }

    function dispatchCloseAllEvent(itemEl) {
        utils.dispatchCustomEvent(itemEl, 'oLayers.closeAll', {'el': itemEl});
    }

    function dispatchCloseEvent(itemEl) {
        utils.dispatchCustomEvent(itemEl, 'oLayers.close', {'zIndex': 10, 'el': itemEl});
    }

    function handleClick(ev) {
        var itemEl = oDom.getClosestMatch(ev.target, 'li');
        if (itemEl && isControlEl(itemEl)) {
            ev.preventDefault();
            if (!isExpanded(itemEl)) {
                expandItem(itemEl);
            } else {
                collapseItem(itemEl);            
            }
        }
    }

    function positionLevel3s() {
        var openLevel2El = rootEl.querySelector('[data-o-hierarchical-nav-level="2"] > [aria-expanded="true"]'),
            openLevel3El = rootEl.querySelector('[data-o-hierarchical-nav-level="2"] > [aria-expanded="true"] > ul');
        if (openLevel2El && openLevel3El) {
            positionChildListEl(openLevel2El, openLevel3El);
        }
    }

    function resize() {
        positionLevel3s();
    }

    function setTabIndexes() {
        var aEls = rootEl.querySelectorAll('li > a:not([href])');
        for (var c = 0, l = aEls.length; c < l; c++) {
            if (aEls[c].tabIndex === 0) { // Don't override tabIndex if something else has set it, but otherwise set it to zero to make it focusable.
                aEls[c].tabIndex = 0;
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

        bodyDelegate.on('oLayers.closeAll', function(e) {
            if (!isElementInsideNav(e.detail.el)) {
                collapseAll();
            }
        });
    }

    function init() {
        setTabIndexes();
        setLayersContext();
        rootDelegate.on('click', handleClick);
        rootDelegate.on('keyup', function(ev) { // Pressing enter key on anchors without @href won't trigger a click event
            if (!ev.target.hasAttribute('href') && ev.keyCode === 13 && isElementInsideNav(ev.target)) {
                handleClick(ev);
            }
        });
        bodyDelegate.on('click', function(ev) {
            if (!isElementInsideNav(ev.target)) {
                collapseAll();
            }
        });
    }

    function destroy() {
        rootDelegate.destroy();
        bodyDelegate.destroy();
    }

    init();

    this.resize = resize;
    this.collapseAll = collapseAll;
    this.destroy = destroy;

}

module.exports = Nav;