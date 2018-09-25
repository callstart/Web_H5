/**
 * 订单详情
 */

var page = (function () {
    var utility = TaoGu.APP.Utility;
    var regtOrdId = utility.Network.queryString('regtOrdId');
    var autoPay = utility.Network.queryString('payauto');
    var autoCancel = utility.Network.queryString('cancelauto');
    var doSubmit = utility.Network.queryString('doSubmit');
    var cancleOrder = utility.Network.queryString('cancleOrder');

    var drType = ""; //再次预约跳转到的页面
    var cancleOrderLock = true;
    var doSubmitLock = true;
    var gopayLock = true;

    var regtTimeType = {
        "1": "上午",
        "2": "下午",
        "3": "全天",
        "4": "中午",
        "5": "晚上",
        "6": "早上"
    };

    var _ = {

        render: function (obj) {
            //午别 【1 上午 2 下午 3全天 4中午 5晚上 6 早上】
            drType = obj.drType;
            var template = $('[data-panle="infos"]').text();
            var infosHtml = "";
            for (var k in obj) {
                if (k == 'regtTimeTypeId') {
                    obj[k] = regtTimeType[obj[k]];
                }
                template = template.replace(new RegExp('#' + k + '#', 'g'), (obj[k] || ''));
            }

            //$('[data-role="residual_time"]').html('就诊日期：' + obj.regtDate + ' ' + regtTimeType[obj.regtTimeTypeId]).show();
            //就诊日期：</span>#regtDate#
            $('[data-role="infos"]').html(template);
            //预约流水号和就诊序号

            //admSeqName为0显示就诊序号，为1显示预约流水号
            if (obj.admSeqName == 1) {
                //regtSeq
                $('[data-role="regtSeq"]').removeClass('none');
            } else {
                //regtSrcLockId
                $('[data-role="regtSrcLockId"]').removeClass('none');
            }

            $('[data-role="regtSrcLockId"]').text()

            //支付状态
            if (obj.fullName) {
                $('[data-role="residual_time"]').removeClass('none')
            }


            // 距离就诊日期还有xxx

            $('[data-role="times"]').text('距离就诊日期还有' + (function () {
                var patientTimr = obj.regtDateTime - obj.sysTime;
                var day = patientTimr / 86400000 //parseInt(patientTimr / 86400000);
                var hour = Math.floor(patientTimr / 1000 / 60 / 60 % 24);
                if (patientTimr <= 0) {
                    $('body').find('[data-role="times"]').addClass('none');
                } else {

                    if (day > 0 && hour > 0) {
                        $('[data-role="times"]').removeClass('none')
                        return parseInt(day) + 1 + '天';

                    } else {
                        $('[data-role="times"]').addClass('none');
                    }
                }

            })());

            $('[data-role="btnbox"]').html((function () {
                var inputStatus = [];
                inputStatus.push('<input type="button" value="再次预约" class="again" data-role="again" data-href="doctorId=' + obj.drId + '&deptId=' + obj.deptId + '&hospId=' + obj.hospId + '&hospName=' + obj.hospName + '&deptName=' + obj.deptName + '&patientId=' + obj.patientId + '"/>')

                if (obj.cancerOrder) {
                    inputStatus.push('<input type="button" value="取消订单" class="cancel" data-role="cancel"/>')
                }
                if (obj.doSubmit) {
                    inputStatus.push('<input type="button" value="立即支付" class="payment" data-role="gopay"/>')
                }
                return inputStatus.join('');
            })());

            //regtStatId等于9的时候支付超时
            //1 已预约
            //2 以取号
            //3 已分诊
            //4 已就诊
            //5 预约失败
            //6 预约异常
            //9 已取消
            //20 未支付
            if (obj.regtStatId == 5 || obj.regtStatId == 6 || obj.regtStatId == 9) {
                $('[data-role="times"]').addClass('none')
            }

            if (obj.regtStatId == 9) {
                $('[data-role="timeRest"]').hide();
                $('[data-role="gopay"]').hide();
                //$('[data-role="hint]').hide();

            }
            if (obj.regtStatId == 5) {
                $('[data-role="hint]').html(obj.hint).show();
            }
            var payLockTime = obj.payLockLongTime - obj.sysTime;
            if (payLockTime > 0) {
                setInterval(function () {
                    payLockTime = payLockTime - 1000;
                    $('[data-role="timeRest"]').text('剩余支付时间' + (function () {
                        var hour = Math.floor(payLockTime / 1000 / 60 / 60 % 24);
                        var min = Math.floor(payLockTime / 1000 / 60 % 60);
                        var sec = Math.floor(payLockTime / 1000 % 60);
                        if (hour > 0) {
                            return hour + '时' + min + '分' + sec + '秒';
                        } else if (min > 0) {
                            return min + '分' + sec + '秒';
                        } else if (sec != '00') {
                            return sec + '秒';
                        } else if (sec <= 0) {
                            location.reload();
                            //$('[data-role="gopay"]').hide()
                            //$('[data-role="timeRest"]').hide();
                            return 0 + '秒';
                        }
                    })())
                }, 1000)

                if (!payLockTime) {
                    $('[data-role="timeRest"]').hide();
                }

            } else {
                gopayLock = false;
                $('[data-role="timeRest"]').hide();
            }


            this.bindEvt();
        },
        fetchData: function (page, callback) {
            $.ajax({
                url: '/order/queryRecordInfoByOrderId.htm',
                type: 'POST',
                data: {
                    regtOrdId: regtOrdId
                },
                success: function (json) {
                    if (!json.code) {
                        if (json.remark) {
                            promptUtil.alert({
                                'content': '备注信息：' + json.remark,
                                'type': 'alert'
                            });

                        }
                        $('[data-role="order-popup"]').removeClass('none');
                        _.render(json);
                    } else {
                        // alert(json.message)
                        promptUtil.alert({
                            'content': json.message,
                            'type': 'alert'
                        });
                    }
                }
            })
        },

        bindEvt: function () {
            $('[data-role="btnbox"]').on('tap', function (e) {

                if ($(e.target).closest('[data-role="again"]').length) {

                    // 跳转医生主页
                    if (drType == 1) {
                        location.href = "/wechat/html/doctor/home/?" + $(e.target).data('href');
                        return false;
                    } else {
                        location.href = "/wechat/html/hospital/office/home/?" + $(e.target).data('href');
                        return false;
                    }

                }

                if ($(e.target).closest('[data-role="cancel"]').length) {
                    //弹出是否取消订单的确认框
                    $('[data-role="cancle_popup"]').removeClass('none');
                    // $('[data-role="fade"]').removeClass('none');
                    $('#fade').show();

                }
                //是否取消订单
                $('[data-role="sureBtn"]').on('tap', function () {
                    $('[data-role="cancle_popup"]').addClass('none');
                    $('#fade').hide();

                    _.orderCancel()
                })

                $('[data-role="cancerBtn"]').on('click', function () {
                    $('[data-role="cancle_popup"]').addClass('none');
                    $('#fade').hide();
                })

                if ($(e.target).closest('[data-role="gopay"]').length) {
                    //立即支付
                    if (gopayLock) {
                        _.orderPay()
                    }

                }

            })
        },
        orderCancel: function () {

            if (!cancleOrderLock) {
                return false;
            }

            cancleOrderLock = false;

            $('[data-role="cancle-doing"]').removeClass('none');
            $.ajax({
                url: '/order/cancleOrder.htm',
                type: 'POST',
                data: {
                    'regtOrdId': regtOrdId
                },
                timeout: 30000,
                success: function (json) {
                    if (!json.code) {
                        // _.fetchData()
                        $('[data-role="cancle-over"]').removeClass('none');
                        setTimeout(function () {
                            $('[data-role="cancle-over"]').addClass('none');
                        }, 3000)

                        location.reload();

                    } else {
                        promptUtil.alert({
                            'content': json.message,
                            'type': 'alert'
                        });
                    }
                },
                complete: function () {
                    $('[data-role="cancle-doing"]').addClass('none');
                    cancleOrderLock = true;
                }
            })
        },
        orderPay: function () {

            if (!doSubmitLock) {
                return false;
            }

            doSubmitLock = false;
            $.ajax({
                url: '/order/pay.htm',
                type: 'POST',
                data: {
                    regtOrdId: regtOrdId
                },
                success: function (json) {
                    if (!json.code) {
                        location.href = json.returnUrl;
                    } else {
                        //alert(json.message)
                        promptUtil.alert({
                            'content': json.message,
                            'type': 'alert'
                        });
                    }
                },
                complete: function () {
                    doSubmitLock = true;
                }
            })

            return false;
        }

    }


    return {
        init: function () {
            _.fetchData();
            _.bindEvt();
        }
    }
})();

page.init();
