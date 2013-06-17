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
		doneLoading: $.noop, // A callback that must return `true` or `false`, depending on whether loading has completed
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

	function Plugin(element, options) {

		this.element = $(element);
		this.options = $.extend({}, defaults, options);
		this.win = $(window);
		this.loading = false;
		this.doneLoadingInt = null;
		this.pageCount = 1;
		this._init();
	}

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
		
		var self = this;

		self.win.on('scroll.' + pluginName, function(e) {

      		if (self._shouldTriggerLoad()) {

  				self.pageCount++;
  				self.options.loadMore(self.pageCount);
  				self.loading = true;
  				self.element.addClass(self.options.loadingClass);
  				
  				self.doneLoadingInt = setInterval( 
  					function() {
      					if (self.options.doneLoading(self.pageCount)) {
      						clearInterval(self.doneLoadingInt);
      						self.loading = false;
      						self.element.removeClass(self.options.loadingClass);
      					}
  					}, 
  				self.options.interval);
      		}
		});
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
	}

	/*-------------------------------------------- */
	/** Public Methods */
	/*-------------------------------------------- */

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
