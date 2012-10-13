;(function($, window) {

	var pluginName = 'infiniteScrollHelper',
		
		defaults = {
			bottomBuffer: 0, // The amount of pixels from the bottom of the window the element must be before firing a getMore event
			loadingClass: 'loading-more',
			loadMore: $.noop,
			doneLoading: $.noop
		};	

	var Plugin = function(element, options) {

		this.element = $(element);
		this.options = $.extend({}, defaults, options);
		this.win = $(window);
		this.defaults = defaults;
		this.loading = false;
		this.doneLoadingInt = null;
		this.pageCount = 1;
		
		this.init();
	};

	Plugin.prototype.init = function() {

		this._addListeners();
	};

	Plugin.prototype.destroy = function() {
		this.win.off('scroll.' + pluginName);
		this.options.loadMore = null;
		this.options.doneLoading = null;
		clearInterval(this.doneLoadingInt);
		this.element.data('plugin_' + pluginName, null);
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

	// define plugin
	$.fn[pluginName] = function(options) {

		return this.each(function() {
			
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery, window);