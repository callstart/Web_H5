!function t(e,i,n){function o(a,s){if(!i[a]){if(!e[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(r)return r(a,!0);throw new Error("Cannot find module '"+a+"'")}var l=i[a]={exports:{}};e[a][0].call(l.exports,function(t){var i=e[a][1][t];return o(i?i:t)},l,l.exports,t,e,i,n)}return i[a].exports}for(var r="function"==typeof require&&require,a=0;a<n.length;a++)o(n[a]);return o}({1:[function(t,e,i){var n={init:function(){$(document).bind("loginKit_login",function(t,e){e=e||{},this.compose(e)}.bind(this))},compose:function(t){var e=t.tel||null,i=t.hasClose||!1;return this.loaded?(this.$err.empty(),this.$fade.css("display","block"),this.$top.css("display","block"),this.$tel.val(e||""),this.$pw.val(""),!1):($("body").append(this.htmlBuilder(i)),setTimeout(function(){this.bindEvt(t)}.bind(this),300),void(this.loaded=!0))},htmlBuilder:function(t){var e=($("body").get(0),['<div id="loginKitPop" class="login_popup" style="display:block;">',"<h1>登录",t?'<i><img src="/wechat/images/close.png" class="close_icon" data-login="close"></i>':"","</h1>",'<ul class="inp_list_n">',"<li>",'<input type="text" data-login="tel" placeholder="请输入注册时的手机号" value="" />',"</li>","<li>",'<input type="password" data-login="pw" placeholder="请输入注册时设置的密码" value="" />',"</li>","</ul>",'<div class="forget_password_n"><a data-login="forgot" href="/wechat/html/sys/forgot/">忘记密码？</a></div>','<div data-login="err" style="text-align:center;color:#f00;height:1em;"></div>','<section class="but_div2_n">','<input type="button" value="登录" data-login="btn" class="disabled" disabled />',"</section>",'<div class="go_register_n">还没有账户，<a href="/wechat/html/sys/reg/" data-login="reg">立即注册</a></div>',"</div>",'<div data-login="patients" class="pop_patients" style="z-index:3000;display:none;">',"<h2>选择就诊人</h2>",'<ul data-login="patientlist"></ul>',"</div>",'<div id="loginKitFade" class="black_overlay" style="display:block;"></div>']);return e.join("")},bindEvt:function(t){var e=t.tel||null;t.hasClose||!1;this.$top=$("#loginKitPop"),this.$fade=$("#loginKitFade"),this.$patients=$('[data-login="patients"]'),this.$tel=$('[data-login="tel"]',this.$top),this.$pw=$('[data-login="pw"]',this.$top),this.$forgot=$('[data-login="forgot"]',this.$top),this.$btn=$('[data-login="btn"]',this.$top),this.$reg=$('[data-login="reg"]',this.$top),this.$close=$('[data-login="close"]',this.$top),this.$err=$('[data-login="err"]',this.$top).empty(),this.$tel.val(e||""),this.$pw.val(""),this.$forgot.attr("href",this.$forgot.attr("href")+"?backto="+encodeURIComponent(location.href)),this.$reg.attr("href",this.$reg.attr("href")+"?backto="+encodeURIComponent(location.href)),this.$fade.on("touchmove",function(t){return t.preventDefault(),t.stopPropagation(),!1}),this.$btn.on("tap",function(t){this.$err.empty();var e="",i=$.trim(this.$tel.val()),n=$.trim(this.$pw.val());return e||taoguKit.valid.mobile(i)||(e="请输入正确的手机号码"),e||taoguKit.valid.passwordFormat(n)||(e="请输入正确的密码"),e?(this.$err.text(e),!1):void this.subForm({phoneNo:i,password:window.MD5(n)})}.bind(this)),this.$patients.on("click",'[data-login="pNameList"]',function(t){var e=$(t.target).data("id");$(t.target).data("name");return!!e&&void $.ajax({url:"/security/savePatientId.htm",type:"POST",data:{patientId:e},success:function(t){},complete:function(){location.reload(!0)}})}),this.$close.on("click",function(t){setTimeout(function(){this.$top.css("display","none"),this.$fade.css("display","none")}.bind(this),500)}.bind(this)),this.$tel.add(this.$pw).on("input",function(t){this.$err.empty();var e=$.trim(this.$tel.val()),i=$.trim(this.$pw.val());e.length&&i.length?this.$btn.removeClass("disabled").removeAttr("disabled"):this.$btn.addClass("disabled").attr("disabled",!0)}.bind(this))},subForm:function(t){return!this.lockSubmit&&(this.lockSubmit=!0,void $.ajax({url:"/security/login.htm",type:"POST",data:t,forbidLoginHook:!0,success:function(t){t.code?this.$err.text(t.message):(this.$top.css("display","none"),setTimeout(function(){this.fetchPatientList()}.bind(this),500))}.bind(this),complete:function(){this.lockSubmit=!1}.bind(this)}))},renderPatientList:function(t){var e="";$.each(t,function(t,i){e+="<li data-login='pNameList' data-id='"+i.tmPId+"' data-name="+i.pName+">"+i.pName+"</li>"}),$('[data-login="patientlist"]').html(e)},fetchPatientList:function(){$.ajax({url:"/familyMember/queryMyMembers.htm",type:"POST",success:function(t){t.code?(this.$fade.css("display","none"),promptUtil.alert({content:t.message,type:"alert"})):(this.$fade.css("display","block"),this.$patients.css("display","block"),this.renderPatientList(t.familflist))}.bind(this)})}};n.init()},{}],2:[function(t,e,i){window.MD5=function(){function t(t){return d(e(l(t),t.length*h))}function e(t,e){t[e>>5]|=128<<e%32,t[(e+64>>>9<<4)+14]=e;for(var i=1732584193,c=-271733879,l=-1732584194,d=271733878,u=0;u<t.length;u+=16){var h=i,p=c,f=l,g=d;i=n(i,c,l,d,t[u+0],7,-680876936),d=n(d,i,c,l,t[u+1],12,-389564586),l=n(l,d,i,c,t[u+2],17,606105819),c=n(c,l,d,i,t[u+3],22,-1044525330),i=n(i,c,l,d,t[u+4],7,-176418897),d=n(d,i,c,l,t[u+5],12,1200080426),l=n(l,d,i,c,t[u+6],17,-1473231341),c=n(c,l,d,i,t[u+7],22,-45705983),i=n(i,c,l,d,t[u+8],7,1770035416),d=n(d,i,c,l,t[u+9],12,-1958414417),l=n(l,d,i,c,t[u+10],17,-42063),c=n(c,l,d,i,t[u+11],22,-1990404162),i=n(i,c,l,d,t[u+12],7,1804603682),d=n(d,i,c,l,t[u+13],12,-40341101),l=n(l,d,i,c,t[u+14],17,-1502002290),c=n(c,l,d,i,t[u+15],22,1236535329),i=o(i,c,l,d,t[u+1],5,-165796510),d=o(d,i,c,l,t[u+6],9,-1069501632),l=o(l,d,i,c,t[u+11],14,643717713),c=o(c,l,d,i,t[u+0],20,-373897302),i=o(i,c,l,d,t[u+5],5,-701558691),d=o(d,i,c,l,t[u+10],9,38016083),l=o(l,d,i,c,t[u+15],14,-660478335),c=o(c,l,d,i,t[u+4],20,-405537848),i=o(i,c,l,d,t[u+9],5,568446438),d=o(d,i,c,l,t[u+14],9,-1019803690),l=o(l,d,i,c,t[u+3],14,-187363961),c=o(c,l,d,i,t[u+8],20,1163531501),i=o(i,c,l,d,t[u+13],5,-1444681467),d=o(d,i,c,l,t[u+2],9,-51403784),l=o(l,d,i,c,t[u+7],14,1735328473),c=o(c,l,d,i,t[u+12],20,-1926607734),i=r(i,c,l,d,t[u+5],4,-378558),d=r(d,i,c,l,t[u+8],11,-2022574463),l=r(l,d,i,c,t[u+11],16,1839030562),c=r(c,l,d,i,t[u+14],23,-35309556),i=r(i,c,l,d,t[u+1],4,-1530992060),d=r(d,i,c,l,t[u+4],11,1272893353),l=r(l,d,i,c,t[u+7],16,-155497632),c=r(c,l,d,i,t[u+10],23,-1094730640),i=r(i,c,l,d,t[u+13],4,681279174),d=r(d,i,c,l,t[u+0],11,-358537222),l=r(l,d,i,c,t[u+3],16,-722521979),c=r(c,l,d,i,t[u+6],23,76029189),i=r(i,c,l,d,t[u+9],4,-640364487),d=r(d,i,c,l,t[u+12],11,-421815835),l=r(l,d,i,c,t[u+15],16,530742520),c=r(c,l,d,i,t[u+2],23,-995338651),i=a(i,c,l,d,t[u+0],6,-198630844),d=a(d,i,c,l,t[u+7],10,1126891415),l=a(l,d,i,c,t[u+14],15,-1416354905),c=a(c,l,d,i,t[u+5],21,-57434055),i=a(i,c,l,d,t[u+12],6,1700485571),d=a(d,i,c,l,t[u+3],10,-1894986606),l=a(l,d,i,c,t[u+10],15,-1051523),c=a(c,l,d,i,t[u+1],21,-2054922799),i=a(i,c,l,d,t[u+8],6,1873313359),d=a(d,i,c,l,t[u+15],10,-30611744),l=a(l,d,i,c,t[u+6],15,-1560198380),c=a(c,l,d,i,t[u+13],21,1309151649),i=a(i,c,l,d,t[u+4],6,-145523070),d=a(d,i,c,l,t[u+11],10,-1120210379),l=a(l,d,i,c,t[u+2],15,718787259),c=a(c,l,d,i,t[u+9],21,-343485551),i=s(i,h),c=s(c,p),l=s(l,f),d=s(d,g)}return Array(i,c,l,d)}function i(t,e,i,n,o,r){return s(c(s(s(e,t),s(n,r)),o),i)}function n(t,e,n,o,r,a,s){return i(e&n|~e&o,t,e,r,a,s)}function o(t,e,n,o,r,a,s){return i(e&o|n&~o,t,e,r,a,s)}function r(t,e,n,o,r,a,s){return i(e^n^o,t,e,r,a,s)}function a(t,e,n,o,r,a,s){return i(n^(e|~o),t,e,r,a,s)}function s(t,e){var i=(65535&t)+(65535&e),n=(t>>16)+(e>>16)+(i>>16);return n<<16|65535&i}function c(t,e){return t<<e|t>>>32-e}function l(t){for(var e=Array(),i=(1<<h)-1,n=0;n<t.length*h;n+=h)e[n>>5]|=(t.charCodeAt(n/h)&i)<<n%32;return e}function d(t){for(var e=u?"0123456789ABCDEF":"0123456789abcdef",i="",n=0;n<4*t.length;n++)i+=e.charAt(t[n>>2]>>n%4*8+4&15)+e.charAt(t[n>>2]>>n%4*8&15);return i}var u=0,h=8;return t}(),window.randomStr=function(){for(var t=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],e=t.length,i="",n=0;n<e;n++)i+=t[Math.round(Math.random()*(e-1))];return i}()},{}],3:[function(t,e,i){$.ajaxSettings.timeout=5e4,$.ajaxSettings.loginHook=function(t,e,i){var n=function(){};navigator.userAgent;return 1e3==t.code&&($.ajaxSettings.success=n,$.ajaxSettings.error=n,$(document).trigger("loginKit_login")),!0}},{}],4:[function(t,e,i){!function(t){function e(){}function i(){var t=new e;return t.constructor=e,t.init.apply(t,arguments)}e.prototype={init:function(t){if(!(t&&t.wrapper&&t.fetchDataFunc&&t.buildDataFunc))throw new Error("Not enough params!");this.fetchDataFunc=t.fetchDataFunc,this.buildDataFunc=t.buildDataFunc,this.scroller=t.scroller||document,this.wrapper=t.wrapper,this.pageSize=t.pageSize||20,this.currPage=t.currPage||0,this.scrollerParent=this.scroller===document?document.body:$(this.scroller).get(0),this.scrollAreaHeight=this.scroller===document?document.documentElement.clientHeight:this.scroller.get(0).clientHeight,this.lock=!1,this.end=!1,this.evtBind(),this.scrollLoader()},evtBind:function(){$(this.scroller).off("scroll").on("scroll",this.scrollLoader.bind(this))},scrollLoader:function(){if(this.end)return!1;if(this.scrollAreaHeight=this.scroller===document?document.documentElement.clientHeight:this.scroller.get(0).clientHeight,this.scrollerParent.scrollHeight-this.scrollerParent.scrollTop-this.scrollAreaHeight<this.scrollAreaHeight/2){if(this.lock)return!1;this.lock=!0,this.asyncLoad()}},asyncLoad:function(){this.fetchDataFunc(this.currPage,function(t){return t=t||[],this.appendList(t,this.currPage),this.lock=!1,t.length<this.pageSize?(this.end=!0,!1):void this.currPage++}.bind(this))},appendList:function(t,e){$(this.wrapper).append(this.buildDataFunc(t,e))}},"object"!=typeof window.taoguKit&&(window.taoguKit={}),window.taoguKit.scrollLoad=i}(window)},{}],5:[function(t,e,i){!function(){var t={},e=!0;t.toast=function(t){$("#b_toast").length&&$("#b_toast").remove();var e='<div class="toast" id="b_toast" style="display: block;">'+t+"</div>";$("body").prepend(e),setTimeout(function(){var t=document.getElementById("b_toast");t.style.display="none"},3e3)},t.alert=function(t){var i=0;if(e){e=!1,$("#promptUtilLayer").length&&$("#promptUtilMask").length&&($("#promptUtilLayer").remove(),$("#promptUtilMask").remove());var n="";t.title=t.title||"提示",t.cancel=t.cancel||"取消",t.confirm=t.confirm||"我知道了",t.type=t.type||"alert",t.stamp=+new Date,"alert"==t.type&&(n='<div id="promptUtilLayer" class="order_detail_p" style="display:block;"><h3>'+t.title+'</h3><div class="order_detail_cont order_detail_cont_all">'+t.content+'</div><div class="order_detail_btn tc_btn"><a href="javascript:;" class="order_cancle blue_c" data-role="promptUtilOK'+t.stamp+'">我知道了</a></div></div>'),"confirm"==t.type&&(n='<div id="promptUtilLayer" class="order_detail_p" style="display:block;"><h3>'+t.title+'</h3><div class="order_detail_cont order_detail_cont_all">'+t.content+'</div> <div class="order_detail_btn"><a href= "javascript:;" class="order_cancle" data-role="cancel'+t.stamp+'">'+t.cancel+'</a><a href="javascript:;" class="blue_c" data-role="confirm'+t.stamp+'">'+t.confirm+"</a></div></div>"),n+='<div id="promptUtilMask" class="black_overlay" style="display: block;"></div>',$("body").prepend(n),i=document.body.scrollTop,$("body").addClass("overflow_h").css("position","fixed").css("top",i*-1)}$("body").on("click",'[data-role="cancel'+t.stamp+'"]',function(){return!(+new Date-t.stamp<500)&&(t.calcelFunc&&t.calcelFunc(),$("body").removeClass("overflow_h").removeAttr("style"),document.body.scrollTop=i,$("#promptUtilLayer").css("display","none"),$("#promptUtilMask").css("display","none"),void(e=!0))}),$("body").on("click",'[data-role="confirm'+t.stamp+'"]',function(){return!(+new Date-t.stamp<500)&&(t.confirmFunc&&t.confirmFunc(),$("body").removeClass("overflow_h").removeAttr("style"),document.body.scrollTop=i,$("#promptUtilLayer").css("display","none"),$("#promptUtilMask").css("display","none"),void(e=!0))}),$("body").on("click",'[data-role="promptUtilOK'+t.stamp+'"]',function(){return!(+new Date-t.stamp<500)&&(t.confirmFunc&&t.confirmFunc(),$("body").removeClass("overflow_h").removeAttr("style"),document.body.scrollTop=i,$("#promptUtilLayer").css("display","none"),$("#promptUtilMask").css("display","none"),void(e=!0))})},window.promptUtil=window.promptUtil||void 0!=window.promptUtil?window.promptUtil:t}()},{}],6:[function(t,e,i){t("./utility.js"),t("./md5.js"),t("./scrollLoad.js"),t("./toolTip.js"),t("./mp_conf.js"),t("./wechatToken.js"),t("./validRules.js"),t("./loginKit.js")},{"./loginKit.js":1,"./md5.js":2,"./mp_conf.js":3,"./scrollLoad.js":4,"./toolTip.js":5,"./utility.js":7,"./validRules.js":8,"./wechatToken.js":9}],7:[function(t,e,i){!function(t,e){var i=typeof e;t.Namespace={register:function(e,n){if(!e||!e.length)return null;typeof n==i&&(n={});for(var o,r=t,a=e.split("."),s="window"==a[0]?1:0,c=a.length,l=c-1;s<a.length;++s)o=a[s],r=r[o]=r[o]||(s==l?n:{});return"undefined"!=typeof n&&(r=n),r}},Namespace.register("TaoGu.APP.Utility",{OOP:{create:function(e,i,n){return i.prototype=n,i.prototype.constructor=i,e?t[e]=i:i}},Language:{isArray:function(t){return"[object Array]"==Object.prototype.toString.call(t)},isString:function(t){return"[object String]"==Object.prototype.toString.call(t)},bind:function(t,e){var i=arguments.length>2?[].slice.call(arguments,2):null;return function(){var n=TaoGu.APP.Utility.Language.isString(t)?e[t]:t,o=i?i.concat([].slice.call(arguments,0)):arguments;return n.apply(e||n,o)}}},Bridge:{device:function(){/(iPhone|iPad|Android)/gi.test(navigator.userAgent);switch(RegExp.$1.toString().toLowerCase()){case"iphone":case"ipad":return"IOS";case"android":return"Android";default:return"PC"}}()},String:{stringFormat:function(){if(0==arguments.length)return null;for(var t=arguments[0],e=1,i=arguments.length;e<i;e++){var n=new RegExp("\\{"+(e-1)+"\\}","gm");t=t.replace(n,arguments[e])}return t},trim:function(t){return t.replace(/^\s+|\s+$/gi,"")},getByteLength:function(t){return String(t).replace(/[^\x00-\xff]/g,"ci").length},subByte:function(t,e,i){return t=String(t),i=i||"",e<0||this.getByteLength(t)<=e?t:(t=t.substr(0,e).replace(/([^\x00-\xff])/g,"$1 ").substr(0,e).replace(/[^\x00-\xff]$/,"").replace(/([^\x00-\xff]) /g,"$1"),t+i)},xssProtect:function(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\'/g,"&apos;").replace(/\"/g,"&quot;")}},DateTime:{showtime:function(t){var e=t.getMonth()+1;return t.getFullYear()+"-"+(e<10?"0"+e:e)+"-"+(t.getDate()<10?"0"+t.getDate():t.getDate())}},Network:{searchStr:location.href.split("#")[0],queryString:function(t){this.searchStr=this.searchStr?this.searchStr:location.href.split("#")[0];var e=this.searchStr.match(new RegExp("[?&]"+t+"=([^&]+)","i"));return null==e||e.length<1?"":decodeURIComponent(e[1])},relocate:function(t){return!!t&&void setTimeout(function(){location.href=t},300)}},Image:{preload:function(t,e){var i=new Image;i.setAttribute("src",t);var n=function(){var n={src:t,width:i.width,height:i.height};e&&e(n)};i.onerror=function(){},i.getAttribute("complete")?n():$(i).one("load",n)},resize:function(t,e){var i={width:t.width,height:t.height};return t.width>e.width&&(i={width:e.width,height:Math.ceil(e.width/t.width*t.height)}),i}},Storage:{hname:location.hostname?location.hostname:"localStatus",isLocalStorage:!!window.localStorage,dataDom:null,initDom:function(){if(!this.dataDom)try{this.dataDom=document.createElement_x("input"),this.dataDom.type="hidden",this.dataDom.style.display="none",this.dataDom.addBehavior("#default#userData"),document.body.appendChild(this.dataDom);var t=new Date;t=t.getDate()+30,this.dataDom.expires=t.toUTCString()}catch(e){return!1}return!0},set:function(t,e){this.isLocalStorage?window.localStorage.setItem(t,e):this.initDom()&&(this.dataDom.load(this.hname),this.dataDom.setAttribute(t,e),this.dataDom.save(this.hname))},get:function(t){return this.isLocalStorage?window.localStorage.getItem(t):this.initDom()?(this.dataDom.load(this.hname),this.dataDom.getAttribute(t)):void 0},remove:function(t){this.isLocalStorage?localStorage.removeItem(t):this.initDom()&&(this.dataDom.load(this.hname),this.dataDom.removeAttribute(t),this.dataDom.save(this.hname))}}})}(window,void 0)},{}],8:[function(t,e,i){function n(t){return t=t.toUpperCase(),!!/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(t)}function o(t){return/^[\u4E00-\u9FA5]{1,20}$/.test(t)}function r(t){return/^.{1,25}$/.test(t)}function a(t){return/^1\d{10}$/.test(t)}function s(t){return/^\d{6}$/.test(t)}function c(t,e){var i=!1,n="";return a(t)?s(e)?($.ajax({url:"/security/checksmscode.htm",type:"POST",async:!1,data:{phoneNo:t,verifyCode:e},success:function(t){t.code?(i=!1,n=t.message):i=!0}}),{ret:i,message:n}):{ret:!1,message:"请输入正确的验证码"}:{ret:!1,message:"请输入正确的手机号码"}}function l(t){var e=!1;return h(t)&&$.ajax({url:"/security/verifypassword.htm",type:"POST",async:!1,data:{password:window.MD5(t)},success:function(t){e=!t.code}}),e}function d(t){var e=!1,i="";return h(t)&&$.ajax({url:"/security/verifypassword.htm",type:"POST",async:!1,data:{password:window.MD5(t)},success:function(t){t.code?(e=!1,i=t.message):e=!0}}),{ret:e,message:i}}function u(t){return/^\d{10,25}$/.test(t)}function h(t){return/^(?=.*[a-zA-Z]+)(?=.*[0-9]+)[0-9a-zA-Z]{6,15}$/.test(t)}"object"!=typeof window.taoguKit&&(window.taoguKit={}),window.taoguKit.valid={idCard:n,userName:o,addr:r,mobile:a,miCard:u,msgCode:s,password:l,passwordObj:d,getMsgCode:c,passwordFormat:h}},{}],9:[function(t,e,i){!function(){var t=TaoGu.APP.Utility,e=t.Network,i=t.Storage,n=e.queryString("code")||"",o={};o.setUserId=function(t){i.set("wechat-userid",t)},o.getUserId=function(){return i.get("wechat-userid")||""},o.setWxOpenId=function(t){i.set("wechat-openid",t)},o.getWxOpenId=function(){return i.get("wechat-openid")||""},o.checkCode=function(t,e){var i=this;n.length&&!window.forbidAutoGetOpenId?$.ajax({url:"/common/findOpenId.htm",type:"POST",data:{code:n},forbidLoginHook:!0,success:function(t){t&&"string"==typeof t&&i.setWxOpenId(t)},complete:function(){t()}}):t()},o.wxConfRegister=function(t){var e=new Promise(function(t,e){$.ajax({url:"/common/getJsSign.htm",type:"POST",data:{url:location.href.split("#")[0]},success:function(e){e.code||t(e)},error:function(){e(null)}})});e.then(function(e){wx&&wx.config({debug:!1,appId:e.appId,timestamp:e.timestamp,nonceStr:e.noncestr,signature:e.signature,jsApiList:t})},function(t){promptUtil.alert({content:t||"获取微信JS注册信息失败！",type:"alert"})})},o.bizStartPage=function(t){o.hasStarted?t():$(document).on("bizStartPage",t)};var r=new Promise(function(t,e){o.checkCode(t,e)});r.then(function(){$(document).trigger("bizStartPage"),o.hasStarted=!0}),window.loginUtil=window.loginUtil||void 0!=window.loginUtil?window.loginUtil:o}()},{}]},{},[6]);