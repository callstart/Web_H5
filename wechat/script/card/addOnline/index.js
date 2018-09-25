    var Utility = TaoGu.APP.Utility;
    var hospName = Utility.Network.queryString("hospName");
    var hospId = Utility.Network.queryString("hospId");
    var patientId = Utility.Network.queryString("patientId");
    var backto = Utility.Network.queryString("backto");
    var patientIdHis = '';
    var lockTime = false;
    var phone, errmsg;
    var lockSub = false;

    function fetchData() {
        $.ajax({
            url: '/familyMember/queryMemberInfo.htm',
            type: 'POST',
            data: {
                patientId: patientId
            },
            success: function (json) {
                if (!json.code) {
                    renderPage(json);
                } else {
                    promptUtil.alert({
                        'content': json.message,
                        'type': 'alert'
                    });
                }
            }
        })
    }

    function renderPage(data) {
        $('[data-role="name"]').append(data.pName);
        $('[data-role="idCard"]').append(data.pCertNo);
        $('[data-role="hospName"]').append(hospName);
    }

    function prevalidAll() {
        var ret = true,
            errMsg = '';

        var _phoneNo = $.trim($('[data-role="phone"]').val()),
            _msg = $.trim($('[data-role="validCode"]').val());

        if (ret && !_phoneNo.length) {
            ret = false;
        }

        if (ret && !_msg.length) {
            ret = false;
        }

        return ret;
    }

    function validAll() {
        var ret = true,
            errMsg = '';

        var _phoneNo = $.trim($('[data-role="phone"]').val()),
            _msg = $.trim($('[data-role="validCode"]').val());

        if (ret && !taoguKit.valid.mobile(_phoneNo)) {
            promptUtil.toast('输入手机格式有误，请输入正确手机号');
            ret = false;
        }

        if (ret && !taoguKit.valid.msgCode(_msg)) {
            promptUtil.toast('输入验证码格式有误');
            ret = false;
        }

        return ret;
    }

    function valid(value, type) {
        var errmsg = '';
        var dom_val = $.trim(value);
        // var ValidateRules = {
        //     "phone": {
        //         "reg": taoguKit.valid.mobile,
        //         "prompt": "请填写正确的手机号码",
        //         'words': '手机号'
        //     }
        // };

        if (!dom_val) {
            errmsg = ValidateRules[type].words + '不能为空';
            return errmsg;
        }
        /* if (!ValidateRules[type].reg(dom_val)) {
             errmsg = ValidateRules.validCode.phone.prompt;
         }*/
        //这没用 做测试
        // if (!ValidateRules[type].reg(dom_val)) {
        //     errmsg = ValidateRules[type].prompt;
        // }
        return errmsg;
    }

    // 获取验证码倒计时
    var counting = false;
    var countDown = function (timer_code, Dom) {
        if (counting) {
            return false;
        }
        counting = true;
        var timer_code_save = timer_code;
        var Dom = Dom || [];
        var action_text_dom = Dom;
        var count_text_dom = Dom.val();
        var _ = {
            "reset": function () {
                counting = false;
                timer_code = timer_code_save;
                action_text_dom.val(count_text_dom);
                Dom.removeClass('btn_code_disabled');
                Dom.removeAttr('disabled').removeAttr('style');
            },
            'carryOut': function () {

                if (timer_code <= 1) {
                    _.reset();
                } else {
                    --timer_code;
                    Dom.val('重新获取' + timer_code);
                    Dom.addClass('btn_code_disabled');
                    Dom.attr('disabled', true).css("color", "#484747");
                    setTimeout(_.carryOut, 1000);
                }
            }
        }
        _.carryOut();
    }

    //当手机号和短验码都填了之后提交按钮置成可点样式
    $('[data-role="phone"]')
        .add($('[data-role="validCode"]'))
        .on('input', function (e) {

            if (lockSub) {
                return false;
            }

            var validmsg = prevalidAll();
            // 有错误信息
            if (!prevalidAll()) {
                $('[data-role="submit"]').addClass('disabled').attr('disabled', true);
            } else {
                // 验证无误
                $('[data-role="submit"]').removeClass('disabled').removeAttr('disabled');
            }
        });

    //在获取验证码之前先验证手机号
    $('[data-role="validCodeBtn"]').on('tap', function () {

        if (lockSub) {
            return false;
        }

        var phone = $.trim($('[data-role="phone"]').val());

        if (!taoguKit.valid.mobile(phone)) {
            promptUtil.toast('输入手机格式有误，请输入正确手机号');
            return false;
        }

        if (lockTime) {
            return false;
        }

        lockTime = true;

        $.ajax({
            url: '/security/smscoderequest.htm',
            type: 'POST',
            data: {
                'phoneNo': phone,
                'type': 7,
                'patientId': patientId
            },
            success: function (json) {
                if (!json.code) {
                    $('[data-role="validCode"]').removeAttr('disabled').removeClass('disabled');
                    countDown(60, $('[data-role="validCodeBtn"]'));
                } else {
                    promptUtil.alert({
                        'content': json.message,
                        'type': 'alert'
                    });
                }
            },
            complete: function () {
                lockTime = false;
            }
        })
    });

    $('[data-role="go"]').on('click', function (e) {
        $('[data-role="mask"]').css('display', 'none');
        $('[data-role="hint"]').css('display', 'none');
    })

    //提交之前要重新验证手机和短信验证码
    $('[data-role="submit"]').on('click', function (e) {
        if (lockSub) {
            return false;
        }
        var _phoneNo = $.trim($('[data-role="phone"]').val()),
            _msg = $.trim($('[data-role="validCode"]').val());

        var checkcode = taoguKit.valid.getMsgCode(_phoneNo, _msg);
        if (!checkcode.ret) {
            promptUtil.alert({
                'content': checkcode.message,
                'type': 'alert'
            })
            return false;
        }
        if (validAll()) {
            $.ajax({
                url: '/treatcard/addCardOnline.htm',
                type: 'POST',
                data: {
                    hospId: hospId,
                    memberId: patientId,
                },
                'success': function (json) {
                    if (!json.code) {
                        patientIdHis = json.patientId;
                        $('[data-role="mask"]').show();
                        $('[data-role="pNo"]').text('您的诊疗卡号为:' + json.medicalCardNo);
                        $('[data-role="hint"]').css('display', 'block');
                        $('[data-role="submit"]').attr('disabled', 'disabled');
                        $('[data-role="submit"]').addClass('disabled');

                        $('[data-role="phone"]').attr('readonly', true);
                        $('[data-role="validCode"]').attr('readonly', true);
                        $('[data-role="validCodeBtn"]').addClass('btn_code_disabled');
                        /*  setTimeout(function() {
                              location.href = "/wechat/html/card/noCard/?backto=" + encodeURIComponent(backto) + '&hospId=' + hospId + '&hospName=' + hospName + '&patientId=' + patientId + '&patientIdHis=' + json.patientId;
                          }, 3000)*/
                    } else {
                        promptUtil.alert({
                            'content': json.message,
                            'type': 'alert'
                        });

                    }
                    lockSub = true;
                }
            })
        }

    });

    $('[data-role="validCode"]').attr('disabled', true).addClass('disabled').val('');
    fetchData();
