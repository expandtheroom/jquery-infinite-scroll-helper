jQuery Infinite Scroll Helper
=============================

jQuery Infinite Scroll Helper is a lightweight implementation of the infinite scroll mechanic.  By providing two essential callbacks, `loadMore` and `doneLoading`, the jQuery Infinite Scroll Helper plugin makes it a breeze to add infinite scrolling functionality to your page.


Options
-------

### loadMore ###
_(function)_ A callback function that is invoked when the scrollbar eclipses the bottom threshold of the element

### doneLoading ###
_(function)_ A callback that must return `true` or `false`, depending on whether loading has completed

### bottomBuffer ###
_(integer)_ An integer specifiying the number of pixels from the bottom of the window in which the `loadMore` function should be invoked

### loadingClass ###
_(string)_ The class name that will be applied to the element when `loadMore` is called. It is removed once `doneLoading` returns `true`


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


Dependencies
------------

* jQuery 1.7.0+


Changelog
---------

