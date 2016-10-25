jQuery Infinite Scroll Helper
=============================

A lightweight implementation of the infinite scroll mechanic.  By providing two essential callbacks, `loadMore` and `doneLoading`, the jQuery Infinite Scroll Helper plugin makes it a breeze to add infinite scrolling functionality to your page.


Options
-------

### bottomBuffer ###
_(number)_ The number of pixels from the bottom of the window in which the `loadMore` callback should be invoked.  The default is 0.

### debounceInt ###
_(number)_ The interval, in milliseconds, that the scroll event handler will be debounced.

### doneLoading ###
_(function)_ A callback that must return `true` or `false`, signaling whether loading has completed. This callback is passed a `pageCount` argument.

### interval
_(number)_ The interval, in milliseconds, that the doneLoading callback will be called by the plugin. It will stop being called once it returns `true`. The default is 300.

### loadingClass ###
_(string)_ The class that will be added to the target element once `loadMore` has been invoked. The default is `loading`.

### loadingClassTarget ###
_(string)_ A selector targeting the element that will receive the class specified by the `loadingClass` option.

### loadMore ###
_(function)_ A callback function that is invoked when the scrollbar eclipses the bottom threshold of the element being scrolled.  This callback is passed two arguments:

* `pageCount`: The page number to loaded. This can be helpful when making requests to endpoints that require a page number.
* `done`: A callback function that should be called when loading has completed. This is an alternative way to signal that you are done loading instead of defining the `doneLoading` callback.

### loadMoreDelay ###
_(number)_ The amount of time, in milliseconds, before the loadMore callback is invoked once the bottom of the scroll container has been reached.

### startingPageCount ###
_(number)_ The starting page count that the plugin will increment each time the `loadMore` callback is invoked. The default is 1.

### triggerInitialLoad ###
_(boolean)_ Whether or not the plugin should make an initial call to the `loadMore` callback. This can be set to `true` if, for instance, you need to load the initial content asynchronously on page load.


Methods
-------

### destroy ###
Destroys the plugin instance, removing all internal listeners and nullifying any external references.

	$(selector).infiniteScrollHelper('destroy');


Usage
------

	$('#my-element-to-watch').infiniteScrollHelper({
		loadMore: function(page) {
			// load some data, parse some data
		},

		doneLoading: function() {
			// return true if you are done doing your thing, false otherwise
			return false;
		}
	});

or when using the `done` argument instead of the `doneLoading` callback

	$('#my-element-to-watch').infiniteScrollHelper({
		loadMore: function(page, done) {
			// you should use the page argument to either select an anchor/href and load 
			// the contents of that url or make a call to an API that accepts a page number
			
			var nextPageUrl = $('.pagination a').eq(page - 1).attr('href');
			
			$.get(nextPageUrl, function(data) {
				$(data).find('.items').appendTo('#my-element-to-watch');
				// call the done callback to let the plugin know you are done loading
				done();
			});
			
			// or an API perhaps
			$.getJSON('http://myawesomeapi.com/data?p=' + page, function(data) {
				// parse json data and create new html then append
				
				done();
			});
		}
	});

The plugin can also be instantiated using constructor invocation

	new InfiniteScrollHelper($('#my-element-to-watch')[0], options);


#### IE6/7 Note ####
There will most likely be an issue with the scroll offset calculation when calling the plugin direclty on an element that is set to overflow: scroll-y in IE 6 & 7. In this case, it is best to wrap the children of the element in a container and call the plugin on this container instead.

Dependencies
------------

* jQuery 1.7.0+


Changelog
---------
### 1.2.2
* Change how the scrollable element is detected by accounting for overflow scroll OR auto.
* Fix issue where position fixed elements would not trigger the `loadMore` callback when the window was scrolled past y0.

### 1.2.1
* Updated bower.json homepage URL to point to Github page.

### 1.2.0
* Added a `loadMoreDelay` option. This allows you to set a delay before the `loadMore` callback is invoked.
* Fixed issue where calling destroy before the plugin was instantiated would cause unintentional instantiation of plugin.
* Added plugin as package on Bower.

### 1.1.0
* Fixed/added the ability to use the plugin on elements with overflow scroll. Previously the plugin only worked when the element being watched was scrolled within the window.
* A `done` argument is now passed to the `loadMore` callback. You can invoke this callback to signal that you are done loading content instead of defining the `doneLoading` callback option.
* Added the `debounceInt` option. The plugin now uses debouncing for the scroll event. You can specify the interval if you want it to be different than the default 100ms.
* Added a `loadingClassTarget` option.
* Added a `startingPageCount` option.
* Added a `triggerInitialLoad` option.

### 1.0.5
* Fixed issue #4 - destroy method was not properly destroying instance which prevented another instance from being created

### 1.0.4
* The `doneLoading` callback now receives pageCount as a parameter.

### 1.0.3
* Changed details in manifest file.
* Doc updates.

### 1.0.2
* Fixed manifest file keyword error.

### 1.0.1
* Regenerated minified/production script to match development version.

### 1.0.0
* Initial Release.

License
-------
Copyright (c) 2014 Expand The Room, LLC

Licensed under the MIT license.

