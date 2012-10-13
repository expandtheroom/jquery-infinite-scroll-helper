jQuery Infinite Scroll Helper
=============================

jQuery Infinite Scroll Helper is a lightweight implementation of an infinite scroll.  By providing two essential callbacks, _loadMore_ and _doneLoading_, the jQuery Infinite Scroll Helper plugin makes it a breeze to add infinite scrolling capabilities to your page.

To Use
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