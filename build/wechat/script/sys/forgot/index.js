!function t(e,a,i){function o(s,n){if(!a[s]){if(!e[s]){var l="function"==typeof require&&require;if(!n&&l)return l(s,!0);if(r)return r(s,!0);throw new Error("Cannot find module '"+s+"'")}var d=a[s]={exports:{}};e[s][0].call(d.exports,function(t){var a=e[s][1][t];return o(a?a:t)},d,d.exports,t,e,a,i)}return a[s].exports}for(var r="function"==typeof require&&require,s=0;s<i.length;s++)o(i[s]);return o}({1:[function(t,e,a){var i=function(){var t=TaoGu.APP.Utility,e=(t.Network.queryString("backto"),t.Network.queryString("go"),{$cardNo:$('[data-role="cardNo"]'),$phoneNo:$('[data-role="phoneNo"]'),$msg:$('[data-role="msg"]'),$btnMsg:$('[data-role="btnMsg"]'),$password:$('[data-role="password"]'),$btn:$('[data-role="btn"]'),$mockGender:$('[data-role="mockGender"]'),btnDisabled:!0,lock:!1,validAll:function(){var t="",e=$.trim(this.$cardNo.val()),a=$.trim(this.$phoneNo.val()),i=$.trim(this.$msg.val()),o=$.trim(this.$password.val());if(taoguKit.valid.mobile(a)||(t="手机号格式输入有误"),t||taoguKit.valid.msgCode(i)||(t="验证码格式输入有误"),t||/^\d{6}|\d{5}X$/.test(e.toUpperCase())||(t="身份证号格式输入有误"),t||/^[a-z0-9A-Z]{6,15}$/.test(o)||(t="密码格式输入有误"),t.length)return promptUtil.toast(t),this.btnDisabled=!0,!1},RegSubmit:function(){return!this.lock&&(this.lock=!0,void $.ajax({url:"/security/resetPass.htm",type:"POST",data:{cardNo:this.$cardNo.val(),phoneNo:this.$phoneNo.val(),password:window.MD5(this.$password.val()),msg:this.$msg.val()},success:function(t){t.code?promptUtil.alert({content:t.message,type:"alert"}):promptUtil.alert({content:"重置成功，请点击返回跳转至前一页"})},complete:function(){this.lock=!1}.bind(this)}))},bindEvt:function(){$('[data-role="msg"]').attr("disabled",!0).addClass("disabled").val("");this.$cardNo.add(this.$phoneNo).add(this.$msg).add(this.$password).on("input",function(t){e.$cardNo.val()&&e.$phoneNo.val()&&e.$msg.val()&&e.$btnMsg.val()&&e.$password.val()?(e.$btn.removeClass("disabled").removeAttr("disabled"),e.btnDisabled=!1):(e.$btn.addClass("disabled").attr("disabled",!0),e.btnDisabled=!0)}.bind(this)),this.$btnMsg.on("click",function(t){return!this.lock&&(taoguKit.valid.mobile($.trim(this.$phoneNo.val()))?(this.lock=!0,void $.ajax({url:"/security/smscoderequest.htm",data:{phoneNo:this.$phoneNo.val(),type:2},type:"POST",success:function(e){if(e.code)return promptUtil.alert({content:e.message,type:"alert"}),!1;$('[data-role="msg"]').removeAttr("disabled").removeClass("disabled"),$(t.target).attr("disabled",!0).css("color","#484747");var a=59,i=$(t.target).val(),o=setInterval(function(){a>=1?$(t.target).val("重新获取 "+a--+"s"):(clearInterval(o),$(t.target).val(i).removeAttr("style").removeAttr("disabled"))}.bind(this),1e3)}.bind(this),complete:function(){this.lock=!1}.bind(this)})):(promptUtil.toast("输入手机格式有误，请输入正确手机号"),!1))}.bind(this)),this.$btn.on("click",function(t){if(e.validAll(),this.lock||this.btnDisabled)return!1;var a=taoguKit.valid.getMsgCode($.trim(e.$phoneNo.val()),$.trim(e.$msg.val()));return a.ret?void e.RegSubmit():(promptUtil.alert({content:a.message,type:"alert"}),!1)}.bind(this))}});return{init:function(){e.bindEvt()}}}();i.init()},{}]},{},[1]);