;(function($,window, document, undefined){
	$.fn.imagezoom = function(parameter, getApi) {
		if(typeof parameter == 'function') {   //重载
			getApi = parameter;
			parameter = {};
		}else {
			parameter = parameter || {};
			getApi = getApi || function(){};
		}
		var defaults = {
			target: 'zoom',   //元素下所有图片集
			spacing: 40,
			width: 520,
			height: 338,
		};	
		var options = $.extend({}, defaults, parameter);
		var $window = $(window);
		var $body = $('body');

		return this.each(function() {
			//全局变量
			var $this = $(this);
			var $overlay= $('.gallery-overlay');   //弹窗overlay
			var $gallery= $('.Gallery');   //图片集
			var $closeTarget = $gallery.find('.Gallery-closeTarget');  //遮罩层关闭
			var $content = $gallery.find('.Gallery-content');
			var $close = $gallery.find('.modal-close');
			var $media = $gallery.find('.Gallery-media');
			var $prev = $gallery.find('.GalleryNav--prev');
			var $next= $gallery.find('.GalleryNav--next');

			var winHeight = $(window).height(); 
		    winHeight = winHeight - 2*options.spacing;  //最终高度
			var winWidth = $(window).width(); 
		    winWidth = winWidth - 2*options.spacing;

			var _api = {};  //对外接口
			nowImg = 0;  //默认第一张 
			var obj = [];  //存放图片信息
			var $target = $this.find('.'+options.target);
			var $img = '';
			var ilen = '';
			var timer = null;
			
			//控制遮罩层
			var overlay = function(is_show) {
				eval('$overlay.'+ is_show +'()');
				eval('$gallery.'+ is_show +'()');
			}

			//获取图片尺寸
			var getSize = function(img,i) {
				var prop = {
					'width': img.width,
					'height': img.height,
					'src': img.src
				}
				obj[i] = prop;  //按顺序写入，防止浏览器缓存加载导致顺序错误
				return;
			}

			var getRatio = function(ratio, width, height) {  //求比例
				if(width != '' && height != '') {
					options.height= height;
					options.width = width;
				}else if(height != '') {
					options.height= height;
					options.width =  options.height*ratio;  
				} else {
					options.width = width;
					options.height =  options.width/ratio;  
					//有一种情况小于
				}
				return;
			}

			var getHtml = function() {   //获取图片能内容
				var nowHtml = '<img src="http://static.zealer.com/images/loading.gif" style="" />';
				$media.html(nowHtml);

				if(typeof obj[nowImg] != "undefined") {
					//判断长宽
					//宽高对比存在五种情况
					var width = obj[nowImg].width;
					var height = obj[nowImg].height;
					var ratio  = width/height;

					if(width > winWidth) {
						if(height > winHeight) {
							if((width/height) > (winWidth/winHeight)) {  //长宽超出，长>宽 系数大，宽
								getRatio(ratio, winWidth, '');
							}else {         //长宽超出，长<宽
								getRatio(ratio, '', winHeight);
							}
						}else {
							getRatio(ratio, winWidth, '');  //长超出,宽不超出
						}
					}else {
						if(height > winHeight) {
							getRatio(ratio, '', winHeight);  //长不超出，宽超出
						}else {
							getRatio(ratio, width, height); //长不超出，宽不超出
						}
					}
					nowHtml = '<img src ="' + obj[nowImg].src + '" style="width: '+ options.width+'px;height: '+ options.height +'px"/>';
					$media.html(nowHtml);
					clearTimeout(timer);
					return;

				}
				timer = setTimeout(function(){
					getHtml();
				}, 1000);
			}

			// 获取图片对象
			var getImg = function() {
				$.each($img,function(i,item) {      //获取新的图片对象
					var $item = $(this);
					var _src = $item.prop('src');
					var patter = /[http:\/\/].*\.(png|gif|jpg)/;
					_src = _src.match(patter)[0] || '';
					var img = new Image();
					img.src = _src;
					if(img.complete) {   // 浏览器缓存
						getSize(img,i);
						return;
					}
					img.onload = function() {   //重新加载
						getSize(img,i);
						return;
					}

				})
			}


			//提供操作接口
			//放大图片开启
			_api.open = function($self) {
				if($self && !$self.closest($('.'+options.target)).data('open')) {
					obj = [];
					getImg();  //获取图片
				}
				getHtml();
				//打开遮罩层
				overlay('show');
				
			}

			//放大图片关闭
			_api.close = function(callback) {
				//关闭遮罩层
				overlay('hide');
			}


			//下一个
			_api.next= function() {
				$prev.addClass('enabled');
				if($next.hasClass('enabled')) {
					nowImg++;
					getHtml();
					if(nowImg == ilen-1) {
						$next.removeClass('enabled');
					}
				}
			}

			//上一个
			_api.prev= function(callback) {
				$next.addClass('enabled');
				if($prev.hasClass('enabled')) {
					nowImg--;
					getHtml();
					if(nowImg == 0) {
						$prev.removeClass('enabled');
					}
				}
			}


			//事件绑定
			$target.on('click', 'li', function() {
				$('.'+options.target).data('open',false);
				var $self = $(this); 
				var $target = $self.closest('.'+options.target);
				$img = $target.find('img'); 
				ilen = $img.length;

				nowImg= $self.index();

				$next.addClass('enabled');
				$prev.addClass('enabled');
				nowImg == ilen-1 && $next.removeClass('enabled');
				nowImg == 0 && $prev.removeClass('enabled');

				_api.open($self);
				$target.data('open', true);

			})

			//下一个
			$next.on('click', function() {
				_api.next(); 
			})

			//上一个
			$prev.on('click', function() {
				_api.prev(); 
			})

			$close.click(_api.close);
			$closeTarget.click(_api.close);
			getApi(_api);

		})
	}

})(jQuery,window,document);
