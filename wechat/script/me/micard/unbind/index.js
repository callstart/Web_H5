/**
 * 解绑医保卡
 */

var page = (function() {
    var Utility = TaoGu.APP.Utility;
    var micard = Utility.Network.queryString('micard');
    var patientId = Utility.Network.queryString('patientId');
    var backto = Utility.Network.queryString('backto');
    var lock = false;
    var lockTime = true;
    var readonlyTime = true;
    // var LastMsg = "";
    var _ = {
        $phoneNo: $('[data-role="phoneNo"]'),
        $msg: $('[data-role="msg"]'),
        $btnMsg: $('[data-role="btnMsg"]'),
        $miCardNo: $('[data-role="miCardNo"]'),
        // $password: $('[data-role="password"]'),
        $btn: $('[data-role="btn"]'),
        btnDisabled: true,
        prevalidAll: function() {
            var ret = true,
                errMsg = '';

            var _phoneNo = $.trim(this.$phoneNo.val()),
                _msg = $.trim(this.$msg.val()),
                // _password = $.trim(this.$password.val()),
                _miCardNo = $.trim(this.$miCardNo.val());

            if (ret && !_phoneNo.length) {
                ret = false;
            }

            // if (ret && LastMsg != _msg) {
            if (ret && !_msg.length) {
                // LastMsg = _msg;
                ret = false;
            }
            // }

            if (ret && !_miCardNo.length) {
                ret = false;
            }

            // if (ret && !/^[^\u4E00-\u9FA5]{1,10}$/.test(_password)) {
            //     ret = false;
            // }

            return ret;

        },
        validAll: function() {
            var ret = true,
                errMsg = '';

            var _phoneNo = $.trim(this.$phoneNo.val()),
                _msg = $.trim(this.$msg.val()),
                // _password = $.trim(this.$password.val()),
                _miCardNo = $.trim(this.$miCardNo.val());

            if (ret && !taoguKit.valid.mobile(_phoneNo)) {
                promptUtil.toast('手机格式不正确');
                ret = false;
            }

            // if (ret && LastMsg != _msg) {
            if (ret && !taoguKit.valid.msgCode(_msg, _phoneNo)) {
                promptUtil.toast('验证码格式不正确');
                // LastMsg = _msg;
                ret = false;
            }
            // }

            if (ret && !taoguKit.valid.miCard(_miCardNo)) {
                promptUtil.toast('医保卡格式不正确');
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
        bindEvt: function() {
            $('[data-role="msg"]').attr('disabled', true).addClass('disabled').val('');

            var timerType = null,
                timer = null;
            // 输入框触发校验
            this.$phoneNo
                .add(this.$msg)
                .add(this.$miCardNo)
                // .add(this.$password)
                .on('input', function(e) {
                    var _this = this;
                    // clearTimeout(timerType);
                    // timerType = setTimeout(function () {
                    if (_this.prevalidAll()) {
                        _this.$btn.removeClass('disabled').removeAttr('disabled');
                        _this.btnDisabled = false;
                    } else {
                        _this.$btn.addClass('disabled').attr('disabled', true);
                        _this.btnDisabled = true;
                    }
                    // }, 200);

                }.bind(this));

            // 获取验证码
            this.$btnMsg.on('tap', function(e) {
                if (this.lock) {
                    return false;
                }

                if (!lockTime || !readonlyTime) {
                    return false;
                }
                // if (!taoguKit.valid.mobile($.trim(this.$phoneNo.val()))) {
                //     promptUtil.toast('输入手机格式有误，请输入正确手机号');
                //     return false;
                // }
                this.lock = true;
                $.ajax({
                    url: '/security/smscoderequest.htm',
                    data: {
                        phoneNo: this.$phoneNo.val(),
                        type: 6 // 解绑医保卡
                    },
                    type: 'POST',
                    success: function(json) {
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
                        lockTime = false;
                        var timer = setInterval(function() {
                            if (timeCount >= 1) {
                                $(e.target).val('重新获取 ' + timeCount-- + 's');

                            } else {

                                lockTime = true;
                                clearInterval(timer);
                                $(e.target).val(originText).removeAttr("style").removeAttr('disabled');
                            }
                        }.bind(this), 1000)
                    }.bind(this),
                    complete: function() {
                        this.lock = false;
                    }.bind(this)
                });
            }.bind(this));

            // 解绑提交
            this.$btn.on('tap', function(e) {

                if (this.lock || this.btnDisabled) {
                    return false;
                }



                //if (_.validAll()) {
                if (true) {
                    this.lock = true;
                    $.ajax({
                        url: '/user/unBindSICard.htm',
                        type: 'POST',
                        data: {
                            memberId: Utility.Network.queryString('patientId'),
                            SICardNo: this.$miCardNo.val()
                        },
                        success: function(json) {
                            if (!json.code) {

                                promptUtil.alert({
                                    'content': '解除绑定成功！',
                                    'type': 'alert'
                                });
                                $('[data-role="btn"]').addClass('disabled');
                                if ($('[data-role]') != "btnMsg") {
                                    $('input').attr('readonly', 'readonly');
                                }
                                $('input').attr('readonly', 'readonly');
                                readonlyTime = false;
                                // if (backto) {
                                //     //location.href = backto;
                                // } else {
                                //     //history.go(-1)
                                // }
                            } else {
                                promptUtil.alert({
                                    'content': json.message,
                                    'type': 'alert'
                                });
                            }
                        },
                        complete: function() {
                            this.lock = false;

                            //$('[data-role="btnMsg"]').val('')
                        }.bind(this)
                    })
                }

            }.bind(this));
        }
    }

    return {
        init: function() {
            $('[data-role="micard"]').html($('[data-role="micard"]').html().replace(/#card#/, micard));
            _.bindEvt();
        }
    }
})();

page.init();
