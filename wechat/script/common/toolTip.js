(function () {
    var promptUtil = {};
    var alertLock = true;
    promptUtil.toast = function (v) {
        if ($('#b_toast').length) {
            $('#b_toast').remove();
        }
        var htmlStr = '<div class="toast" id="b_toast" style="display: block;">' + v + '</div>';
        $('body').prepend(htmlStr);
        setTimeout(function () {
            var box = document.getElementById("b_toast");
            box.style.display = "none";
        }, 3000); //3秒，可以改动
    }


    /*
        传入参数：
        title：提示框头
        content：提示内容
        type:是confirm还是alert
        confirm:确定按钮
        cancel:取消按钮
        calcelFunc:取消的回调
        confirmFunc:确定的回调
     */
    promptUtil.alert = function (json) {
        var _scrollTop = 0;
        if (alertLock) {
            alertLock = false;
            if ($('#promptUtilLayer').length && $('#promptUtilMask').length) {
                $('#promptUtilLayer').remove();
                $('#promptUtilMask').remove();
            }

            var htmlStr = '';
            json.title = json.title || '提示';
            json.cancel = json.cancel || '取消';
            json.confirm = json.confirm || '我知道了';
            json.type = json.type || 'alert';

            json.stamp = +new Date();

            if (json.type == 'alert') {
                htmlStr = '<div id="promptUtilLayer" class="order_detail_p" style="display:block;"><h3>' + json.title + '</h3><div class="order_detail_cont order_detail_cont_all">' + json.content + '</div><div class="order_detail_btn tc_btn"><a href="javascript:;" class="order_cancle blue_c" data-role="promptUtilOK' + json.stamp + '">我知道了</a></div></div>'
            }
            if (json.type == 'confirm') {
                htmlStr = '<div id="promptUtilLayer" class="order_detail_p" style="display:block;"><h3>' + json.title + '</h3><div class="order_detail_cont order_detail_cont_all">' + json.content + '</div> <div class="order_detail_btn"><a href= "javascript:;" class="order_cancle" data-role="cancel' + json.stamp + '">' + json.cancel + '</a><a href="javascript:;" class="blue_c" data-role="confirm' + json.stamp + '">' + json.confirm + '</a></div></div>'
            }
            htmlStr += '<div id="promptUtilMask" class="black_overlay" style="display: block;"></div>';
            $('body').prepend(htmlStr);
            _scrollTop = document.body.scrollTop;
            $("body").addClass("overflow_h").css('position', 'fixed').css('top', _scrollTop * -1);
        }

        $('body').on('click', '[data-role="cancel' + json.stamp + '"]', function () {
            if (+new Date() - json.stamp < 500) {
                return false;
            }
            if (json.calcelFunc) {
                json.calcelFunc();
            }
            $("body").removeClass("overflow_h").removeAttr('style');
            document.body.scrollTop = _scrollTop;
            $('#promptUtilLayer').css('display', 'none');
            $('#promptUtilMask').css('display', 'none');

            alertLock = true;
        });

        $('body').on('click', '[data-role="confirm' + json.stamp + '"]', function () {
            if (+new Date() - json.stamp < 500) {
                return false;
            }
            if (json.confirmFunc) {
                json.confirmFunc();
            }
            $("body").removeClass("overflow_h").removeAttr('style');
            document.body.scrollTop = _scrollTop;
            $('#promptUtilLayer').css('display', 'none');
            $('#promptUtilMask').css('display', 'none');

            alertLock = true;
        });

        $('body').on('click', '[data-role="promptUtilOK' + json.stamp + '"]', function () {
            if (+new Date() - json.stamp < 500) {
                return false;
            }
            if (json.confirmFunc) {
                json.confirmFunc();
            }
            $("body").removeClass("overflow_h").removeAttr('style');
            document.body.scrollTop = _scrollTop;
            $('#promptUtilLayer').css('display', 'none');
            $('#promptUtilMask').css('display', 'none');

            alertLock = true;
        })
    }

    window.promptUtil = (!window.promptUtil && window.promptUtil == undefined) ? promptUtil : window.promptUtil;
})()
