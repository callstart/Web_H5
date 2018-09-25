(function() {
    var Utility = TaoGu.APP.Utility;
    var lock = false;
    var memberId = Utility.Network.queryString('patientId');
    var backto = Utility.Network.queryString('backto');
    var ModifyTel = function() {
        var _ = {
            renderData: function() {
                var tel = Utility.Network.queryString('phone');
                $('[data-role="telInput"]').val(tel);
            },
            valid: function(str) {
                return /^\d{11}$/.test(str);
            },
            "Modifyrequest": function() {

                if (lock) {
                    return false;
                }

                var telInputVal = $.trim($('[data-role="telInput"]').val());
                var errmsg = "";

                if (!telInputVal) {
                    errmsg = "请输入要修改的手机号";
                }

                if (!errmsg && !taoguKit.valid.mobile(telInputVal)) {
                    errmsg = "输入手机格式有误，请输入正确手机号";
                }

                if (errmsg) {
                    promptUtil.alert({
                        'content': errmsg,
                        'type': 'alert'
                    });
                    return false;
                }

                lock = true;

                $.ajax({
                    url: '/familyMember/updateMemberPhone.htm',
                    type: 'POST',
                    data: {
                        memberId: memberId,
                        phoneNo: telInputVal
                    },
                    success: function(json) {
                        if (json.code) {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        } else {
                            location.href = "/wechat/html/family/edit/info/?patientId=" + memberId;
                        }
                    },
                    complete: function() {
                        lock = false;
                    }
                })
            }
        }
        return {
            init: function() {
                this.bindEvt();
                _.renderData();
            },
            bindEvt: function() {
                $('[data-role="button"]').on('tap', function() {
                    _.Modifyrequest();
                });
                $('[data-role="telInput"]').on('focus', function() {
                    $('[data-role="telInput"]').val('');
                })
            }
        }

    }



    ModifyTel().init();
})();
