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
		/**
		 * The amount of pixels from the bottom of the scrolling element in which the loadMore callback will be invoked
		 * @type {number}
		 */
		bottomBuffer: 0,
		/**
		 * The interval, in milliseconds that the scroll event handler will be debounced
		 * @type {number}
		 */
		debounceInt: 100,
		/**
		 * A callback that must return `true` or `false`, signaling whether loading has completed. This callback is passed a `pageCount` argument.
		 * @type {function}
		 */
		doneLoading: null,
		/**
		 * The interval, in milliseconds, that the doneLoading callback will be called
		 * @type {number}
		 */
		interval: 300,
		/**
		 * The class that will be added to the target element once loadMore has been invoked
		 * @type {string}
		 */
		loadingClass: 'loading',
		/**
		 * A selector targeting the element that will receive the class specified by the `loadingClass` option
		 * @type {string}
		 */
		loadingClassTarget: null,
		/**
		 * The amount of time, in milliseconds, before the loadMore callback is invoked once the bottom of the scroll container has been reached
		 * @type {number}
		 */
		loadMoreDelay: 0,
		/**
		 * A callback function that will be invoked when the scrollbar eclipses the bottom threshold of the scrolling element,
		 * @type {function}
		 */
		loadMore: $.noop,
		/**
		 * The starting page count that the plugin increment each time loadMore is invoked
		 * @type {number}
		 */
		startingPageCount: 1,
		/**
		 * Whether or not the plugin should make an initial call to loadMore. This can be set to true if, for instance, you need to load
		 * the initial content asynchronously on page load
		 * @type {boolean}
		 */
		triggerInitialLoad: false
	};

	/*-------------------------------------------- */
	/** Plugin Constructor */
	/*-------------------------------------------- */

	/**
	 * The Plugin constructor
	 * @constructor
	 * @param {HTMLElement} element The element that will be monitored
	 * @param {object} options The plugin options
	 */
	function Plugin(element, options) {
		this.options = $.extend({}, defaults, options);
		
		this.$element = $(element);
		this.$win = $(window);
		this.$loadingClassTarget = this._getLoadingClassTarget();
		this.$scrollContainer = this._getScrollContainer();
		
		this.loading = false;
		this.doneLoadingInt = null;
		this.pageCount = this.options.triggerInitialLoad ? this.options.startingPageCount - 1 : this.options.startingPageCount;
		this.destroyed = false;

		this._init();
	}

	/*-------------------------------------------- */
	/** Private Methods */
	/*-------------------------------------------- */
	
	/**
	 * Initializes the plugin
	 * @private
	 */
	Plugin.prototype._init = function() {
		this._addListeners();

		/* Call initial begin load if option is true. If not, simulate a scroll incase
		the scroll element container height is greater than the contents */
		if (this.options.triggerInitialLoad) {
			this._beginLoadMore(this.options.loadMoreDelay);
		} else {
			this._handleScroll();
		}
	};

	/**
	 * Returns the element that should have the loading class applied to it when 
	 * the plugin is in the loading state
	 * @return {jQuery} The jQuery wrapped element
	 * @private
	 */
	Plugin.prototype._getLoadingClassTarget = function() {
		return this.options.loadingClassTarget ? $(this.options.loadingClassTarget) : this.$element;
	};

	/**
	 * Finds the element that acts as the scroll container for the infinite
	 * scroll content
	 * @return {jQuery} The jQuery object that wraps the scroll container
	 */
	Plugin.prototype._getScrollContainer = function() {
		var self = this,
			$scrollContainer = null;
		
		// see if the target element is overflow-y:scroll. If so, it is the 
		// scroll container
		if (this._isScrollableElement(this.$element)) {
			$scrollContainer = this.$element;
		}

		// see if a parent is overflow-y:scroll. If so, it is the scroll container
		if (!$scrollContainer) {
			$scrollContainer = this.$element.parents().filter(function() { 
				return self._isScrollableElement($(this));
			});
		}

		// if the target element or any parent aren't overflow-y:scroll, 
		// assume the window as the scroll container
		$scrollContainer = $scrollContainer.length > 0 ? $scrollContainer : this.$win;

		return $scrollContainer;
	};

	/**
	 * Determines if the provided $el is scrollable or not
	 * @param {jQuery} $el The jQuery instance to check
	 * @returns {boolean} Returns true if scrollable, false if not
	 * @private
	 */
	Plugin.prototype._isScrollableElement = function($el) {
		return (/(auto|scroll)/).test($el.css('overflow') + $el.css('overflow-y'));
	};

	/**
	 * Adds listeners required for plugin to function
	 * @private
	 */
	Plugin.prototype._addListeners = function() {
		var self = this;
		
		this.$scrollContainer.on('scroll.' + pluginName, debounce(function() {
			self._handleScroll();
		}, this.options.debounceInt));
	};

	/**
	 * Removes all listeners required by the plugin
	 * @private
	 */
	Plugin.prototype._removeListeners = function() {
		this.$scrollContainer.off('scroll.' + pluginName);
	};

	/**
	 * Handles the scroll logic and determines when to trigger the load more callback
	 * @private
	 */
	Plugin.prototype._handleScroll = function(e) {
		var self = this;

		if (this._shouldTriggerLoad()) {
			this._beginLoadMore(this.options.loadMoreDelay);
			
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
	 * @return {boolean} true if the load more callback should be triggered, false otherwise
     * @private
	 */
	Plugin.prototype._shouldTriggerLoad = function() {
		var elementBottom = this._getElementBottom(),
			scrollBottom = this.$scrollContainer.scrollTop() + this.$scrollContainer.height() + this.options.bottomBuffer;

		return (!this.loading && scrollBottom >= elementBottom && this.$element.is(':visible'));
	};

	/**
	 * Retrieves the height of the element being scrolled
	 * @return {number} The height of the element being scrolled
	 * @private
	 */
	Plugin.prototype._getElementHeight = function() {
		if (this.$element == this.$scrollContainer) {
			return this.$element[0].scrollHeight;
		} else {
			return this.$element.height();
		}
	};

	/**
	 * Calculate the pixel height to the bottom of the scrolling element
	 * @returns {number} The pixel height to the bottom of the scrolling element.
	 * @private
	 */
	Plugin.prototype._getElementBottom = function() {
		if (this.$element == this.$scrollContainer) {
			return this._getElementHeight();
		}

		return this._getElementHeight() + this.$element.offset().top;
	};

	/**
	 * Initialize a call to the loadMore callback and set to loading state
	 * @param  {number} delay The amount of time, in milliseconds, to wait before calling the load more callback
	 * @private
	 */
	Plugin.prototype._beginLoadMore = function(delay) {
		delay = delay || 0;

		setTimeout($.proxy(function() {
			this.pageCount++;
			this.options.loadMore(this.pageCount, $.proxy(this._endLoadMore, this));
			this.$loadingClassTarget.addClass(this.options.loadingClass);
		}, this), delay);
		
		this.loading = true;
		this._removeListeners();
	};

	/**
	 * Return the plugin to the not loading state
	 * @private
	 */
	Plugin.prototype._endLoadMore = function() {
		clearInterval(this.doneLoadingInt);
		this.loading = false;
		this.$loadingClassTarget.removeClass(this.options.loadingClass);
		!this.destroyed && this._addListeners();
	};

	/*-------------------------------------------- */
	/** Public Methods */
	/*-------------------------------------------- */

	/**
	 * Destroys the plugin instance
	 * @public
	 */
	Plugin.prototype.destroy = function() {
		this._removeListeners();
		this.options.loadMore = null;
		this.options.doneLoading = null;
		$.data(this.$element[0], namespace, null);
		clearInterval(this.doneLoadingInt);
		this.destroyed = true;
	};

	/*-------------------------------------------- */
	/** Helpers */
	/*-------------------------------------------- */
	
	// A utility method for calling methods on the plugin instance
	function callMethod(instance, method, args) {
		if ( instance && $.isFunction(instance[method]) ) {
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
	}

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

			if (!plugin && !method) {
				$.data(this, namespace, new Plugin(this, options));
			} else if (method) {
				callMethod(plugin, method, Array.prototype.slice.call(methodArgs, 1));
			}
		});
	};

	// expose plugin constructor on window
	window.InfiniteScrollHelper = window.InfiniteScrollHelper || Plugin;

})(jQuery, window);