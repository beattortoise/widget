;(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd)) {
        // AMD或CMD
        define([ "jquery" ], function(){
            factory(jQuery);
        });
    } else {
        // 全局模式
        factory(jQuery);
    }
}(function ($) {
	$.fn.countdown = function (parameter,getApi) {
		if(typeof parameter == 'function'){ //重载
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
		return this.each(function (i) {
			var $this = $(this);
			var defaults = { 				 
			    'end': '',       //结束时间戳
			    'show': ['hour', 'min', 'sec'],    //显示形式12时12分12秒
			    'interval': 1000,                  //间隔时间
			    'systemTime': '', 				   //当前时间
			    'callback': function(){}           //回调
			};
			var options = $.extend({}, defaults, parameter);
			var _api = {}; 
			var end = options.end * 1000;   //总毫秒数 

			if(options.systemTime == '') {   //获取当前
				options.systemTime = Date.parse(new Date()) /1000;
			}

        	var systemTime = options.systemTime* 1000 + options.interval;  //因为setInterval, 先走一秒再执行函数。
        	var createDom = function(leftD,leftH,leftM,leftS,leftMS) { 
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
		        for(var showLen =  options.show.length, i=0;  i<showLen; i++ ) {
		            var val = options.show[i];
		            _html.push('<li class="time_'+ val  +'">');
		            var str = '';
		            for(var numLen = timeBox[val][1].length, j=0; j<numLen; j++) {
		                str += '<span>'+timeBox[val][1].charAt(j)+'</span>';
		            }
		            _html.push(str+'<em>' + timeBox[val][0] +'</em></li>');
		        }
		        _html.push('</ul');

		        $this.html(_html.join(''));
        	}

			var exu = function(left) {     //倒计函数
				var _left = Math.floor(left/(1000/options.interval));

	            var distance = makeZero(Math.floor(_left/3600)); //获取小时

	            var leftD = makeZero(Math.floor(distance/24));
	            var leftH = makeZero(Math.floor(distance-leftD*24));  //重新-day计算H
	            var leftM = makeZero(Math.floor((_left - distance * 3600)/60));
	            var leftS = makeZero(Math.floor(_left - distance * 3600 - leftM * 60));
	            var leftMS = left.toString();
	            leftMS = leftMS.charAt(leftMS.length - 1);
				console.log(end+':'+systemTime+':'+(Date.parse(new Date()))+ ':'+leftS+':'+options.interval);


	            switch(options.show[0]) {
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
	            createDom(leftD,leftH,leftM,leftS,leftMS);   //创建Dom

			}

	        // 定时器改成按需要的interval跑一次，自动增加systemTime
	        var init = setInterval(function(){
	            var interval = options.interval;
	            var left = Math.floor((end - systemTime)/interval);  // 跳一次的频率
				if(end == systemTime) {
					console.log(Date.parse(new Date()) /1000);
				}

	            if(end < systemTime) {
	                clearInterval(init);
	                options.callback && options.callback();
	            } else {
	                exu(left);
	            }
	            systemTime = systemTime + interval;
	        }, options.interval);

	        getApi(_api);
		});
 
    	function makeZero(num) {              // 时间01分
    	   	var str = num.toString();
        	if(str.length < 2) {
            	str = '0' + str;
       		}
        	return str;
    	}
	}
}));
