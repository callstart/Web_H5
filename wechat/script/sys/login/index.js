/**
 * 登陆页面
 * url参数支持 tel 默认填入的手机号码
 * url参数支持 backto 业务流程最终要回到的页面
 * url参数支持 go 业务流程下一步跳转的页面
 */

var page = (function () {
    var utility = TaoGu.APP.Utility;
    var regTel = utility.Network.queryString('tel');
    var backto = utility.Network.queryString('backto');
    var go = utility.Network.queryString('go');
    var patientId;

    var _ = {
        $tel: $('[data-role="tel"]'),
        $pw: $('[data-role="pw"]'),
        $forgot: $('[data-role="forgot"]'),
        $btn: $('[data-role="btn"]'),
        $reg: $('[data-role="reg"]'),
        btnDisabled: true,
        renderData: function () {
            if (regTel) {
                this.$tel.val(regTel);
            }

            this.$forgot.attr('href', this.$forgot.attr('href') + '?backto=' + encodeURIComponent(backto) + '&go=' + encodeURIComponent(go));
            this.$reg.attr('href', this.$reg.attr('href') + '?backto=' + encodeURIComponent(backto) + '&go=' + encodeURIComponent(go));

            this.bindEvt();
        },
        valid: function (exp, str) {
            return exp.test(str);
        },
        btnValidRules: function () {
            var reg = '';
            //密码为1-15位  不然验证过不去
            if (!/^1\d{10}$/.test(this.$tel.val())) {
                reg = "手机号格式输入有误";
            }
            if (!reg && !window.taoguKit.valid.passwordFormat(this.$pw.val())) {
                reg = "密码格式输入有误";
            }
            if (reg) {
                promptUtil.toast(reg);
                this.lock = true;
                return false;
            }
            this.lock = false;
        },
        bindEvt: function () {
            this.$tel.add(this.$pw).on('input propertyChange', function (e) {
                if (this.$tel.val() && this.$pw.val()) {
                    this.$btn.removeClass('disabled').removeAttr('disabled');
                    this.btnDisabled = false;
                } else {
                    this.$btn.addClass('disabled').attr('disabled', true);
                    this.btnDisabled = true;
                }



                // //密码为1-15位  不然验证过不去
                // if (this.valid(/^1\d{10}$/, this.$tel.val()) && this.valid(/^[a-z0-9A-Z!-~]{6,15}$/, this.$pw.val())) {
                //     this.$btn.removeClass('disabled').removeAttr('disabled');
                //     this.btnDisabled = false;
                // } else {
                //     this.$btn.addClass('disabled').attr('disabled', true);
                //     this.btnDisabled = true;
                // }
            }.bind(this));


            this.$btn.on('click', function (e) {
                _.btnValidRules();
                if (this.lock || this.btnDisabled) {
                    return false;
                }


                this.lock = true;

                $.ajax({
                    url: '/security/login.htm',
                    type: 'POST',
                    data: {
                        phoneNo: this.$tel.val(),
                        password: window.MD5(this.$pw.val())
                    },
                    success: function (json) {
                        if (!json.code) {
                            $('.mask').show();
                            $('.pop_patients').show();
                            _.fetchPatientList();
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
            // $('body').on('click', '[data-id]', function () {
            //     patientId = $(this).data('id');
            //     patientName = $(this).data('name');
            //     $('.pop_patients').hide();
            //     $('.xmask').hide();
            //     if (go) {
            //         location.href = go + (go.indexOf('?') == -1 ? '?' : '&') + 'backto=' + encodeURIComponent(backto) + 'patientId=' + patientId;
            //     } else {
            //         location.href = backto + (backto.indexOf('?') == -1 ? '?' : '&') + 'patientId=' + patientId + '&patientName=' + patientName;
            //     }
            // });
            // $('[data-role="addPatient"]').on('click', function () {
            //     location.href = "/wechat/html/family/add/"
            // })
        },
        fetchPatientList: function () {
            $.ajax({
                url: '/familyMember/queryMyMembers.htm',
                type: 'POST',
                success: function (data) {
                    if (!data.code) {
                        _.renderPatientList(data.familflist)
                    } else {
                        //alert(data.message);
                        promptUtil.alert({
                            'content': data.message,
                            'type': 'alert'
                        });
                    }
                },
                error: function () {
                    //alert('错误');
                }
            })

            //点击选择就诊人
            $('[data-role="patient"]').on('click', '[data-role="pNameList"]', function (e) {
                var pid = $(e.target).data('id');
                var pname = $(e.target).data('name');
                if (!pid) {
                    return false;
                }
                // 接口种session
                $.ajax({
                    url: "/security/savePatientId.htm",
                    type: "POST",
                    data: {
                        "patientId": pid
                    },
                    success: function (json) {},
                    complete: function () {
                        if (go) {
                            location.href = go + (go.indexOf('?') == -1 ? '?' : '&') + 'backto=' + encodeURIComponent(backto) + '&patientId=' + pid + '&patientName=' + pname;
                        } else if (backto) {
                            location.href = backto + (backto.indexOf('?') == -1 ? '?' : '&') + 'patientId=' + pid + '&patientName=' + pname;
                        } else {
                            history.go(-1);
                        }
                    }
                })
            })
        },
        renderPatientList: function (data) {
            var htmlStr = '';
            $.each(data, function (i, item) {
                htmlStr += "<li data-role='pNameList' data-id='" + item.tmPId + "' data-name=" + item.pName + ">" + item.pName + "</li>";
            });
            $('[data-role="patient"]').append(htmlStr);
        }
    }

    return {
        init: function () {
            _.renderData();
        }
    }
})();

page.init();
