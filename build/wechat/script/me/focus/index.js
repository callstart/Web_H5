!function t(a,e,n){function r(i,s){if(!e[i]){if(!a[i]){var c="function"==typeof require&&require;if(!s&&c)return c(i,!0);if(o)return o(i,!0);throw new Error("Cannot find module '"+i+"'")}var u=e[i]={exports:{}};a[i][0].call(u.exports,function(t){var e=a[i][1][t];return r(e?e:t)},u,u.exports,t,a,e,n)}return e[i].exports}for(var o="function"==typeof require&&require,i=0;i<n.length;i++)r(n[i]);return r}({1:[function(t,a,e){var n=function(){var t=30,a=1,e={fetchData:function(a,e){$.ajax({url:"/user/queryMyFavoriteDoctorList.htm",type:"POST",data:{count:t,start:0},success:function(t){e(t.code?[]:t.attdrlist)}})},buildDataFunc:function(t,e){if(!(e!=a||t&&t.length))return $('[data-role="focus"]').addClass("result_bg"),['<div class="my_con_noresult">','<img src="/wechat/images/blank.png">',"</div>",'<p class="cen_text">您还没有关注过任何医生</p>'].join("");var n=[];return $.each(t,function(t,a){n.push(['<div class="my_con" data-role="item" data-href="doctorId='+a.drId+"&deptId="+a.deptId+"&deptName="+encodeURIComponent(a.deptName||"")+'">','<div class="my_con_pic"><img src="/common/image/'+a.imageId+'.htm" width="138" height="137"/></div>','<div class="my_con_text">','<p class="t_name">'+a.drName+'<span class="t_name_o">'+a.drLvlName+"</span></p>",'<p class="amount">预约量:'+a.regtAmt+" | 关注量:"+a.focusAmt+"</p>",'<p class="hos_cp">',function(){var t=[];return a.deptName&&t.push('<span class="kes_n">'+a.deptName+"</span>"),a.hospName&&t.push('<span class="s_point">'+a.hospName+"</span>"),t.join(" | ")}(),"</p>","</div>","</div>"].join(""))}),n.join("")},buildList:function(){taoguKit.scrollLoad({wrapper:$('[data-role="focus"]'),fetchDataFunc:this.fetchData,buildDataFunc:this.buildDataFunc,pageSize:t,currPage:a})},bindEvt:function(){$('[data-role="focus"]').on("tap",'[data-role="item"]',function(t){var a=$(t.target).closest($('[data-role="item"]'));a.length&&(location.href="/wechat/html/doctor/home/?"+a.data("href"))})}};return{init:function(){e.buildList(),e.bindEvt()}}}();n.init()},{}]},{},[1]);