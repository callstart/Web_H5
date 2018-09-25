/**
 * 忘记密码
 */

var page = (function () {
    var utility = TaoGu.APP.Utility;
    var backto = utility.Network.queryString('backto');
    var go = utility.Network.queryString('go');
    var LastMsgVal = "";
    var _ = {
        $cardNo: $('[data-role="cardNo"]'),
        $phoneNo: $('[data-role="phoneNo"]'),
        $msg: $('[data-role="msg"]'),
        $btnMsg: $('[data-role="btnMsg"]'),
        $password: $('[data-role="password"]'),
        $btn: $('[data-role="btn"]'),
        $mockGender: $('[data-role="mockGender"]'),
        btnDisabled: true,
        lock: false,
        validAll: function () {
            var ret = '',
                errMsg = '';

            var _cardNo = $.trim(this.$cardNo.val()),
                _phoneNo = $.trim(this.$phoneNo.val()),
                _msg = $.trim(this.$msg.val()),
                _password = $.trim(this.$password.val());

            if (!taoguKit.valid.mobile(_phoneNo)) {
                ret = "手机号格式输入有误";
            }
            if (!ret && !taoguKit.valid.msgCode(_msg)) {
                ret = "验证码格式输入有误";
            }
            if (!ret && !/^\d{6}|\d{5}X$/.test(_cardNo.toUpperCase())) {
                ret = "身份证号格式输入有误";
            }
            if (!ret && !/^[a-z0-9A-Z]{6,15}$/.test(_password)) {
                ret = "密码格式输入有误";
            }
            if (ret.length) {
                promptUtil.toast(ret);
                this.btnDisabled = true;
                return false;
            }
            /*if (ret && LastMsgVal != _msg) {
                if (!taoguKit.valid.msgCode(_msg, _phoneNo)) {
                    LastMsgVal = _msg;
                    ret = false;
                }
            }*/
            // return ret;
        },
        RegSubmit: function () {
            if (this.lock) {
                return false;
            }

            this.lock = true;

            $.ajax({
                url: '/security/resetPass.htm',
                type: 'POST',
                data: {
                    cardNo: this.$cardNo.val(),
                    phoneNo: this.$phoneNo.val(),
                    password: window.MD5(this.$password.val()),
                    msg: this.$msg.val()
                },
                success: function (json) {
                    if (!json.code) {
                        //alert('重置成功');
                        promptUtil.alert({
                            'content': '重置成功，请点击返回跳转至前一页'
                        });

                        // 跳转回个人中心
                        // location.href = backto;
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
        },
        bindEvt: function () {

            $('[data-role="msg"]').attr('disabled', true).addClass('disabled').val('');

            var timer = null;
            // 输入框触发校验
            this.$cardNo
                .add(this.$phoneNo)
                .add(this.$msg)
                .add(this.$password)
                .on('input', function (e) {

                    if (_.$cardNo.val() && _.$phoneNo.val() && _.$msg.val() && _.$btnMsg.val() && _.$password.val()) {
                        _.$btn.removeClass('disabled').removeAttr('disabled');
                        _.btnDisabled = false;
                    } else {
                        _.$btn.addClass('disabled').attr('disabled', true);
                        _.btnDisabled = true;
                    }


                }.bind(this));

            // 获取验证码
            this.$btnMsg.on('click', function (e) {
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
                        type: 2 // 找回密码
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

            // 注册提交
            this.$btn.on('click', function (e) {
                _.validAll();
                if (this.lock || this.btnDisabled) {
                    return false;
                }

                // _.validAll();

                var checkcode = taoguKit.valid.getMsgCode($.trim(_.$phoneNo.val()), $.trim(_.$msg.val()));

                if (!checkcode.ret) {
                    //alert(checkcode.message);
                    promptUtil.alert({
                        'content': checkcode.message,
                        'type': 'alert'
                    });
                    return false;
                }

                _.RegSubmit();

            }.bind(this));
        }
    }

    return {
        init: function () {
            _.bindEvt();
        }
    }
})();

page.init();
