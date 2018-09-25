(function () {
    var utility = TaoGu.APP.Utility;
    var cancelCardLock = true;
    var patientId = utility.Network.queryString('patientId');
    var page = function () {
        var _ = {
            renderPage: function (data) {
                $('[data-role="careName"]').html('当前用户：' + (utility.Network.queryString('careName') || ''));
                if (data.treatcardlist) {
                    var medicalListHtml = [];

                    $.each(data.treatcardlist, function (i, d) {
                        //正常非正常状态  html页面中有 原型和接口中都没有
                        medicalListHtml.push([
                            '<li data-role="medicalLi">',
                            '<h4>' + d.hospName + '</h4>',
                            '<p><span>诊疗卡号：</span>' + d.pCardNo,
                            d.pCardState == 1 ? '<i class="normal">正常</i>' : '<i class="abnormal">非正常</i>',
                            '</p>',
                            '<a href="javascript:;" data-role="cancelBtn" data-num="' + i + '" data-memberId="' + d.tmPId + '" data-hospId="' + d.hospId + '">解除</a>',
                            '</li>'
                        ].join(''))
                    })
                    $('[data-role="medical_card_list"]').html(medicalListHtml.join(''))
                }
            },
            "queryHospitalsNoCard": function (callback) {
                $.ajax({
                    url: '/treatcard/queryHospitalsNoCard.htm ',
                    type: 'POST',
                    data: {
                        memberId: patientId
                    },
                    success: function (data) {
                        callback(data);
                    }
                })
            },
            cancelCard: function (num) {
                if (!cancelCardLock) {
                    return false;
                }
                cancelCardLock = false;

                var _memberId = $('[data-num="' + num + '"]').attr("data-memberId");
                var _hospId = $('[data-num="' + num + '"]').attr("data-hospId");
                $.ajax({
                    url: '/treatcard/deleteMemberTreateCard.htm',
                    type: 'POST',
                    data: {
                        "memberId": _memberId,
                        "hospId": _hospId
                    },
                    success: function (data) {
                        if (!data.code) {
                            $('[data-role="medicalLi"]').eq(num).remove();
                            promptUtil.toast('解除绑定成功！');
                            this.fetchPage();
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }
                    }.bind(this),
                    complete: function () {
                        cancelCardLock = true;
                    }
                })
            },
            fetchPage: function () {
                $.ajax({
                    url: '/treatcard/queryTreatCards.htm',
                    type: 'POST',
                    success: function (data) {
                        if (!data.code) {
                            _.renderPage(data);
                        } else {
                            if (data.code == 1500) {
                                $('body').html([
                                    '<div class="no_result">',
                                    '<img src="/wechat/images/no_screen.png" alt="您还没有绑定任何诊疗卡" />',
                                    '</div>',
                                    '<div class="no_result_p">您还没有绑定任何诊疗卡</div>',
                                    '<section class="but_div2">',
                                    '<input type="button" data-role="addCardBtn" value="添加诊疗卡" />',
                                    '</section>'
                                ].join(''))
                            } else {
                                //alert(data.message)
                                promptUtil.alert({
                                    'content': data.message,
                                    'type': 'alert'
                                });
                            }
                        }
                    }
                })
            }
        }
        return {
            init: function () {
                _.fetchPage();
                this.bindEve();
            },
            bindEve: function () {
                $('body').on('tap', '[data-role="addCardBtn"]', function () {
                    _.queryHospitalsNoCard(function (listResponse) {
                        if (!listResponse.code) {
                            location.href = '/wechat/html/pCard/hospitalList/?patientId=' + patientId + '&backto=' + encodeURIComponent(location.href);
                        } else {
                            //alert('已添加完所有医院!');
                            promptUtil.alert({
                                'content': '已添加完所有医院',
                                'type': 'alert'
                            });
                        }
                    });
                })

                $('[data-role="medical_card_list"]').on('tap', '[data-role="cancelBtn"]', function () {
                    var that = this;
                    promptUtil.alert({
                        type: 'confirm',
                        confirm: '确认',
                        content: '确认要解绑此诊疗卡？',
                        confirmFunc: function () {
                            _.cancelCard($(that).attr("data-num"))
                        }
                    });
                })
            }
        }
    }
    page().init();
})()
