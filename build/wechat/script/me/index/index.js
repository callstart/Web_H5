!function t(e,o,n){function r(i,d){if(!o[i]){if(!e[i]){var c="function"==typeof require&&require;if(!d&&c)return c(i,!0);if(a)return a(i,!0);throw new Error("Cannot find module '"+i+"'")}var l=o[i]={exports:{}};e[i][0].call(l.exports,function(t){var o=e[i][1][t];return r(o?o:t)},l,l.exports,t,e,o,n)}return o[i].exports}for(var a="function"==typeof require&&require,i=0;i<n.length;i++)r(n[i]);return r}({1:[function(t,e,o){loginUtil.wxConfRegister(["closeWindow"]);var n=function(){var t=(TaoGu.APP.Utility,{fetchData:function(){$.ajax({url:"/user/queryUserInfo.htm",type:"POST",data:{},success:function(t){t.code?promptUtil.alert({content:t.message,type:"alert"}):this.renderData(t)}.bind(this)})},renderData:function(t){var t=t.map;$('[data-role="pName"]').text(t.pName),$('[data-role="pGendId"]').text(t.pGendId),$('[data-role="pCertNo"]').text(t.pCertNo),$('[data-role="phone"]').text(t.phone),$('[data-role="pAddr"]').text(t.pAddr).attr("href","/wechat/html/me/addr/?addr="+encodeURIComponent(t.pAddr)+"&backto="+encodeURIComponent(location.href)),$('[data-role="miCardNo"]').text(t.siCardNo||"未绑定").attr("href","/wechat/html/me/miCard/"+(t.siCardNo?"unbind":"bind")+"/?micard="+encodeURIComponent(t.siCardNo)+"&patientId="+t.patientId+"&backto="+encodeURIComponent(location.href))},bindEvt:function(){$('[data-role="logout"]').on("click",function(t){$('[data-role="mask"]').show(),$('[data-role="logoutPanel"]').show()}),$('[data-role="cancel"]').on("click",function(t){$('[data-role="mask"]').hide(),$('[data-role="logoutPanel"]').hide()}),$('[data-role="confirm"]').on("click",function(t){return!this.lock&&(this.lock=!0,void $.ajax({url:"/security/logout.htm",type:"POST",data:{},success:function(t){return t.code?(promptUtil.alert({content:t.message,type:"alert"}),!1):void(wx&&wx.closeWindow())},complete:function(){this.lock=!1}}))}.bind(this))}});return{init:function(){t.fetchData(),t.bindEvt()}}}();n.init()},{}]},{},[1]);