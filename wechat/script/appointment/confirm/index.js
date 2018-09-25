(function () {
    var utility = TaoGu.APP.Utility;
    var hospId = utility.Network.queryString('hospId') || '', //医院ID
        deptId = utility.Network.queryString('deptId') || '', //科室ID
        doctorId = utility.Network.queryString('doctorId') || '', //医生ID
        date = utility.Network.queryString('date') || '', //日期: yyyy-MM-dd
        ampmType = utility.Network.queryString('ampmType') || '', //午别 【1 上午 2 下午 3全天 4中午 5晚上 6 早上】
        timeSlot = utility.Network.queryString('timeSlot') || '',
        timeStart = timeSlot.split('-')[0], //开始时间 如8:30 （24小时制）
        timeEnd = timeSlot.split('-')[1], //结束时间 如12:00（24小时制）
        resourceId = utility.Network.queryString('resourceId') || '', //号源ID
        patientId = '', //就诊人ID
        feeUnit = utility.Network.queryString('feeUnit') || '',
        // pCardId = utility.Network.queryString('pCardId') || ''; //就诊卡号
        // payMethod: payMethod, //支付方式（1 微信支付 2 易保支付 3 院内支付）
        payMethod = '',
        regtAmt = utility.Network.queryString('regAmt') || '', //挂号费
        numberType = utility.Network.queryString('numberType') || ''; //HIS号别（普通号，专家号等）
    var hospitaName = utility.Network.queryString('hospitaName') || '',
        departmentName = utility.Network.queryString('departmentName') || '',
        doctorName = utility.Network.queryString('doctorName') || '',
        departmentAddr = utility.Network.queryString('departmentAddr') || '';

    var pCardId = "";


    var judgeResultMsg = 0; //预约时手机距离医院的距离校验结果（0：不允许预约,1：允许）

    var patientName, patientCardNo;

    var codeLock = true;
    var submitLock = true;
    var btnDisabled = false; //按钮提交
    var TreatCardLock = false; //选择诊疗卡
    var patientTreatCard = false; //就诊人选择
    var patientTreatCar;
    var appointmentPage = function () {
        var _ = {
            baseInfor: function () {
                $('[data-role="baseInfo"]').html([
                    '<li><span>就诊日期：</span>' + date + '</li>',
                    '<li><span>就诊时段：</span>' + timeSlot + '</li>',
                    '<li><span>医院：</span>' + hospitaName + '</li>',
                    '<li><span>科室：</span>' + departmentName + '</li>',
                    '<li><span>医生：</span>' + doctorName + '</li>',
                    /* '<li><span>科室位置：</span>' + departmentAddr + '</li>',*/
                    '<li><span>挂号费：</span> &yen; ' + regtAmt + '元</li>'
                ].join(''));

                if (patientName) {
                    patientTreatCard = true;
                    $('[data-role="patientName"]').html(patientName);
                }
            },
            //从缓存中获取就诊人ID
            getPatientId: function () {
                $.ajax({
                    url: '/order/getPatientId.htm',
                    type: 'POST',
                    data: null,
                    success: function (json) {
                        if (!json.code && !patientId) {
                            if (json.tmPId) {
                                patientId = json.tmPId;
                                _.getPatientById();
                                //_.treatcardFn(patientId);
                            } else {
                                // _.treatcardFn(patientId);
                                //_.getPatientById();
                            }

                        }
                    }
                })
            },
            treatcardFn: function () {
                $.ajax({
                    url: '/treatcard/queryTreatCardByHosp.htm',
                    type: 'POST',
                    data: {
                        hospId: hospId,
                        tmPId: patientId
                    },
                    success: function (json) {
                        if (!json.code) {
                            $('[data-role="patientCard"]').html(json.pCardNo);
                            if (json.pCardNo) {
                                TreatCardLock = true;
                                if (patientId && TreatCardLock && $('[data-role="telInput"]').val() && $('[data-role="codeInput"]').val()) {
                                    $('[data-role="submitButton"]').removeClass('disabled').removeAttr('disabled');
                                    btnDisabled = true;

                                } else {
                                    $('[data-role="submitButton"]').addClass('disabled').attr('disabled', true);
                                    btnDisabled = false;
                                }
                            }
                        }
                        if (json.code == 1500) {
                            TreatCardLock = false;
                            $('[data-role="patientCard"]').text('请选择')
                        }
                    }
                })
            },
            hospitaDistance: function () {
                $.ajax({
                    url: '/hospital/judgeHospitalDistance.htm',
                    type: 'POST',
                    data: {
                        hospId: hospId,
                        longitude: null,
                        latitude: null
                    },
                    success: function (json) {
                        if (json.code == 50301) {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            })
                        }
                        if (json.code == 50302) {
                            judgeResultMsg = json.judgeResult;
                        }

                    }
                })
            },
            //获取支付类型
            /*payMethodFn: function() {
                $.ajax({
                    url: '/hospital/getHospPayType.htm',
                    type: 'POST',
                    data: {
                        hospId: hospId,
                        date: date
                    },
                    success: function(json) {

                        if (!json.code) {
                            var payMethodHtml = [];
                            $.each(json['data'], function(i, d) {

                                payMethodHtml.push('<span data-pay="paymentMethod" class="' + (i == 0 ? 'active' : '') + '">' + d.value + '<input name="" type="radio" value="' + d.key + '" data-pay="paymentMethodInput"></span>')
                            })
                            $('[data-role="payMethod"]').html(payMethodHtml.join(''));
                        }
                    }
                })
            }, */
            optionSubmit: function (code) {

                $('[data-role="cancle-doing"]').removeClass('none');
                $('[data-role="fade"]').removeClass('none').css('opacity', '0.1');
                submitLock = true;
                //支付方式
                for (var i = 0; i < $('[data-pay="paymentMethod"]').length; i++) {
                    if ($('[data-pay="paymentMethod"]').eq(i).hasClass('active')) {
                        payMethod = $('[data-pay="paymentMethod"]').eq(i).find('[data-pay="paymentMethodInput"]').val();
                    }
                }
                $.ajax({
                    url: '/order/doOrderSubmit.htm',
                    data: {
                        hospId: hospId, //医院ID
                        deptId: deptId, //科室ID
                        doctorId: doctorId, //医生ID
                        date: date, //日期: yyyy-MM-dd
                        ampmType: ampmType, //午别 【1 上午 2 下午 3全天 4中午 5晚上 6 早上】
                        timeStart: timeStart, // timeStart, //开始时间 如8:30 （24小时制）
                        timeEnd: timeEnd, //timeEnd, //结束时间 如12:00（24小时制）
                        resourceId: resourceId, //号源ID
                        patientId: patientId, //就诊人ID
                        // numberType: numberType,
                        pCardId: $('[data-role="patientCard"]').text(), //就诊卡号
                        //payMethod: payMethod, //支付方式（1 微信支付 2 易保支付 3 院内支付）
                        regtAmt: regtAmt //挂号费
                    },
                    type: 'POST',
                    // timeout: 60000,
                    success: function (json) {

                        if (json.code) {

                            promptUtil.alert({
                                'content': json.message,
                                'type': 'confirm',
                                'calcelFunc': function () {
                                    btnDisabled = false;
                                    $('[data-role="submitButton"]').addClass('disabled').attr('disabled', 'disabled');
                                },
                                'confirmFunc': function () {
                                    location.href = "/wechat/html/doctor/home/?deptId=" + deptId + '&doctorId=' + doctorId
                                }

                            });
                            // var message = confirm(json.message);
                            // if (message) {
                            //     location.href = "/wechat/html/doctor/home/?deptId=" + deptId + '&doctorId=' + doctorId
                            // } else {
                            //     btnDisabled = false;
                            //     $('[data-role="submitButton"]').addClass('disabled').Attr('disabled', 'disabled');
                            // }
                        } else {
                            if (json.returnUrl) {
                                location.href = json.returnUrl;
                            } else {
                                location.href = "/wechat/html/me/order/detail/?regtOrdId=" + json.regtOrderID
                            }

                        }
                    },
                    complete: function () {
                        // alert('完成')
                        submitLock = false;
                        $('[data-role="cancle-doing"]').addClass('none');
                        $('[data-role="fade"]').addClass('none');
                    }
                })
            },
            patientsPop: function () {
                $.ajax({
                    url: '/familyMember/queryMyMembers.htm',
                    data: null,
                    type: 'POST',
                    success: function (json) {
                        if (!json.code) {
                            patientTreatCard = true;

                            if (json.fmNumber <= 0) {
                                $('[data-role="addpatientBtn"]').addClass('disabled').attr('data-disabled', 'disabled');
                            } else {
                                $('[data-role="addpatientBtn"]').removeClass('disabled').removeAttr('disabled');
                            }
                            if (!patientTreatCar && !TreatCardLock && $('[data-role="telInput"]').val() && $('[data-role="codeInput"]').val()) {
                                $('[data-role="submitButton"]').removeClass('disabled').removeAttr('disabled');
                                btnDisabled = true;

                            } else {
                                $('[data-role="submitButton"]').addClass('disabled').attr('disabled', true);
                                btnDisabled = false;
                            }
                            var patientsListHtml = [];

                            $.each(json.familflist, function (i, d) {
                                patientsListHtml.push('<li data-role="patientsLi" data-num="' + d.tmPId + '">' + d.pName + '</li>')
                            })
                            $('[data-role="patientsListUl"]').html(patientsListHtml.join(''));
                            $('[data-role="model"]').css({
                                "display": "block"
                            })
                            $('[data-role="patientsList"]').css({
                                "display": "block"
                            })
                        } else {
                            if (json.code != 1000) {
                                promptUtil.alert({
                                    'content': json.message,
                                    'type': 'alert'
                                })
                            }
                        }

                    }
                })
            },
            countDown: function () {
                var originText = $('[data-role="verificationCode"]').val();
                var timeCount = 59;
                $('[data-role="verificationCode"]').attr('disabled', true).css("color", "#484747");
                var timer = setInterval(function () {
                    if (timeCount >= 1) {
                        $('[data-role="verificationCode"]').val('重新获取 ' + timeCount-- + 's')
                    } else {
                        $('[data-role="verificationCode"]').val(originText).removeAttr('disabled');
                        clearInterval(timer);
                    }
                }, 1000)
            },
            "inputRequired": function () {
                var ret = "";
                if (!ret && !taoguKit.valid.mobile($('[data-role="telInput"]').val())) {
                    ret = "手机号格式有误";
                }
                if (!ret && !taoguKit.valid.msgCode($('[data-role="codeInput"]').val())) {
                    ret = "验证码格式有误";
                }
                if (ret) {
                    promptUtil.toast(ret);
                    return false;
                } else {
                    return true;
                }

            },
            "getPatientById": function () {

                $.ajax({
                    url: '/familyMember/queryMemberInfo.htm',
                    type: 'POST',
                    data: {
                        patientId: patientId
                    },
                    success: function (data) {
                        patientName = data.pName;
                        patientCardNo = data.pCertNo;
                        if (patientName) {
                            $('[data-role="patientName"]').html(patientName);
                            patientId = patientId;
                            patientTreatCard = true;
                            _.treatcardFn();
                        } else {
                            $('[data-role="patientName"]').text('请选择');
                            $('[data-role="patientCard"]').text('请选择');
                        }
                    }
                })
            }
        }


        return {
            init: function () {

                $('[data-role="codeInput"]').attr('disabled', true).addClass('disabled').val('');

                this.bindEve();
                _.baseInfor();
                // _.payMethodFn();
                _.hospitaDistance();



                if (patientId) {
                    _.getPatientById();
                    //_.treatcardFn();
                } else {
                    $('[data-role="patientName"]').text('请选择');
                    $('[data-role="patientCard"]').text('请选择');
                    _.getPatientId();
                }
                if ($('[data-role="telInput"]').val() && $('[data-role="codeInput"]').val() && $('[data-role="patientCard"]').text() && ($('[data-role="patientCard"]').text() != '请选择')) {

                    $('[data-role="submitButton"]').removeClass('disabled').removeAttr('disabled');
                    btnDisabled = true;

                } else {
                    $('[data-role="submitButton"]').addClass('disabled').attr('disabled', true);
                    btnDisabled = false;
                }

            },
            bindEve: function () {
                //支付方式联动
                // $('[data-role="payMethod"]').on('tap', '[data-pay="paymentMethod"]', function() {

                //     $('[data-pay="paymentMethod"]').removeClass('active').removeAttr('data-active');
                //     $(this).addClass('active').attr('data-active', "active")
                // })

                $('[data-role="verificationCode"]').on('click', function () {

                        if (!$('[data-role="telInput"]').val().length) {
                            promptUtil.toast("请输入手机号")
                            return false
                        }

                        if (!/^1\d{10}$/.test($('[data-role="telInput"]').val())) {
                            promptUtil.toast("请输入正确的手机号")
                            return false;
                        }
                        if (!codeLock) {
                            return false;
                        }


                        $.ajax({
                            url: '/security/smscoderequest.htm',
                            type: 'POST',
                            data: {
                                phoneNo: $('[data-role="telInput"]').val(),
                                type: 4,
                                patientId: patientId
                            },
                            success: function (json) {
                                if (!json.code) {
                                    $('[data-role="codeInput"]').removeAttr('disabled').removeClass('disabled');
                                    _.countDown()
                                } else {
                                    promptUtil.alert({
                                        'content': json.message,
                                        'type': 'alert'
                                    })
                                }
                            },
                            complete: function () {
                                codeLock = true;
                            }
                        })
                    })
                    /*$('[data-role="patientsListUl"]').find('[data-role="patientsLi"]')
                        .add('[data-role="patientCard"]')
                        .on('click', function () {
                            if (_.inputRequired()) {
                                $('[data-role="submitButton"]').removeClass('disabled').removeAttr('disabled');
                                btnDisabled = true;

                            } else {
                                $('[data-role="submitButton"]').addClass('disabled').attr('disabled', true);
                                btnDisabled = true;
                            }
                        });*/


                $('[data-role="telInput"]')
                    .add($('[data-role="codeInput"]'))
                    .on('input', function (e) {


                        if (patientId && TreatCardLock && $('[data-role="telInput"]').val() && $('[data-role="codeInput"]').val()) {
                            $('[data-role="submitButton"]').removeClass('disabled').removeAttr('disabled');
                            btnDisabled = true;
                        } else {
                            $('[data-role="submitButton"]').addClass('disabled').attr('disabled', true);
                            btnDisabled = false;
                        }


                        // var _this = this;

                        // if (_.inputRequired()) {
                        //     $('[data-role="submitButton"]').removeClass('disabled').removeAttr('disabled');
                        //     btnDisabled = true;

                        // } else {
                        //     $('[data-role="submitButton"]').addClass('disabled').attr('disabled', true);
                        //     btnDisabled = true;
                        // }

                    })

                $('[data-role="submitButton"]').on('tap', function () {
                    if (!_.inputRequired()) {
                        return false;
                    }

                    if (!btnDisabled) {
                        return false;
                    }
                    if (judgeResultMsg) {
                        var phoneNo = $.trim($('[data-role="telInput"]').val()),
                            msg = $.trim($('[data-role="codeInput"]').val());

                        var checkcode = taoguKit.valid.getMsgCode(phoneNo, msg);
                        if (!checkcode.ret) {
                            promptUtil.alert({
                                'content': checkcode.message,
                                'type': 'alert'
                            })
                            return false;
                        }

                        _.optionSubmit()

                    } else {
                        promptUtil.alert({
                            'content': "医院不允许预约",
                            'type': 'alert'
                        })
                    }

                })


                $('[data-role="patientName"]').on('click', function () {
                    _.patientsPop();
                })

                $('[data-role="patientsListUl"]').on('click', '[data-role="patientsLi"]', function () {

                    $('[data-role="patientName"]').html($(this).text());

                    patientId = $(this).data('num');
                    _.treatcardFn($(this).data('num'));
                    patientTreatCard = true;
                    $('[data-role="model"]').css({
                        "display": "none"
                    })
                    $('[data-role="patientsList"]').css({
                        "display": "none"
                    })

                })

                $('[data-role="patientCard"]').on('click', function () {
                    if (patientTreatCard && !TreatCardLock) {
                        //location.href = "/wechat/html/pCard/hospitalList/?patientId=" + patientId + '&backto=' + encodeURIComponent(location.href + '&patientId=' + patientId)
                        location.href = "/wechat/html/card/noCard/?patientId=" + patientId + '&hospName=' + hospitaName + '&hospId=' + hospId + '&backto=' + encodeURIComponent(location.href + '&patientId=' + patientId)
                    }
                })

                $('[data-role="addpatientBtn"]').on('tap', function () {
                    if ($(this).data('disabled') != 'disabled') {
                        location.href = "/wechat/html/family/add/?backto=" + encodeURIComponent(location.href + '&patientId=' + patientId);
                    } else {

                    }

                })
            }

        }
    }


    appointmentPage().init()
})()
