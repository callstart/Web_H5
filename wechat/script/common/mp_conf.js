$.ajaxSettings.timeout = 50000;

// $.ajaxSettings.error = function (xhr, type, error) {
//   alert('网络请求有误，请稍后再试');
// }

$.ajaxSettings.loginHook = function (data, status, xhr) {

  var empty = function () {};

  var userAgent = navigator.userAgent;
  if (data.code == 1000) {

    $.ajaxSettings['success'] = empty;
    $.ajaxSettings['error'] = empty;

    $(document).trigger('loginKit_login');

    // location.href = "/wechat/html/sys/login/?backto=" + encodeURIComponent(window.location.href);
    /*  // 微信才显示登陆绑定
      if (!!~userAgent.indexOf('MicroMessenger')) {
          location.href = "/wechat/html/sys/login/index.html?backto=" + window.location.href;
          //$(document).trigger('loginKit_login');
      } else {
          $('body').empty();
          // TaoGu.wechat.tool.alertFn('提示', '请通过微信公众号查看完整内容', '我知道了');
          alert('请通过微信公众号查看完整内容');
      }*/
  }
  /* else if (data.code != 0) {
          if (data.codeDescUser) {
              // TaoGu.wechat.tool.alertFn('提示', data.codeDescUser);
              alert(data.codeDescUser);
          } else {
              // TaoGu.wechat.tool.reload();
          }
      }*/
  return true;
}
