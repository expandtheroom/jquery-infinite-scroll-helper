jQuery Infinite Scroll Helper
=============================

jQuery Infinite Scroll Helper is a lightweight implementation of an infinite scroll.  By providing two essential callbacks, `loadMore` and `doneLoading`, the jQuery Infinite Scroll Helper plugin makes it a breeze to add infinite scrolling capabilities to your page.

Configuration
-------------

| OPTION			| TYPE				| DESCRIPTION											|
--------------------|-------------------|-------------------------------------------------------|
| loadMore			| function			| A callback function that is invoked when the scrollbar eclipses the bottom threshold of the element|
| doneLoading		| function			| A callback that must return `true` or `false`, depending on whether loading has completed|
| bottomBuffer		| integer			| An integer specifiying the number of pixels from the bottom of the winow in which the loadMore function should be invoked|

Usage
------

	:::javascript
	$('#my-element-to-watch').infiniteScrollHelper({
		loadMore: function(page) {
			// load some data, parse some data
		},
		doneLoading: function() {
			// return true if you are done doing your thing, false otherwise
			return false;
		}
	});