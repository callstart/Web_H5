(function () {
    var lock = true;
    var serializeArray = {};
    // var isDefault = 1;
    var lock = true;
    var utility = TaoGu.APP.Utility;
    var backto = utility.Network.queryString('backto');

    var addSucc = false;

    var page = function () {
        var _ = {
            $name: $('[data-input="name"]'),
            $phone: $('[data-input="phone"]'),
            $cardNo: $('[data-input="cardNo"]'),
            $adr: $('[data-input="adr"]'),
            $btn: $('[data-role="submitButton"]'),
            "btnDisabled": true,
            "validAll": function () {
                var ret = '';
                var _name = $.trim($('[data-input="name"]').val()),
                    _phone = $.trim($('[data-input="phone"]').val()),
                    _cardNo = $.trim($('[data-input="cardNo"]').val()),
                    _adr = $.trim($('[data-input="adr"]').val());

                if (!taoguKit.valid.userName(_name)) {
                    ret = "姓名格式输入有误";
                }
                if (!ret && !taoguKit.valid.idCard(_cardNo)) {
                    ret = "身份证格式输入有误";
                }
                if (!ret && !taoguKit.valid.mobile(_phone)) {
                    ret = "手机号格式输入有误";
                }

                if (!ret && !taoguKit.valid.addr(_adr)) {
                    ret = "地址格式输入有误";
                }
                if (ret) {
                    promptUtil.toast(ret);
                    lock = true;
                    return false;
                }
                lock = false;
                //return ret;
            },
            "submitData": function () {
                if (addSucc) {
                    return false;
                }

                _.validAll();
                if (lock || _.btnDisabled) {
                    return false;
                }

                serializeArray = {
                    "name": _.$name.val(),
                    "phoneNo": _.$phone.val(),
                    "cardNo": _.$cardNo.val(),
                    "addr": _.$adr.val()

                    /*,"isDefault": isDefault*/
                };

                lock = true;
                $.ajax({
                    url: '/familyMember/addMember.htm',
                    data: serializeArray,
                    type: 'POST',
                    success: function (json) {
                        if (!json.code) {
                            /*if (backto) {
                                location.href = backto + '&patientId=' + json.map.tmPId;
                            } else {
                                // location.href = "/wechat/html/family/edit/info/?patientId=" + json.map.tmPId
                                location.href = "/wechat/html/family/list/?patientId=" + json.map.tmPId
                            }*/

                            addSucc = true;

                            $('[data-role="submitButton"]').addClass('disabled').attr('disabled', true);

                            $('[data-input="name"]').attr('readonly', true);
                            $('[data-input="cardNo"]').attr('readonly', true);
                            $('[data-input="phone"]').attr('readonly', true);
                            $('[data-input="adr"]').attr('readonly', true);

                            promptUtil.alert({
                                'content': '添加家庭成员成功！',
                                'type': 'alert'
                            });
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }
                    },
                    complete: function () {
                        lock = false;
                    }
                })
            }
        }
        return {
            init: function () {
                // var timer = null;
                _.$name
                    .add(_.$phone)
                    .add(_.$cardNo)
                    .add(_.$adr)
                    .on('input', function (e) {

                        if (addSucc) {
                            return false;
                        }
                        // clearTimeout(timer);
                        // timer = setTimeout(function () {
                        // if (_.validAll()) {
                        //     _.$btn.removeClass('disabled').removeAttr('disabled');
                        //     _.btnDisabled = false;
                        // } else {
                        //     _.$btn.addClass('disabled').attr('disabled', true);
                        //     _.btnDisabled = true;
                        // }
                        // }, 1000);
                        // $name: $('[data-input="name"]'),
                        // $phone: $('[data-input="phone"]'),
                        // $cardNo: $('[data-input="cardNo"]'),
                        // $adr: $('[data-input="adr"]'),

                        if (_.$name.val() && _.$phone.val() && _.$cardNo.val() && _.$adr.val()) {
                            _.$btn.removeClass('disabled').removeAttr('disabled');
                            _.btnDisabled = false;
                        } else {
                            _.$btn.addClass('disabled').attr('disabled', true);
                            _.btnDisabled = true;
                        }
                    })

                _.$btn.on('click', function () {
                    _.submitData()
                })

                /*$('[data-role="default_a"]').on('tap', function () {
                    if ($(this).attr('data-active') == "isDefault") {
                        isDefault = 0;
                        _.btnDisabled = false;
                        $('[data-role="default_a"]').removeClass("active").removeAttr('data-active');
                    } else {
                        isDefault = 1;
                        _.btnDisabled = true;
                        $('[data-role="default_a"]').addClass("active").attr('data-active', "isDefault");
                    }
                })*/
            }
        }
    }
    page().init();
})()
