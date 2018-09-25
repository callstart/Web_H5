/**
 * 绑定医保卡
 */
var Utility = TaoGu.APP.Utility;
var page = (function () {
    var Utility = TaoGu.APP.Utility,
        Bridge = Utility.Bridge;
    var lastMsgVal = "";
    var lock = false;
    var patientId = Utility.Network.queryString('patientId');
    var backto = Utility.Network.queryString('backto');
    var timelock = true;
    var _ = {
        $phoneNo: $('[data-role="phoneNo"]'),
        $msg: $('[data-role="msg"]'),
        $btnMsg: $('[data-role="btnMsg"]'),
        $miCardNo: $('[data-role="miCardNo"]'),
        // $password: $('[data-role="password"]'),
        $btn: $('[data-role="btn"]'),
        btnDisabled: true,
        preValid: function () {
            var ret = true,
                errMsg = '';

            var _phoneNo = $.trim(this.$phoneNo.val()),
                _msg = $.trim(this.$msg.val()),
                // _password = $.trim(this.$password.val()),
                _miCardNo = $.trim(this.$miCardNo.val());


            if (ret && !_phoneNo.length) {
                ret = false;
            }

            if (ret && !taoguKit.valid.msgCode(_msg, _phoneNo)) {
                ret = false;
            }

            if (ret && !_miCardNo.length) {
                ret = false;
            }

            // if (ret && !/^[^\u4E00-\u9FA5]{1,10}$/.test(_password)) {
            //     ret = false;
            // }

            return ret;
        },
        validAll: function () {
            var ret = true,
                errMsg = '';

            var _phoneNo = $.trim(this.$phoneNo.val()),
                _msg = $.trim(this.$msg.val()),
                // _password = $.trim(this.$password.val()),
                _miCardNo = $.trim(this.$miCardNo.val());


            if (ret && !taoguKit.valid.mobile(_phoneNo)) {
                promptUtil.toast('手机号码格式不正确');
                ret = false;
            }


            if (ret && !taoguKit.valid.msgCode(_msg, _phoneNo)) {
                promptUtil.toast('短信格式不正确');
                ret = false;
            }

            if (ret && !taoguKit.valid.miCard(_miCardNo)) {
                promptUtil.toast('卡号格式不正确');
                ret = false;
            }

            var msgValid = taoguKit.valid.getMsgCode(_phoneNo, _msg);
            if (ret && !msgValid.ret) {
                promptUtil.alert({
                    'content': msgValid.message,
                    'type': 'alert'
                });
                ret = false
            }

            // if (ret && !/^[^\u4E00-\u9FA5]{1,10}$/.test(_password)) {
            //     ret = false;
            // }

            return ret;

        },
        bindEvt: function () {
            $('[data-role="msg"]').attr('disabled', true).addClass('disabled').val('');

            //var timer = null;
            // 输入框触发校验
            this.$phoneNo
                .add(this.$msg)
                .add(this.$miCardNo)
                // .add(this.$password)
                .on('input', function (e) {
                    var _this = this;

                    if (!timelock) {
                        return false;
                    }

                    //clearTimeout(timer);

                    /*timer = setTimeout(function() {
                        if (_this.validAll()) {
                            _this.$btn.removeClass('disabled').removeAttr('disabled');
                            _this.btnDisabled = false;
                        } else {
                            _this.$btn.addClass('disabled').attr('disabled', true);
                            _this.btnDisabled = true;
                        }
                    }, 1000);*/
                    if (_.preValid) {
                        if (_this.preValid()) {
                            _this.$btn.removeClass('disabled').removeAttr('disabled');
                            _this.btnDisabled = false;
                        } else {
                            _this.$btn.addClass('disabled').attr('disabled', true);
                            _this.btnDisabled = true;
                        }
                    }
                }.bind(this));

            // 获取验证码
            this.$btnMsg.on('click', function (e) {
                if (!timelock) {
                    return false;
                }
                if (this.lock || !taoguKit.valid.mobile($.trim(this.$phoneNo.val()))) {
                    promptUtil.toast('输入手机格式有误，请输入正确手机号');
                    return false;
                }

                this.lock = true;

                $.ajax({
                    url: '/security/smscoderequest.htm',
                    data: {
                        phoneNo: this.$phoneNo.val(),
                        type: 5, // 绑定医保卡
                        patientId: patientId
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

            // 绑定提交
            this.$btn.on('click', function (e) {
                if (!timelock) {
                    return false;
                }

                if (_.validAll()) {
                    $.ajax({
                        url: '/user/bindSICard.htm',
                        type: 'POST',
                        data: {
                            memberId: Utility.Network.queryString('patientId'),
                            SICardNo: this.$miCardNo.val()
                        },
                        success: function (json) {
                            if (!json.code) {
                                promptUtil.alert({
                                    'content': '绑定成功!',
                                    'type': 'alert'
                                });
                                /*if (backto) {
                                     location.href = backto;
                                 }*/
                                /*else {
                                                                    history.go(-1)
                                                                }*/
                                timelock = false;
                                $('[data-role="btn"]').attr('disabled', 'disabled');
                                $('[data-role="btn"]').addClass('disabled');

                                //this.$btn.addClass('disabled');
                                //
                                $('[data-role="phoneNo"]').attr('readonly', true);
                                $('[data-role="msg"]').attr('readonly', true);
                                $('[data-role="miCardNo"]').attr('readonly', true);
                                // if ($('[data-role]') != "btnMsg") {
                                //     $('input').attr('readonly', 'readonly');
                                // }
                                // $('input').attr('readonly', 'readonly');
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
                }

                // if (this.lock || this.btnDisabled) {
                //     return false;
                // }

                // var _phoneNo = $.trim(this.$phoneNo.val()),
                //     _msg = $.trim(this.$msg.val());
                //this.lock = true;


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
