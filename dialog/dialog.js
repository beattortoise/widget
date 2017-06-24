Z.define('global/dialog', {
	initialize: function(opts) {
		var self = this;

		this.Dialog = function(opts) {
			var self = this;
			self.opts = $.extend({
				content: '',
				popClose: true,
				ok: ['确认', function() {

				}],
				cancel: ['取消', function() {

				}],
				close: function() {
				},
				height: '',
				width: ''
			}, opts);

			self.init();
		};


		this.Dialog.prototype = {
			init: function() {
				this.createDom();
				this.bindEvent();
			},
			createDom: function() {
				var _html = [], self = this;

				_html.push('<div class="global_dialog">');
				_html.push('<div class="dialog_closebg">');
				_html.push('</div>');

				_html.push('<div class="dialog_inner" style="width:'+self.opts.width+'px;' + 'height:'+self.opts.height+'px";>');
				if(self.opts.popClose) {
					_html.push('<div class="dialog_close">');
					_html.push('</div>');

				}


				_html.push('<div class="dialog_content">');
				_html.push('</div>');

				_html.push('</div>');
				_html.push('</div>');

				self.$wrap = $(_html.join(''));
				$wrapinnerWidth = self.opts.width;
				$wrapinnerHeight = self.opts.height;
				var autoHeight = ($wrapinnerHeight == 0 ) ? 'autoHeight' : '';
				self.$wrap.find(".dialog_inner").addClass(autoHeight).css({'margin-left': -($wrapinnerWidth/2), 'margin-top': -($wrapinnerHeight/2)});

				self.$wrap.find('.dialog_content').append(self.opts.content);
				$('body').append(self.$wrap);

				self.$close = self.$wrap.find('.dialog_close'); 
			},
			bindEvent: function() {
				var self = this;

				self.$close.on('click', function(e) {
					self.opts.close && self.opts.close(e);
					self.hide();
				});
			},
			show: function() {
				this.$wrap.show();
				F.disable_scroll();
			},
			hide: function() {
				this.$wrap.hide();
				F.enable_scroll();
			},
			setContent: function(html) {
				this.$wrap.find('.dialog_content').html(html);
			},
			
			on: function() {
				this.$wrap.on.apply(this.$wrap, arguments);
			},

			find: function() {
				return this.$wrap.find.apply(this.$wrap, arguments)
			},
		};



	}
})
