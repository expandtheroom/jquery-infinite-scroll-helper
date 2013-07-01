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
		bottomBuffer: 0, // The amount of pixels from the bottom of the window the element must be before firing a getMore event
		doneLoading: null, // A callback that must return `true` or `false`, depending on whether loading has completed
		interval: 300, // The interval, in milliseconds, that the doneLoading callback will be called
		loadingClass: 'loading', // The class that will be added to the element after loadMore is invoked
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

	/*-------------------------------------------- */
	/** Plugin Constructor */
	/*-------------------------------------------- */

	var Plugin = function(element, options) {
		this.element = $(element);
		this.options = $.extend({}, defaults, options);
		this.win = $(window);
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
	 * Adds listeners required for plugin to function
	 *
	 * @private
	 */
	Plugin.prototype._addListeners = function() {
		this.win.on('scroll.' + pluginName, $.proxy(this._handleScroll, this));
	};

	Plugin.prototype._handleScroll = function(e) {
		var self = this;

		if (this._shouldTriggerLoad()) {
			this.beginLoadMore();			
			
			// if a the doneLoading callback was provided, set an interval to check when to call it			
			if (this.options.doneLoading) {
				this.doneLoadingInt = setInterval( 
					function() {
						if (self.options.doneLoading(self.pageCount)) {
							self.endLoadMore();
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
		var contentOffset = this.element.offset(),
			elementBottom = this.element.height() + contentOffset.top,
			scrollBottom = this.win.scrollTop() + this.win.height() + this.options.bottomBuffer;

      	return (!this.loading && scrollBottom >= elementBottom && this.element.is(':visible'));
	};

	/*-------------------------------------------- */
	/** Public Methods */
	/*-------------------------------------------- */

	Plugin.prototype.beginLoadMore = function() {
		this.pageCount++;
		this.options.loadMore(this.pageCount, $.proxy(this.endLoadMore, this));
		this.loading = true;
		this.element.addClass(this.options.loadingClass);
	};

	Plugin.prototype.endLoadMore = function() {
		clearInterval(this.doneLoadingInt);
      	this.loading = false;
      	this.element.removeClass(this.options.loadingClass);
	};

	/**
	 * Destroys the plugin instance
	 *
	 * @public
	 */
	Plugin.prototype.destroy = function() {
		this.win.off('scroll.' + pluginName);
		this.options.loadMore = null;
		this.options.doneLoading = null;
		$.data(this.element[0], namespace, null);
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