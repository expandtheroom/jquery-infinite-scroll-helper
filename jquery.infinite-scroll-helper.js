/**
 * @author Ryan Ogden
 */

;(function($, window) {
	
	'use strict';

	var pluginName = 'infiniteScrollHelper',
		namespace = 'plugin_' + pluginName;
	
	/*-------------------------------------------- */
	/** Plugin Defaults */
	/*-------------------------------------------- */

	var	defaults = {
		bottomBuffer: 0, // The amount of pixels from the bottom of the window the element must be before firing a loadMore event
		debounceInt: 100, // The interval, in milliseconds that the scroll event handler will be debounced
		doneLoading: null, // A callback that must return `true` or `false`, depending on whether loading has completed
		interval: 300, // The interval, in milliseconds, that the doneLoading callback will be called
		loadingClass: 'loading', // The class that will be added to the element after loadMore is invoked
		loadingClassTarget: null, // A selector targeting the element that will receive the loadingClass
		loadMore: $.noop // A callback function that is invoked when the scrollbar eclipses the bottom threshold of the element
	};

	/*-------------------------------------------- */
	/** Helpers */
	/*-------------------------------------------- */
	
	function callMethod(instance, method, args) {
		if ( $.isFunction(instance[method]) ) {
			instance[method].apply(instance, args);
		}
	}

	// Borrowed from Underscore.js (http://underscorejs.org/)
	function debounce(func, wait, immediate) {
		var timeout;

		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	/*-------------------------------------------- */
	/** Plugin Constructor */
	/*-------------------------------------------- */

	function Plugin(element, options) {
		this.options = $.extend({}, defaults, options);
		
		this.$element = $(element);
		this.$loadingClassTarget = this.options.loadingClassTarget ? $(this.options.loadingClassTarget) : this.$element;
		this.$scrollContainer = this._getScrollContainer();
		this.$win = $(window);
		
		this.loading = false;
		this.doneLoadingInt = null;
		this.pageCount = 1;

		this._init();
	};

	/*-------------------------------------------- */
	/** Private Methods */
	/*-------------------------------------------- */
	
	/**
	 * Initializes the plugin
	 * 
	 * @private
	 */
	Plugin.prototype._init = function() {
		this._addListeners();
	};

	/**
	 * Finds the element that acts as the scroll container for the infinite
	 * scroll content
	 * 
	 * @return {$} The jQuery object that wraps the scroll container
	 */
	Plugin.prototype._getScrollContainer = function() {
		var $scrollContainer = null;
		
		// see if the target element is overflow-y:scroll. If so, it is the 
		// scroll container
		if (this.$element.css('overflow-y') == 'scroll') {
			$scrollContainer = this.$element;
		}

		// see if a parent is overflow-y:scroll. If so, it is the scroll container
		if (!$scrollContainer) {
			$scrollContainer = this.$element.parents().filter(function() { 
				return $(this).css('overflow-y') == 'scroll';
			});
		}

		// if the target element or any parent aren't overflow-y:scroll, 
		// assume the window as the scroll container
		$scrollContainer = $scrollContainer.length > 0 ? $scrollContainer : $(window);

		return $scrollContainer;
	};

	/**
	 * Adds listeners required for plugin to function
	 *
	 * @private
	 */
	Plugin.prototype._addListeners = function() {
		var self = this;
		this.$scrollContainer.on('scroll.' + pluginName, debounce(function() {
			self._handleScroll();
		}, this.options.debounceInt));
	};

	/**
	 * Handles the scroll logic and determins when to trigger the load more callback
	 *
	 * @private
	 */
	Plugin.prototype._handleScroll = function(e) {
		var self = this;
		console.log('handlescroll');
		if (this._shouldTriggerLoad()) {
			this._beginLoadMore();			
			
			// if a the doneLoading callback was provided, set an interval to check when to call it			
			if (this.options.doneLoading) {
				this.doneLoadingInt = setInterval( 
					function() {
						if (self.options.doneLoading(self.pageCount)) {
							self._endLoadMore();
						}
					}, 
					this.options.interval
				);
			}
  		}
	};

	/**
	 * Determines if the user scrolled far enough to trigger the load more callback
     *
	 * @return {Boolean} true if the load more callback should be triggered, false otherwise
     * @private
	 */
	Plugin.prototype._shouldTriggerLoad = function() {
		var elementBottom = this.$element.height(),
			scrollBottom = this.$scrollContainer.scrollTop() + this.$scrollContainer.height() + this.options.bottomBuffer;
      	console.log(elementBottom + ' : ' + scrollBottom);
      	return (!this.loading && scrollBottom >= elementBottom && this.$element.is(':visible'));
	};

	/**
	 * Initialize a call to the loadMore callback and set to loading state
	 * 
	 * @private
	 */
	Plugin.prototype._beginLoadMore = function() {
		this.pageCount++;
		this.options.loadMore(this.pageCount, $.proxy(this._endLoadMore, this));
		this.loading = true;
		this.$loadingClassTarget.addClass(this.options.loadingClass);
	};

	/**
	 * Return the plugin to the not loading state
	 * 
	 * @private
	 */
	Plugin.prototype._endLoadMore = function() {
		clearInterval(this.doneLoadingInt);
      	this.loading = false;
      	this.$loadingClassTarget.removeClass(this.options.loadingClass);
	};

	/*-------------------------------------------- */
	/** Public Methods */
	/*-------------------------------------------- */

	/**
	 * Destroys the plugin instance
	 *
	 * @public
	 */
	Plugin.prototype.destroy = function() {
		this.$scrollContainer.off('scroll.' + pluginName);
		this.options.loadMore = null;
		this.options.doneLoading = null;
		$.data(this.$element[0], namespace, null);
		clearInterval(this.doneLoadingInt);
	};

	/*-------------------------------------------- */
	/** Plugin Definition */
	/*-------------------------------------------- */
	
	$.fn[pluginName] = function(options) {
		var method = false,
			methodArgs = arguments;

		if (typeof options == 'string') {
			method = options;
		}

		return this.each(function() {

			var plugin = $.data(this, namespace);

			if (!plugin) {
				$.data(this, namespace, new Plugin(this, options));
			} else if (method) {
				callMethod(plugin, method, Array.prototype.slice.call(methodArgs, 1));
			}
		});
	};

})(jQuery, window);