/**
 * @author Ryan Ogden
 */

;(function($, window) {

	var pluginName = 'infiniteScrollHelper',
	
	/*-------------------------------------------- */
	/** Plugin Defaults */
	/*-------------------------------------------- */
	
	defaults = {
		bottomBuffer: 0, // The amount of pixels from the bottom of the window the element must be before firing a getMore event
		loadingClass: 'loading', // The class that will be added to the element after loadMore is invoked
		loadMore: $.noop, // A callback function that is invoked when the scrollbar eclipses the bottom threshold of the element
		doneLoading: $.noop // A callback that must return `true` or `false`, depending on whether loading has completed
	};

	/*-------------------------------------------- */
	/** Plugin Constructor */
	/*-------------------------------------------- */

	var Plugin = function(element, options) {

		this.element = $(element);
		this.options = $.extend({}, defaults, options);
		this.win = $(window);
		this.defaults = defaults;
		this.loading = false;
		this.doneLoadingInt = null;
		this.pageCount = 1;
		
		this._init();
	};

	/*-------------------------------------------- */
	/** Private Methods */
	/*-------------------------------------------- */
	
	Plugin.prototype._init = function() {

		this._addListeners();
	};

	Plugin.prototype._addListeners = function() {

		var self = this;

		this.win.on('scroll.' + pluginName, $.proxy(function(e) {

			var contentOffset = this.element.offset();  
			
      		if (this.win.scrollTop() + this.win.height() + this.options.bottomBuffer >= this.element.height() + contentOffset.top) {

      			if (!self.loading) {

      				self.pageCount++;
      				self.options.loadMore(self.pageCount);
      				self.loading = true;
      				self.element.addClass(self.defaults.loadingClass);

      				self.doneLoadingInt = setInterval(function() {
      					
      					if (self.options.doneLoading()) {
      						clearInterval(self.doneLoadingInt);
      						self.loading = false;
      						self.element.removeClass(self.defaults.loadingClass);
      					}
      				}, 300);
      			}
    		}
		}, this));
	};

	/*-------------------------------------------- */
	/** Public Methods */
	/*-------------------------------------------- */

	Plugin.prototype.destroy = function() {

		this.win.off('scroll.' + pluginName);
		this.options.loadMore = null;
		this.options.doneLoading = null;
		clearInterval(this.doneLoadingInt);
		this.element.data('plugin_' + pluginName, null);
	};

	/*-------------------------------------------- */
	/** Plugin Definition */
	/*-------------------------------------------- */
	
	$.fn[pluginName] = function(options) {

		return this.each(function() {
			
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery, window);