# Hierarchical nav [![Build Status](https://travis-ci.org/Financial-Times/o-hierarchical-nav.png?branch=master)](https://travis-ci.org/Financial-Times/o-hierarchical-nav)

Responsive hierarchical nav.

## Navigation

There are three styles of Navigation depending on the class you add to the `<nav>`:

* __Primary__: `o-hierarchical-nav__primary-theme`
* __Secondary__: `o-hierarchical-nav__secondary-theme`
* __Tools__: `o-hierarchical-nav__tools-theme`

All Navigation options have the same general markup structure that you can see in [main.mustache](https://github.com/Financial-Times/o-hierarchical-nav/blob/master/main.mustache)

Each _navigation item_ can be either:

* __Plain text__: must still be wrapped in `<a>` tag, e.g. `<a>World</a>`
* __Linked text__: e.g. `<a href="/world">World</a>`

...and can have one of the following behaviours:

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

The `<li>` should be given an `aria-controls` attribute with the value being the ID the DOM element to control, for example:

```html
    <li aria-controls="megadropdown"><a>Mega dropdown</a></li>
    
    ...
    
    <div id="megadropdown" aria-hidden="true">
        Mega-dropdown content
    </div>
    
```

When the nav item is clicked, the element targeted by the `aria-control` attribute will have its `aria-hidden` attribute toggled.

## Responsive collapsing of navigation

All the navigation styles use [o-squishy-list](https://github.com/Financial-Times/o-squishy-list) to allow priorities to be set on the top level nav items:

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

### Hidden navigation items

A 'More' item may be added to the top level which will be populated with a list of elements that have been hidden by __o-squishy-list__:

```html
    <li data-more class="o-hierarchical-nav__parent"><a>More</a></li>
```

This item will be hidden until its needed.

If there's a chance that all nav items will be hidden and added to the More list, then it's possible to change the text title of the More item depending on whether it contains _some_ or _all_ the navigation items:

```html
    <li data-more class="o-hierarchical-nav__parent"><a><span class="nav__more--if-some">More</span><span class="nav__more--if-all">Menu</span></a></li>
```

## Hover events

It implements [o-hoverable](https://github.com/Financial-Times/o-hoverable). If a product wants hover effects to be triggered, it needs to [implement o-hoverable](https://github.com/Financial-Times/o-hoverable#using-in-a-product) too.
