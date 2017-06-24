/**
 * 弹窗组件
 * @Date   2015-05-11
 * @author  wu
 */
// 


var Dialog = function(opts) {
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


Dialog.prototype = {
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

//分页
var Page = function(opts) {
	this.opts = $.extend({
		wrap: '',
		num: 3,  //定义当前页面的前后显示个数
		currentPage: 1,
		totalPage: 0,
		data: {},
		url: '',
		type: 'json',
		next: true,
		prev: true,
		loadWrap: '',
		method: 'get',  //get or post
		callback: function(data, currentPage, isCache) {
		}
	}, opts);
	this.init();
};


Page.prototype = {
	init: function() {
		this.dataCache = {};
		var _page = F.parseURL().params.page;
		//地址栏page页数判定		
		if(_page) {
			this.setStyle(_page);
			this.getData(_page);
		}else{
		    this.setStyle(this.opts.currentPage);
		}
	},

	setStyle: function(cp) {
		this.currentPage = cp;
		this.totalPage = this.opts.totalPage;
		var html = '';
		var begin = 1;
		var end = this.opts.totalPage;
		var cNum = this.opts.num;   
		var showPage = 2*cNum+3;  
		var cltNum = (showPage+1)/2;  
		this.currentPage = parseInt(this.currentPage);

		//设定上一页
		//获取url当前页面
		
		var queryPage = F.parseURL().query;
		var i = queryPage.search(/page=/);
		queryPage = queryPage.slice(i+5);

		if(this.opts.prev) {
			html += '<a class="prev" style="display: none" data-value='+ this.currentPage+' href="javascript:;"> &lt;</a>';
			if(queryPage && queryPage>1) {
				$('.global_page').find('.prev').show().data('value', queryPage);
			}
		}
		var pageLink = function(i, type) {
			type = type || '';
			
			if(type == 'current') {
				return '<a href="javascript:;" class="curr page">' +i+ '</a>';
			} else if(type == 'dot') {
				return '<span>&nbsp;</span>';
			}
			return '<a href="javascript:;" class="page" title="第'+i+'页">'+i+'</a>';  
		};

        //首尾样式...
		var dot = pageLink('','dot');
		var dotEnd = pageLink('','dot')+pageLink(this.totalPage);  

		//分页处理 1~9
		if(this.totalPage <= showPage) {
			for(var i=1; i<=this.totalPage; i++) {
				if(this.currentPage == i) {
					html += pageLink(i, 'current');
				}else {
					html += pageLink(i);
				}
			}

		} else {
			// 当前页小于6页 1~8...end 
			if(this.currentPage <=cltNum) {
				for(var i=1; i<=showPage-1; i++) {
					if(this.currentPage == i) {
						html += pageLink(i, 'current');
					}else {
						html += pageLink(i);
					}
				}
				html += dotEnd;

			}else {
				//当前页大于6页前面加上1...c-3~c+3...end
				 html += pageLink(1);
				 html += dot; 

				 begin = this.currentPage - cNum;
				 end =  this.currentPage + cNum;

				 //当最后4页的时候不显示后面的
				 //1...end-7~end
				 if(this.totalPage - this.currentPage <= cNum+1) {
					 end = this.totalPage;
					 begin = this.totalPage - (2*cNum+1);
				 }

				 //当前页切换
				 for(var i=begin; i<=end; i++) {
					if(this.currentPage == i) {
						html += pageLink(i, 'current');
					}else {
						html += pageLink(i);
					}
				 }
				 if(end != this.totalPage) {
					html += dotEnd;
				 }
			}
		}



		this.$wrap = $(this.opts.wrap);
		this.$page = $('<div class="global_page">');

		if(this.opts.next) {
			html += '<a class="next" data-value='+ this.currentPage+' href="javascript:;">&gt; </a>';
		}

        //如果只有一页，不显示分页
		if(this.totalPage <= 1 || isNaN(this.totalPage)) {
			html = '';
		}
	
		this.$page.html(html);
		this.$wrap.empty().append(this.$page);
		this.$pageNum = this.$page.find('a');

		this.bindEvent();

	},
	bindEvent: function() {
		var self = this;

		/*$(window).bind('popstate',  function(event) {
			var page = (event.originalEvent.state && event.originalEvent.state.page) ? event.originalEvent.state.page : '1';
		    self.setStyle(page);
			self.getData(page);
		});*/

		//分页操作
		this.$wrap.find('.global_page').on('click', '.page', function() {
			var $this = $(this);
			//当前页不进行操作
			if($this.hasClass("curr")) {
				return false;
			}
			self.currentPage = parseInt($this.text());

			//设定样式
		    self.setStyle(self.currentPage);
			//获取数据
			self.getData(self.currentPage);

			//上一页隐藏
			if(self.currentPage == 1) {
				$('.global_page').find('.prev').hide();
			}else {
				$('.global_page').find('.prev').show();
			}
			//下一页隐藏
			if(self.currentPage >=  self.opts.totalPage) {
				$('.global_page').find('.next').hide();
			}

			var urlQuery = F.parseURL().query.replace(/[?&]page=(\d)*/, '');
			//console.log(urlQuery);
			var type =  (urlQuery === '') ? 'all' : urlQuery.split('=')[1];
			//console.log(type);

			window.history.pushState && window.history.pushState({"page": self.currentPage, "type": type}, '');

			return false;
		})

		//上一页
		this.$wrap.find('.global_page').on('click', '.prev', function() {
			var $this = $(this);
			var prevPage = $this.data('value')-1;
			
			if(prevPage >= 1) {
				self.setStyle(prevPage);
				self.getData(prevPage);
			}

			//上一页隐藏
			if(prevPage == 1) {
				$('.global_page').find('.prev').hide();
			}else {
				$('.global_page').find('.prev').show();
			}
			//window.history.pushState && window.history.pushState({"page": prevPage}, '', '?page='+prevPage);
		})
		//下一页
		this.$wrap.find('.global_page').on('click', '.next', function() {
			var $this = $(this);
			var nextPage = $this.data('value')+1;

			if(nextPage <= self.opts.totalPage) {
				self.setStyle(nextPage);
				self.getData(nextPage);
			}
			$('.global_page').find('.prev').show();

			//下一页隐藏
			if(nextPage >= self.opts.totalPage) {
				$('.global_page').find('.next').hide();
			}
			//window.history.pushState && window.history.pushState({"page": nextPage}, '', '?page='+nextPage);
		})

	},

	getData: function(cp) {
		var self = this;
		this.currentPage = cp;
		if(this.opts.loadWrap) {
			this.opts.loadWrap.html('<div class="load_wrap"><span class="loading"></span></div>');
		}
		if(this.dataCache[this.currentPage]) {
			this.opts.callback && this.opts.callback(this.dataCache[this.currentPage], this.currentPage, true);
			return ;
		}

		$.ajax({
			url: this.opts.url,
			type: this.opts.method,
			dataType: this.opts.type, 
			data: $.extend({page: self.currentPage}, this.opts.data),
			success: function(json) {
				if(self.opts.type == 'json')  {
					if(json.status != 200) {
						alert(json.message);
						return;
					}
				}
				self.dataCache[self.currentPage] = json;
				self.opts.callback && self.opts.callback(json, self.currentPage, false);
			},
			error: function(err) {
				alert(err);
			}
		})
	}
}



/**
 * 回到顶部组件
 * @author wu
 * @Date   2015-09-24
 */
// 


var goTop = function(opts) {
	this.opts = $.extend ({
		 dom: '',
		 showPos: '',
		 bottom: ''
	}, opts);
	this.init();
};
goTop.prototype =  {

	init: function() {
		var self = this;
		var _windowH = $(window).height();
		var fixedBottom  =  parseInt(self.opts.dom.css('bottom'));

		//自适应高度
		$(window).on('resize', function() {
			_windowH = $(window).height();
			self.bindEvent(_windowH, fixedBottom);
		});

		this.bindEvent(_windowH, fixedBottom);
	},
	bindEvent: function(_windowH, fixedBottom) {
		var self = this;
		var $dom = self.opts.dom;

		$(window).scroll(function() {
			var _bodyH = $(document).height();
			var scrollTop = $(window).scrollTop();

			var _textH = _bodyH-_windowH-self.opts.bottom-fixedBottom;

			// 距离底部定位
			if(scrollTop > _textH) {
				$dom.css("bottom", scrollTop-_textH);
				return;
			}

			// 大于两倍屏幕高度显示
			if (scrollTop > self.opts.showPos){
				$dom.show();
				$dom.css("bottom",fixedBottom);
			} else {
				$dom.hide();
			}
		});


		//跳到顶部
		$dom.find('.goTop_icons').bind('click', function() {
			$('body,html').animate({scrollTop:0},200);
			return false;
		})
	}

}

/**
 * 移动端至底下滑加载更多
 * @author  wu
 * @Date   2016-05-09
 */
// 

var Loadmore = function(opts) {

	this.opts = $.extend({
		wrap: '',   
		requestData: {},
		url: '',
		count: 10,  //显示的数量
		callback: function() {
		}
	}, opts);

	this.init();
}

Loadmore.prototype = {
	init: function() {
		var self = this;
		var $wrap = self.opts.wrap;

		//load内容
		this.$moreWrap = $wrap.find('.global_more_wrap');
		//load.gif
		this.$loadGif = $wrap.find('.global_load');
		//显示加载更多
		this.$loadBox = $wrap.find('.global_more_content');

		this.total_num = 0;  //
		this.page = 1; //scroll请求
		this.postSwitch = true; //防止到达底部的多次触发

		this.bindEvent();
		this.getData();
	},
	bindEvent: function() {
		var self = this;
		var winHeight = $(window).height();
		var _distance = 50; //滑动距离底边距

		$(window).scroll(function(){
			var scrollPos = $(window).scrollTop();
			var totalHeight = parseFloat(winHeight) + parseFloat(scrollPos);
			var docHeight = parseFloat($(document).height());
			var _max_page = Math.ceil(self.total_num/self.opts.count); //多请求了一次,加载更多
			if(docHeight-_distance < totalHeight && self.page <= _max_page && self.postSwitch) { 
				self.postSwitch = false;
				self.page++;
				self.getData(self.page);
			}

			if(self.page > _max_page) {
				self.$loadBox.show();
			}
		});
	},
	getData: function(page) {
		var self = this;
		var _url = self.opts.url;
		var _data = self.opts.requestData;
		var _count = self.opts.count;

		page = page || 1;

		self.$loadGif.show();

		_data.page = page; //请求page
		_data.count = _count;
		_data.t = +new Date();

		$.get(_url, _data,function(json) {
			self.postSwitch = true;
			if(json.status == 200) {
				setTimeout(function(){}, 2000)
				self.$loadGif.hide();
				self.$loadBox.hide();
				self.$moreWrap.append(json.message.html)
				self.total_num = json.message.total_number;
				if(self.total_num < self.opts.count) {
					self.$loadBox.show();
				}
				self.opts.callback && self.opts.callback();
			}else {
				alert(json.message);
			}
		}, 'json');
	}
}

//动态监测数字剩余

var Calculatenum = function(opts) {

	/**
	 * @dom 输入字数的容器dom节点
	 * @maxNum 输入最大字数
	 * @postNum 总共数量dom节点
	 * @ textarea   val() 
	 * */

	this.opts = $.extend({
		dom: '',   
		maxNum: 200,
		moreInsert: '',
		callback: function() {
		}
	}, opts);

	this.init();
}

Calculatenum.prototype = {
	init: function() {
		var self = this;

		var $frameBox = this.opts.dom;
		var $moreInsert = this.opts.moreInsert;
		var maxLength = this.opts.maxNum;
		var frame_rm = maxLength;

		var countLength = function () {
			var frameNum = $frameBox.val().length;
			frame_rm = maxLength - frameNum;
			if(frame_rm >= 0) {
				$moreInsert.html('还可以输入 <span>'+frame_rm+'</span> 字');
			}else {
				$moreInsert.html('已经超出 <span class="post_num">'+frame_rm+'</span> 字');
			}
		}

		$frameBox.on('keyup',function() {
			countLength();
		});

		$frameBox.on('keydown',function() {
			countLength();
		});

		$frameBox.on('blur', function() {
			countLength();
		})
	}
};

/**
 * 倒计时组件 － used: 秒杀专题页 
 * @Date   2016-09-27
 * @author wu
 */
// 增加systemTime参数，避免拿用户本地的时间
var Timer = function(opts) {
	this.opts = $.extend({
		wrap: '',
		end: '',
		show: ['hour', 'min', 'sec'],
        interval: 1000,
		systemTime: '',
		callback: function(){}
	}, opts);

	this.init();
};

Timer.prototype = {
	init: function() {
        this.run();
	},
	createDom: function(leftD,leftH,leftM,leftS,leftMS) {
		var self = this;
		var _html = [];
		_html.push('<ul class="global_timer clear">');
        var timeBox = {
            'day': ['天', leftD],
            'hour': ['时', leftH],
            'min': ['分',leftM],
            'sec': ['秒',leftS],
            'mill': ['',leftMS]
        }

		//重组需要的时间数字长度。譬如113分钟
        for(var showLen =  this.opts.show.length, i=0;  i<showLen; i++ ) {
            var val = this.opts.show[i];
			_html.push('<li class="time_'+ val  +'">');
			var str = '';
			for(var numLen = timeBox[val][1].length, j=0; j<numLen; j++) {
				str += '<span>'+timeBox[val][1].charAt(j)+'</span>';
			}
			_html.push(str+'<em>' + timeBox[val][0] +'</em></li>');
        }
		_html.push('</ul');

		this.$wrap = $(this.opts.wrap);
		this.$wrap.html(_html.join(''));

	},
	run: function() {
		var self = this;
		var end = self.opts.end * 1000;   //总毫秒数 
		var systemTime = self.opts.systemTime* 1000 + self.opts.interval;   //先执行setInterval所以加回1秒

		function makeZero(num) {
			var str = num.toString();
			if(str.length < 2) {
				str = '0' + str;
			}
			return str;
		}

		function exu(self, left) {
            var _left = Math.floor(left/(1000/self.opts.interval)); 

			var distance = makeZero(Math.floor(_left/3600)); //获取小时

			var leftD = makeZero(Math.floor(distance/24));
			var leftH = makeZero(Math.floor(distance-leftD*24));  //重新-day计算H
			var leftM = makeZero(Math.floor((_left - distance * 3600)/60));
			var leftS = makeZero(Math.floor(_left - distance * 3600 - leftM * 60));
			var leftMS = left.toString(); 
			leftMS = leftMS.charAt(leftMS.length - 1);


            switch(self.opts.show[0]) {  
				case 'hour':           //时为最大单位 
					leftH = distance;
					break;
				case 'min':           //分为最大单位 
					leftM = makeZero(Math.floor(_left/3600*60)); 
					break;
				case 'sec':           //秒为最大单位 
					leftS = makeZero(Math.floor(_left)); 
					break;
            }
			self.createDom(leftD,leftH,leftM,leftS,leftMS);
		}

		// 定时器改成按需要的interval跑一次，自动增加systemTime
		var init = setInterval(function(){
            var interval = self.opts.interval;
			var left = Math.floor((end - systemTime)/interval);  // 跳一次的频率

			if(end < systemTime) {
				clearInterval(init);
				self.opts.callback && self.opts.callback();
			} else {
				exu(self, left);
			}
			systemTime = systemTime + interval;
		}, self.opts.interval);

	}
};

/**
 * 图片放大组件 － used: 社区帖子评论图片放大
 * @Date   2016-06-29
 */
var scaleImg = function(opts) {
	this.opts = $.extend({
		wrap: '',
		clickimgs: '',
		callback: function(){}
	}, opts);
	
	this.images_n = []; //保存一条评论中的所有图片
	this.$showArrow = false; //显示左右翻页按钮	
	this.$image = new Image(); //新的image对象，用于大图展示
	this.now_page = 0; //翻页索引
	this.init();
};
scaleImg.prototype = {
	init: function() {
		this.createDom();
		this.bindEvt();
	},

	createDom: function() {
		var _html = [];
		_html.push('<div class="scaleImg_box zoom">');
		_html.push('<div class="zoom_content"> ');
		_html.push('</div>');
		_html.push('</div>');

		this.opts.wrap = $('body');
		this.$wrap= $(this.opts.wrap);
		this.$wrap.append(_html.join(''));
		this.zoom = this.$wrap.find('.zoom');	
	},

	bindEvt: function() {
		var self = this;
		
		$(self.opts.clickimgs).on('click' , '.img_mask', function() {
			var $this = $(this).prev('img');
			self.nextPic($this);	
		});
		
		self.$wrap.on('click', function() {
			self.zoom.hide();
			$('body').css('overflow', 'auto');
		});

		//右翻页
		this.$wrap.on('click', '.zoom_right', function(event) {
			var number = $(this).data('num');
			if(number+1 <= self.images_n.length - 1) {
				self.nextPic($(self.images_n[number+1]));	
			}
			event.stopPropagation();
		});
		
		//左翻页
		this.$wrap.on('click', '.zoom_left', function(event) {
			var number = $(this).data('num');
			if(number > 0 ) {
				self.nextPic($(self.images_n[number-1]));	
			}
			event.stopPropagation();
		});
	},
	
	//处理左右翻页来源
	nextPic: function($this) {
		var self = this;	
		self.now_page = 0;	
		self.images_n = [];   	
		var sibParentImg = $this.parent().parent().find('img');
		for(var i = 0; i < sibParentImg.length; i++) {	
			if($(sibParentImg[i]).attr('src') == $this.attr('src')) {
				self.now_page = i;
			}
			self.images_n.push(sibParentImg[i]);
		}
		if(self.images_n.length > 1) {
			self.$showArrow = true;	
		} else {
			self.$showArrow = false;	
		}
		
		var src = $this.attr('src');
		if(src.indexOf('?') != -1) {	
			src = src.substring(0, src.indexOf('?'));
		}
		self.limitPic(src);
	},
	
	//处理图片的大小
	limitPic: function(src) {
		var self = this;	
		$image = self.$image;	
		$image.src = src;
		$image.onload = function() {
			var w = $image.width;
			var h = $image.height;
			var height = (window.document.documentElement.clientHeight || window.document.body.clientHeight) - 100;
			var width = (window.document.documentElement.clientWidth || window.document.body.clientWidth) - 100;
			
			if(w < width) { //若图片的宽度小于屏幕的宽度，则以实际宽度为准
				width = w;	
			}
			if(h < height) { //同以上
				height = h;	
			}
			self.showBigPic(src, width, height);	
		}
	},
	
	//显示大图
	showBigPic: function(thisImg, width, height) {
		var self = this;
	  	var zoom_content = self.$wrap.find('.zoom_content');
		zoom_content.html('');
		var close = '<div class="dialog_close"></div>';
		zoom_content.append(close);
		zoom_content.append('<div class="img_con"><img src=' + thisImg + '></div>');
		zoom_content.animate({
		  width: width + 80 + 'px',
		  marginLeft: -(width/2) + 'px',
		  marginTop: -(height/2) + 'px'
		}, 0, null, function() {
			if(self.$showArrow) {
				var arrow_html = [];
					arrow_html.push('<div class="zoom_arrow zoom_left" data-num='+self.now_page+'><div>');
					arrow_html.push('</div></div>');
					arrow_html.push('<div class="zoom_arrow zoom_right" data-num='+self.now_page+'><div>');
					arrow_html.push('</div></div>');
				zoom_content.append(arrow_html);
				var arrow = self.$wrap.find('.zoom_arrow');
				arrow.show();	
			}
			self.zoom.html(zoom_content);	
			$('body').css('overflow', 'hidden');
			self.zoom.show();	
		});
	}
}

