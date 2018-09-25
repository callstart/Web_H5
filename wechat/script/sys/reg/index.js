/**
 * 注册
 * url参数支持
 */

var page = (function () {
    var utility = TaoGu.APP.Utility;
    var backto = utility.Network.queryString('backto');
    var go = utility.Network.queryString('go');
    var lastMsgVal = "";
    var masReg = false;
    //成员的memberId
    var memberId = "";
    var submitLock = false;
    var regSucc = false;
    var _ = {
        $name: $('[data-role="name"]'),
        $gender: $('[data-role="gender"]'),
        $cardNo: $('[data-role="cardNo"]'),
        $addr: $('[data-role="addr"]'),
        $phoneNo: $('[data-role="phoneNo"]'),
        $msg: $('[data-role="msg"]'),
        $btnMsg: $('[data-role="btnMsg"]'),
        $password: $('[data-role="password"]'),
        $rule: $('[data-role="rule"]'),
        $btn: $('[data-role="btn"]'),
        $mockGender: $('[data-role="mockGender"]'),
        btnDisabled: true,
        accessRule: false,
        preValidAll: function () {
            var ret = true,
                errMsg = '';

            var _name = $.trim(this.$name.val()),
                _gender = $.trim(this.$gender.filter('[checked="checked"]').val()),
                _cardNo = $.trim(this.$cardNo.val()),
                _addr = $.trim(this.$addr.val()),
                _phoneNo = $.trim(this.$phoneNo.val()),
                _msg = $.trim(this.$msg.val()),
                _password = $.trim(this.$password.val()),
                _rule = this.accessRule;


            if (ret && !_name.length) {
                ret = false;
            }

            if (ret && !_gender.length) {
                ret = false;
            }

            if (ret && !_cardNo.length) {
                ret = false;
            }

            if (ret && !_addr.length) {
                ret = false;
            }

            if (ret && !_phoneNo.length) {
                ret = false;
            }

            if (ret && !_password.length) {
                ret = false;
            }
            /*if (ret && lastMsgVal != _msg) {
                if (!taoguKit.valid.msgCode(_msg, _phoneNo)) {
                    lastMsgVal = _msg;
                    ret = false;
                }
            }*/

            if (ret && !_msg.length) {
                ret = false;
            }

            if (ret && !_rule) {
                ret = false;
            }

            return ret;
        },
        validAll: function () {
            var ret = true,
                errMsg = '';

            var _name = $.trim(this.$name.val()),
                _gender = $.trim(this.$gender.filter('[checked="checked"]').val()),
                _cardNo = $.trim(this.$cardNo.val()),
                _addr = $.trim(this.$addr.val()),
                _phoneNo = $.trim(this.$phoneNo.val()),
                _msg = $.trim(this.$msg.val()),
                _password = $.trim(this.$password.val()),
                _rule = this.accessRule;


            if (ret && !taoguKit.valid.userName(_name)) {
                promptUtil.toast('姓名格式错误');
                ret = false;
            }

            if (ret && !_gender.length) {
                promptUtil.toast('请选择性别格式错误');
                ret = false;
            }

            if (ret && !taoguKit.valid.idCard(_cardNo)) {
                promptUtil.toast('身份证格式错误');
                ret = false;
            }

            if (ret && !taoguKit.valid.addr(_addr)) {
                promptUtil.toast('地址最大长度为25');
                ret = false;
            }

            if (ret && !taoguKit.valid.mobile(_phoneNo)) {
                promptUtil.toast('电话格式错误');
                ret = false;
            }
            /*var checkcode = taoguKit.valid.getMsgCode($.trim(_.$phoneNo.val()), $.trim(_.$msg.val()));

            if (!checkcode.ret) {
                promptUtil.toast(checkcode.message);
                return false;
            }*/

            if (ret && !taoguKit.valid.passwordFormat(_password)) {
                promptUtil.toast('请输入正确的密码格式');
                ret = false;
            }
            /*if (ret && lastMsgVal != _msg) {
                if (!taoguKit.valid.msgCode(_msg, _phoneNo)) {
                    lastMsgVal = _msg;
                    ret = false;
                }
            }*/

            if (ret && !taoguKit.valid.msgCode(_msg)) {
                promptUtil.toast('请输入正确的验证码');
                ret = false;
            }
            if (ret && taoguKit.valid.msgCode(_msg)) {
                var checkcode = taoguKit.valid.getMsgCode($.trim(_.$phoneNo.val()), $.trim(_.$msg.val()));
                if (!checkcode.ret) {
                    promptUtil.toast(checkcode.message);
                    return false;
                }
            }

            if (ret && !_rule) {
                ret = false;
            }
            return ret;

        },
        RegSubmit: function () {
            if (this.lock) {
                return false;
            }

            this.lock = true;

            $.ajax({
                url: '/security/register.htm',
                type: 'POST',
                data: {
                    chatId: loginUtil.getWxOpenId(),
                    name: $.trim(_.$name.val()),
                    gender: _.$gender.filter('[checked="checked"]').val(),
                    cardNo: $.trim(_.$cardNo.val()),
                    addr: $.trim(_.$addr.val()),
                    phoneNo: $.trim(_.$phoneNo.val()),
                    password: window.MD5(_.$password.val()),
                    msg: $.trim(_.$msg.val())
                },
                success: function (json) {
                    if (!json.code) {
                        memberId = json.memberId;

                        regSucc = true;

                        promptUtil.alert({
                            "content": "恭喜您注册成功，请点击返回跳转至前一页"
                        })

                        $('[data-role="btnMsg"]').attr('disabled', true).addClass('disabled').css("color", "#484747");
                        $('[data-role="name"]').attr('readonly', true);
                        $('[data-role="gender"]').attr('readonly', true);
                        $('[data-role="cardNo"]').attr('readonly', true);
                        $('[data-role="addr"]').attr('readonly', true);
                        $('[data-role="phoneNo"]').attr('readonly', true);
                        $('[data-role="msg"]').attr('readonly', true);
                        $('[data-role="password"]').attr('readonly', true);
                        $('[data-role="btn"]').attr('disabled', true).addClass('disabled');

                        // 弹窗选择跳转回还是去绑定诊疗卡
                        // $('[data-role="mask"]').add($('[data-role="confirmpanel"]')).show();
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
            this.$name
                .add(this.$cardNo)
                .add(this.$addr)
                .add(this.$phoneNo)
                .add(this.$msg)
                .add(this.$password)
                .on('input', function (e) {
                    var _this = this;

                    if (regSucc) {
                        return false;
                    }

                    if (_this.preValidAll()) {
                        _this.$btn.removeClass('disabled').removeAttr('disabled');
                        _this.btnDisabled = false;
                    } else {
                        _this.$btn.addClass('disabled').attr('disabled', true);
                        _this.btnDisabled = true;
                    }
                    //clearTimeout(timer);

                    // 身份证联动男女的选择
                    if ($(e.target).data('role') == _this.$cardNo.data('role')) {
                        if (taoguKit.valid.idCard($(e.target).val()) && $(e.target).val().length == 18) {
                            this.$mockGender.removeClass('active').find('[data-role="gender"]').removeAttr('checked');
                            this.$gender.filter('[value="' + ['2', '1'][$(e.target).val().substr(-2, 1) % 2] + '"]').attr('checked', 'checked').closest('[data-role="mockGender"]').addClass('active');
                        }
                    }
                    /*   timer = setTimeout(function() {
                           if (_this.validAll()) {
                               _this.$btn.removeClass('disabled').removeAttr('disabled');
                               _this.btnDisabled = false;
                           } else {
                               _this.$btn.addClass('disabled').attr('disabled', true);
                               _this.btnDisabled = true;
                           }
                       }, 1000);*/

                }.bind(this));

            // 选择男女联动表单
            this.$mockGender
                .on('click', function (e) {
                    if (regSucc) {
                        return false;
                    }

                    this.lastGenderDom && this.lastGenderDom.removeClass('active').find('[data-role="gender"]').removeAttr('checked');

                    $(e.target).closest('span').addClass('active').find('[data-role="gender"]').attr('checked', 'checked');

                    this.lastGenderDom = $(e.target).closest('span');
                }.bind(this));

            // 选择男女触发校验
            this.$gender
                .on('change', function (e) {
                    if (regSucc) {
                        return false;
                    }

                    if (this.validAll()) {
                        this.$btn.removeClass('disabled').removeAttr('disabled');
                        this.btnDisabled = false;
                    } else {
                        this.$btn.addClass('disabled').attr('disabled', true);
                        this.btnDisabled = true;
                    }
                }.bind(this));

            // 勾选规则触发校验
            this.$rule
                .on('click', function (e) {
                    if (regSucc) {
                        return false;
                    }

                    this.accessRule = $(e.target).closest('[data-role="rule"]').toggleClass('active').hasClass('active');
                    // this.accessRule = $(e.target).closest('[data-role="rule"]').hasClass('active');
                    if (this.preValidAll()) {
                        this.$btn.removeClass('disabled').removeAttr('disabled');
                        this.btnDisabled = false;
                    } else {
                        this.$btn.addClass('disabled').attr('disabled', true);
                        this.btnDisabled = true;
                    }
                }.bind(this))


            // 获取验证码
            this.$btnMsg.on('click', function (e) {
                if (regSucc) {
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
                        phoneNo: $.trim(this.$phoneNo.val()),
                        type: 1 // 注册
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

                if (regSucc || this.btnDisabled) {
                    return false;
                }

                // if (!taoguKit.valid.addr($.trim(_.$addr.val()))) {
                //     promptUtil.toast('地址错误');
                //     return false;
                // }

                // if (!taoguKit.valid.mobile($.trim(_.$phoneNo.val()))) {
                //     promptUtil.toast('输入手机格式有误，请输入正确手机号');
                //     return false;
                // }

                /*if (!taoguKit.valid.msgCode($.trim(_.$msg.val()))) {
                    promptUtil.toast('验证码输入有误');
                    return false;
                }*/


                if (_.validAll()) {
                    _.RegSubmit();
                }

            }.bind(this));

            // 注册后弹窗 - 取消
            /*$('[data-role="cancel"]').on('click', function (e) {
                if (go) {
                    location.href = go + (go.indexOf('?') == -1 ? '?' : '&') + 'backto=' + encodeURIComponent(backto);
                } else {
                    location.href = backto;
                }
            });*/

            // 注册后弹窗 - 确认
            /*$('[data-role="confirm"]').on('click', function (e) {
                location.href = "/wechat/html/pCard/hospitalList/?patientId=" + memberId
            });*/
        }
    }

    return {
        init: function () {
            _.bindEvt();
        }
    }
})();

page.init();
