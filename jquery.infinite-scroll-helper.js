;(function($, window) {

	var pluginName = 'infiniteScrollHelper',
		
		defaults = {
			bottomBuffer: 0, // The amount of pixels from the bottom of the window the element must be before firing a getMore event
			loadingClass: 'is-loading',
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
		
		this.init();
	};

	Plugin.prototype.init = function() {

		this._addListeners();
	};

	Plugin.prototype.destroy = function() {
		this.win.off('scroll.simpleInfiniteScroll');
		this.options.loadMore = null;
		this.options.doneLoading = null;
		clearInterval(this.doneLoadingInt);
		this.element.data('plugin_' + pluginName, null);
	}

	Plugin.prototype._addListeners = function() {
		var self = this;
		this.win.on('scroll.simpleInfiniteScroll', $.proxy(function(e) {
			var contentOffset = this.element.offset();  
			
      		if (this.win.scrollTop() + this.win.height() > this.element.height() + contentOffset.top)
      		{ 
      			if (!self.loading) {
      				self.options.loadMore();
      				self.loading = true;
      				self._doneLoadingInt = setInterval(function() {
      					
      					if (self.options.doneLoading()) {
      						clearInterval(self.doneLoadingInt);
      						self.loading = false;
      					}
      				}, 300);
      			}
      			self.element.addClass(self.defaults.loadingClass);
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
	}
})(jQuery, window)