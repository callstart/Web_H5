    var Utility = TaoGu.APP.Utility;

    var backto = Utility.Network.queryString('backto');
    var hospId = Utility.Network.queryString("hospId");
    var hospName = Utility.Network.queryString("hospName");
    var patientId = Utility.Network.queryString("patientId");
    var patientIdHis = Utility.Network.queryString("patientIdHis") || '';
    var result;
    var medicalCardFlag; //诊疗卡的状态
    var cardId = ''; // 诊疗卡ID
    //loginUtil.wxConfRegister(['scanQRCode']);

    // 坑！！！！！！！
    var isGFY = hospId == 'EBAOWSGHGZYKDXDYFSYY000000000000';

    if (isGFY) {
        $('input[data-role="cardId"]').removeAttr('readonly');
        $('[data-role="tipstext"]').text('若您已在医院办理诊疗卡,请在下方输入卡号').removeClass('none');
    }

    // 获取医院内用户的诊疗卡
    function fetchData() {
        if (isGFY) {
            $('[data-view="noCard"]').removeClass('none');
            return false;
        }

        $.ajax({
            url: '/treatcard/queryCardsByHosp.htm',
            type: 'POST',
            data: {
                hospId: hospId,
                memberId: patientId
            },
            success: function (json) {
                if (!json.code) {

                    patientIdHis = json.patientId;
                    medicalCardFlag = json.medicalCardFlag;

                    // 有诊疗卡界面
                    $('[data-view="hasCard"]').removeClass('none');

                    // 按钮可用
                    $('[data-role="submit"]').removeClass('disabled').removeAttr('disabled');

                    // 诊疗卡
                    cardId = json.medicalCardNo;
                    $('span[data-role="cardId"]').text(json.medicalCardNo);
                } else if (json.code == 1500) {
                    //没有诊疗卡


                    // 无诊疗卡界面
                    $('[data-view="noCard"]').removeClass('none');

                    $('[data-role="cardId"]').attr({
                        'placeholder': '',
                        "disabled": 'true'
                    })

                    // 是否支持在线办理
                    fetchOnline();
                    /*
                    $('[data-role="online"]').removeClass('none');
                    $('[data-role="noCardOpt"]').removeClass('none')
                    */
                } else if (json.code != 1000) {
                    promptUtil.alert({
                        'content': json.message,
                        'type': 'alert'
                    });

                }
            }
        })
    }

    // 检查是否支持在线办理诊疗卡
    function fetchOnline() {
        $.ajax({
            url: '/hospital/checkOnlineCard.htm',
            type: 'POST',
            data: {
                hospId: hospId,
                memberId: patientId
            },
            success: function (json) {
                if (!json.code) {
                    //是否支持在线建立诊疗卡标志
                    //0，不支持，1，支持，3，不存在此医院配置信息
                    /*if (json.map.lineFlag == 0) {
                        $('[data-role="scan"]').removeClass('none');
                        $('input[data-role="cardId"]').removeAttr('readonly');
                    }*/

                    if (json.map.lineFlag == 1) {
                        // $('[data-role="onlinehide"]').addClass('none');
                        $('[data-role="online"]').removeClass('none');
                        $('[data-role="bindCardWays"]').removeClass('none');
                    }
                }
            }
        })
    }

    function sacnningRes(callbacks) {
        wx && wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
                result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                callbacks && callbacks(result);
            }
        });
    }

    function bindEvt() {
        //扫描诊疗卡
        $('[data-role="scan"]').on('click', function () {
            sacnningRes(function (res) {
                re = new RegExp(/^[0-9a-zA-Z]{0,20}$/);
                if (re.test(res)) {
                    $('input[data-role="cardId"]').val(res);
                    $('[data-role="submit"]').removeClass('disabled').removeAttr('disabled');
                } else {
                    promptUtil.alert({
                        'content': '就诊卡错误',
                        'type': 'alert'
                    });

                }
            });
        });

        //在线办理诊疗卡
        $('[data-role="online"]').on('click', function () {
            location.href = "/wechat/html/card/addOnline/?backto=" + encodeURIComponent(backto) + '&hospId=' + hospId + '&hospName=' + encodeURIComponent(hospName) + '&patientId=' + patientId;
        })

        $('input[data-role="cardId"]').on('input', function (e) {
            if ($.trim($(this).val()).length) {
                $('[data-role="submit"]').removeClass('disabled').removeAttr('disabled');
            } else {
                $('[data-role="submit"]').addClass('disabled').attr('disabled', true);
            }
        });

        // 绑定诊疗卡
        $('[data-role="submit"]').on('click', function () {

            // 广附一应先校验卡片信息是否合法
            var gfySucc = false,
                gfyErr = '';

            // 广附一
            if (isGFY) {
                cardId = $.trim($('input[data-role="cardId"]').val());

                $.ajax({
                    url: '/treatcard/verifyTreatCardByHosp.htm',
                    type: 'POST',
                    async: false, // 同步判断
                    data: {
                        hospId: hospId,
                        memberId: patientId,
                        cardNo: cardId
                    },
                    success: function (json) {
                        if (!json.code) {
                            gfySucc = true;
                            medicalCardFlag = json.medicalCardFlag;
                            patientIdHis = json.patientId;
                        } else {
                            gfyErr = json.message;
                        }
                    },
                    error: function () {
                        gfyErr = '接口有误，稍后再试';
                    }
                })

                if (!gfySucc) {
                    promptUtil.alert({
                        'content': gfyErr,
                        'type': 'alert'
                    });
                    return false;
                }


            }

            $.ajax({
                url: '/treatcard/bindTreateCard.htm',
                type: 'POST',
                data: {
                    hospId: hospId,
                    memberId: patientId,
                    patientId: patientIdHis,
                    medicalCardFlag: medicalCardFlag,
                    cardNo: cardId
                },
                success: function (json) {
                    if (!json.code) {
                        //点击，添加成功。返回我的诊疗卡（如果是为本人办理诊疗卡），或者返回某个家庭用户的详情（如果是为某个家庭用户办理诊疗卡）
                        //location.href = backto;
                        promptUtil.alert({
                            'content': '添加诊疗卡成功',
                            'type': 'alert'
                        });
                        $('input[data-role="cardId"]').addClass('disabled').attr('disabled', true);

                        $('[data-role="submit"]').attr('disabled', 'disabled');
                        $('[data-role="submit"]').addClass('disabled');
                        promptUtil.alert({
                            'content': '添加成功',
                            'type': 'alert'
                        });
                    } else {
                        promptUtil.alert({
                            'content': json.message,
                            'type': 'alert'
                        });
                    }
                }
            })
        })
    }

    $('[data-role="hospName"]').text(hospName);
    fetchData();
    bindEvt();
