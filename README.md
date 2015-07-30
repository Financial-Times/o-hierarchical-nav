# Hierarchical nav [![Build Status](https://travis-ci.org/Financial-Times/o-hierarchical-nav.png?branch=master)](https://travis-ci.org/Financial-Times/o-hierarchical-nav)

Responsive hierarchical navigation pattern.

## Browser Support

Tested and working on:

|  Browsers  | Primary Experience | Core Experience |
|:----------:|:------------------:|:---------------:|
|   Chrome   |        35+         |       35+       |
|   Firefox  |        30+         |       30+       |
|   Safari   |        7+          |       7+        |
|   IE       |        8+          |       8+        |

Known issues:

* IE < 9 does't support the `<nav>` element. Products that need to support old IEs should use [HTML5Shiv](https://github.com/aFarkas/html5shiv) (note that it's bundled by default in [Modernizr](http://modernizr.com/).

## Navigation

All navigation options have the same general markup structure that you can see in [main.mustache](https://github.com/Financial-Times/o-hierarchical-nav/blob/master/main.mustache).

Each _navigation item_ can be either:

* __Plain text__: must still be wrapped in `<a>` tag, e.g. `<a>World</a>`
* __Linked text__: e.g. `<a href="/world">World</a>`

…and can have one of the following behaviours:

* __Standalone item__
* __Parent of sub-level__: opens further navigation list with child options
* __Controller for DOM element__: shows and hides an element elsewhere on the page, e.g. a 'mega-dropdown'

Where a _navigation item_ is both a link and a parent or controller for mega-dropdown, the default behaviour on click will be cancelled.

### Parent of sub-level

The `<li>` should be given a class of `o-hierarchical-nav__parent`, and should contain another `<ul>` list that declares its level via a data attribute:

```html
<li class="o-hierarchical-nav__parent"><a>Level 2 item with sub-level</a>
	<ul data-o-hierarchical-nav-level="3">
		<li><a>Level 3 item</a></li>
		<li><a>Level 3 item</a></li>
	</ul>
</li>
```

When the nav item is clicked, the `<li>` will have an `aria-expanded` attribute toggled, which will control the visibility of the child list.

### Controller for DOM element

The `<li>` should be given an `aria-controls` attribute with the value being the ID of the DOM element to control, for example:

```html
<li aria-controls="megadropdown"><a>Mega dropdown</a></li>

...

<div id="megadropdown" aria-hidden="true">
	Mega-dropdown content
</div>
```

When the nav item is clicked, the element targeted by the `aria-control` attribute will have its `aria-hidden` attribute toggled.

#### Megadropdowns

The horizontal base style comes with default styling for a __megadropdown__ element. This element has to add the class `.o-hierarchical-nav__mega-dropdown`.

## Responsive collapsing of horizontal navigation

__Horizontal navigation__ styles use [o-squishy-list](https://github.com/Financial-Times/o-squishy-list) to allow priorities to be set on the top level nav items:

```html
<nav>
	<ul data-o-hierarchical-nav-level="1">
		<li data-priority="2"><a>Important page</a></li>
		<li data-priority="3"><a>Less important page</a></li>
		<li data-priority="1"><a>Home</a></li>
	</ul>
</nav>
```

__o-squishy-list__ will show as many items has will fit in the available width. If not everything will fit, then the necessary number of items will be hidden, starting with the lowest priority items.

If you don't want to use a responsive horizontal navigation, you can require [Nav.js](https://github.com/Financial-Times/o-hierarchical-nav/blob/master/src/js/Nav.js) directly.

### Hidden navigation items

A 'More' item may be added to the top level which will be populated with a list of elements that have been hidden by __o-squishy-list__:

```html
<li data-more class="o-hierarchical-nav__parent" aria-hidden="true"><a>More</a></li>
```

This item is be hidden until it's needed. It's recommended that `aria-hidden="true"` should be added to a 'More' item so that it won't appear when running on core experience.

If there's a chance that all nav items will be hidden and added to the More list, then it's possible to change the text title of the More item depending on whether it contains _some_ or _all_ the navigation items:

```html
<li data-more class="o-hierarchical-nav__parent"><a><span class="nav__more--if-some">More</span><span class="nav__more--if-all">Menu</span></a></li>
```

If there is a structure required for the styling of nav components (i.e. other elements are required for icon display) or elements that are not links but should reduce to a sub-level when screen space does not allow then you can add a 'data-o-hierarchical-nav--is-cloneable' attribute and the element will be deeply cloned rather than a new anchor tag with the text content copied.

```html
<li data-o-hierarchical-nav--is-cloneable><a><div>An item to clone</div><img src="" alt="icon"></a></li>
```

## Vertical hierarchical nav

To make a nav work in a vertical layout, add `data-o-hierarchical-nav-orientiation="vertical"` to the `<nav>`.

## Arrows

Add a `<i></i>` to display an arrow icon at the end of an `<a>` element:

```html
<li class="o-hierarchical-nav__parent"><a>Item 3.2 (parent) <i></i></a>
```

## Styling

There are two base mixins for modules and products to include:

* __Horizontal__: `@include oHierarchicalNavHorizontalTheme`
* __Vertical__: `@include oHierarchicalNavVerticalTheme`

Things that are important to add to your theme are:

* Styles for the `[aria-selected="true"]` attribute
* Setting a width for `<nav>` when extending the __vertical__ theme
* Down and right arrow icons for parent elements. Make sure the size and color are correct.

If you want to style __megadropdowns__, you need to add `@at-root` before the `.o-hierarchical-nav__mega-dropdown` class.

## JavaScript instantiation

An __o-hierarchical-nav__ object must be constructed for every `<nav>` you have on your page that uses this module.

```javascript
var oHierarchicalNav = require('o-hierarchical-nav');
var nav = document.querySelector('.o-hierarchical-nav');
var hierarchicalNav = new oHierarchicalNav(nav);
```

Alternatively, a `o.DOMContentLoaded` event can be dispatched on the `document` to auto-construct a __o-hierarchical-nav__ object for each element with a `data-o-component="o-hierarchical-nav"` attribute:

```javascript
document.addEventListener("DOMContentLoaded", function() {
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
```

All this really does is run the `oHierarchicalNav.init()` function, so if you don't want this module to initialise with all the others, you can run this when it suits you best.

----

## License

Copyright (c) 2015 Financial Times Ltd. All rights reserved.

This software is published under the [MIT licence](http://opensource.org/licenses/MIT).
