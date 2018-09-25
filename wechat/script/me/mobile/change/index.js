/**
 * 更改手机号
 */

var page = (function () {
    var utility = TaoGu.APP.Utility;
    var mobile = utility.Network.queryString('mobile');
    var backto = utility.Network.queryString('backto');
    var go = utility.Network.queryString('go');
    var lastMsgVal = null;
    var lastPasswordVal = "";
    var _ = {
        $phoneNo: $('[data-role="phoneNo"]'),
        $msg: $('[data-role="msg"]'),
        $btnMsg: $('[data-role="btnMsg"]'),
        $password: $('[data-role="password"]'),
        $btn: $('[data-role="btn"]'),
        btnDisabled: true,
        validAll: function () {
            var ret = true,
                errMsg = '';

            var _phoneNo = $.trim(this.$phoneNo.val()),
                _msg = $.trim(this.$msg.val()),
                _password = $.trim(this.$password.val());

            if (ret && !taoguKit.valid.mobile(_phoneNo)) {
                ret = false;
            }

            if (ret && !taoguKit.valid.passwordFormat(_password)) {
                ret = false;
            }

            if (ret && !taoguKit.valid.msgCode(_msg)) {
                ret = false;
            }

            return ret;
        },
        validPwdVal: function () {
            var _password = $.trim(this.$password.val());
            return taoguKit.valid.passwordObj(_password);
        },
        bindEvt: function () {
            $('[data-role="msg"]').attr('disabled', true).addClass('disabled').val('');

            var timer = null;

            // 密码校验
            /*this.$password.on('input', function (e) {
                var _this = this;
                // clearTimeout(timer);
                // timer = setTimeout(function () {
                _this.validPwdFormat();
                // }, 500);
            }.bind(this))*/


            // 输入框触发校验
            this.$phoneNo
                .add(this.$msg)
                .add(this.$password)
                .on('input', function (e) {
                    var _this = this;
                    // clearTimeout(timer);

                    // timer = setTimeout(function () {
                    if (_this.validAll()) {
                        _this.$btn.removeClass('disabled').removeAttr('disabled');
                        _this.btnDisabled = false;
                    } else {
                        _this.$btn.addClass('disabled').attr('disabled', true);
                        _this.btnDisabled = true;
                    }
                    // }, 800);
                }.bind(this));

            // 获取验证码
            this.$btnMsg.on('tap', function (e) {
                if (this.lock) {
                    return false;
                }

                if (!taoguKit.valid.mobile($.trim(this.$phoneNo.val()))) {
                    promptUtil.toast('输入手机格式有误，请输入正确手机号');
                    return false;
                }

                this.lock = true;

                $.ajax({
                    url: '/security/smscoderequest.htm',
                    data: {
                        phoneNo: this.$phoneNo.val(),
                        type: 3 // 更换手机号
                    },
                    type: 'POST',
                    success: function (json) {
                        if (json.code) {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                            return false;
                        }

                        $('[data-role="msg"]').removeAttr('disabled').removeClass('disabled');

                        $(e.target).attr('disabled', true).css("color", "#484747");

                        var timeCount = 59;
                        var originText = $(e.target).val();

                        var timer = setInterval(function () {
                            if (timeCount >= 1) {
                                $(e.target).val('重新获取 ' + timeCount-- + 's');
                            } else {
                                clearInterval(timer);
                                $(e.target).val(originText).removeAttr("style").removeAttr('disabled');
                            }
                        }.bind(this), 1000)
                    }.bind(this),
                    complete: function () {
                        this.lock = false;
                    }.bind(this)
                });
            }.bind(this));

            // 提交
            this.$btn.on('click', function (e) {

                if (this.btnDisabled) {
                    return false;
                }

                if (this.lock) {
                    return false;
                }

                /*if (!taoguKit.valid.mobile($.trim(_.$phoneNo.val()))) {
                    alert('输入手机格式有误，请输入正确手机号');
                    return false;
                }*/

                /*if (!taoguKit.valid.msgCode($.trim(_.$msg.val()))) {
                    alert('验证码输入有误');
                    return false;
                }*/

                var checkPwd = this.validPwdVal();

                if (!checkPwd.ret) {
                    //alert(checkPwd.message);
                    promptUtil.alert({
                        'content': checkPwd.message,
                        'type': 'alert'
                    });
                    return false;
                }

                var checkcode = taoguKit.valid.getMsgCode($.trim(_.$phoneNo.val()), $.trim(_.$msg.val()));

                if (!checkcode.ret) {
                    promptUtil.toast(checkcode.message);
                    return false;
                }

                this.lock = true;

                $.ajax({
                    url: '/user/updatePhoneNo.htm',
                    type: 'POST',
                    data: {
                        phoneNo: _.$phoneNo.val(),
                        password: window.MD5(this.$password.val())
                    },
                    success: function (json) {
                        if (!json.code) {

                            promptUtil.toast('更换手机号成功!');

                            if (backto) {
                                location.href = backto;
                            } else if (go) {
                                $(document).trigger('loginKit_login');
                                // location.href = "/wechat/html/sys/login/?backto=" + encodeURIComponent(go);
                            } else {
                                history.go(-1);
                            }
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }
                    },
                    complete: function () {
                        this.lock = false;
                    }.bind(this)
                })

            }.bind(this));
        }
    }

    return {
        init: function () {
            $('[data-role="mobile"]').html($('[data-role="mobile"]').html().replace(/#mobile#/, mobile));
            _.bindEvt();
        }
    }
})();

page.init();
