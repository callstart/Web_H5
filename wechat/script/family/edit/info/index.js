(function () {

    var SICardNo = "";
    var defaultLock = true;
    var utility = TaoGu.APP.Utility;
    var patientId = utility.Network.queryString('patientId');
    var hrefHospitalList = '/wechat/html/pCard/hospitalList/?patientId=' + patientId + '&backto=' + encodeURIComponent(location.href);
    var hrefHospitalmiCard = '/wechat/html/me/miCard/bind/?patientId=' + patientId + '&backto=' + encodeURIComponent(location.href);
    var defaultType = 0;
    var mineFlag = 0; //是否为默认就诊人 初始值为非默认
    var familyEdit = function () {
        var _ = {
            "cardsCache": {},
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
            // 渲染医保卡 诊疗卡
            "renderCards": function () {
                var h = [],
                    data = this.cardsCache;

                // 有医保卡
                if (data.siCardNo) {
                    SICardNo = data.siCardNo;
                    h.push([
                        '<h2 class="hospital_tit" data-role="hospital_tit">医保卡信息</h2>',
                        '<ul class="medical_card_list" data-role="medical_card_list">',
                        '<li data-role="medicalCardshow" data-num="' + SICardNo + '">',
                        '<h4 class="color9c">医保卡号：</h4>',
                        '<p>' + SICardNo + '</p>',
                        '<a data-role="relieveSiCardNo" href="javascript:;">解除</a>',
                        '</li>',
                        '</ul>'
                    ].join(''))
                } else {
                    // 无医保卡
                    h.push([
                        '<h2 class="hospital_tit">完善成员信息</h2>',
                        '<ul class="hospital_list">',
                        '<li class="b_t"><a href="' + hrefHospitalmiCard + '">绑定医保卡</a></li>',
                        // 无医保卡 无诊疗卡
                        !data['tcardlist'].length ? ('<li><a data-role="addPcard" href="javascript:;" data-href="' + hrefHospitalList + '">添加诊疗卡</a></li>') : '',
                        '</ul>'
                    ].join(''));
                }

                // 有诊疗卡
                if (data['tcardlist'].length) {
                    h.push([
                        '<div class="add_card">',
                        '<h3>诊疗卡信息</h3>',
                        '<a data-role="addPcard" href="javascript:;" data-href="' + hrefHospitalList + '">添加诊疗卡</a>',
                        '</div>',
                        '<ul class="medical_card_list" style="">',
                        (function () {
                            var tcardlistList = [];
                            for (var i = 0; i < data['tcardlist'].length; i++) {
                                tcardlistList.push([
                                    '<li data-view="tcardlistList" data-hospid="' + data['tcardlist'][i].hospId + '" data-num="' + data['tcardlist'][i].pCardNo + '">',
                                    '<h4>' + data['tcardlist'][i].hospName + '</h4>',
                                    '<p><span>诊疗卡号：</span>',
                                    data['tcardlist'][i].pCardNo,
                                    data['tcardlist'][i].pCardState == 1 ? '<i class="normal">正常</i>' : '<i class="abnormal">非正常</i>',
                                    '</p>',
                                    '<a data-role="relievetcardlist" href="javascript:;">解除</a>',
                                    '</li>'
                                ].join(''))
                            }
                            return tcardlistList.join('');
                        })()
                    ].join(""))
                } else {
                    // 有医保卡 无诊疗卡
                    if (data.siCardNo) {
                        h.push([
                            '<h2 class="hospital_tit">完善成员信息</h2>',
                            '<ul class="hospital_list">',
                            // 无诊疗卡
                            '<li class="b_t"><a href="' + hrefHospitalList + '">添加诊疗卡</a></li>',
                            '</ul>'
                        ].join(''));
                    }
                }

                return h.join('');
            },
            "renderPage": function (data) {
                var dataInfor = data;
                var cardStatus = [];
                var baseInfo = [
                    '<li>',
                    '<label><span>姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：</span></label>',
                    '<div class="inp_div">',
                    '<span class="span_con">' + dataInfor.pName + '</span>',
                    '</div>',
                    '</li>',
                    '<li>',
                    '<label><span>身&nbsp;份&nbsp;证&nbsp;：</span></label>',
                    '<div class="inp_div">',
                    '<span class="span_con">' + dataInfor.pCertNo + '</span>',
                    '</div>',
                    '</li>',
                    '<li data-role="ModifyTel" data-tel="' + dataInfor.phone + '">',
                    '<label><span>手&nbsp;机&nbsp;号&nbsp;：</span></label>',
                    '<div class="inp_div">',
                    dataInfor.mineFlag == 1 ? ('<span class="span_con">' + dataInfor.phone + '</span>') : ('<a href="javascript:;">' + dataInfor.phone + '</a>'),

                    '</div>',
                    ' </li>',
                    '<li>',
                    '<label><span>常用地址：</span></label>',
                    '<div class="inp_div">',
                    '<a href="/wechat/html/me/addr/?addr=' + encodeURIComponent(dataInfor.pAddr) + '&memberId=' + patientId + '&backto=' + encodeURIComponent(location.href) + '">' + dataInfor.pAddr + '</a>',
                    '</div>',
                    '</li>'
                ].join('');

                $('[data-role="baseInfo"]').html(baseInfo);

                // ??不知用处
                // $('[data-role="baseInfo"]').removeClass('no_mtb').addClass('no_mt');

                var cardsHtml = _.renderCards(_.cardsCache = dataInfor);
                $('[data-role="appendBox"]').html(cardsHtml);
            },
            fetchPage: function () {
                $.ajax({
                    url: '/familyMember/queryMemberInfo.htm',
                    type: 'POST',
                    data: {
                        patientId: patientId
                    },
                    success: function (json) {
                        if (!json.code) {
                            mineFlag = json.mineFlag;
                            _.renderPage(json);
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }
                    }
                })
            },
            relieveSiCardNo: function (dataNUM) {
                $.ajax({
                    url: '/user/unBindSICardFaminly.htm',
                    type: 'POST',
                    data: {
                        memberId: patientId
                    },
                    success: function (json) {
                        if (!json.code) {
                            _.cardsCache.siCardNo = '';
                            $('[data-role="appendBox"]').html(_.renderCards());
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }
                    }
                })
            },
            /*
            // 默认就诊人
            setDefault: function () {
                defaultLock = false;
                $.ajax({
                    url: '/familyMember/updateDefaultMember.htm',
                    data: {
                        patientId: patientId,
                        type: defaultType
                    },
                    success: function (json) {
                        defaultLock = true;
                        if (!json.code) {
                            if (!defaultType) {
                                $('[data-role="default_a"]').removeClass("active").removeAttr('data-active');
                                defaultType = 1;
                            } else {
                                $('[data-role="default_a"]').addClass("active").attr('data-active', "isDefault");
                                defaultType = 0;
                            }
                        } else {
                            alert(json.message)
                        }
                    }
                })
            },
            */
            relievetcardlist: function (dataNum, hospId) {
                $.ajax({
                    url: '/treatcard/deleteMemberTreateCard.htm',
                    type: 'POST',
                    data: {
                        hospId: hospId,
                        memberId: patientId
                    },
                    success: function (json) {
                        if (!json.code) {
                            location.reload();
                            /* var tcards = [];
                             $.each(_.cardsCache.tcardlist, function (i, el) {
                                 if (el.num != dataNum) {
                                     tcards.push(el);
                                 }
                             });
                             _.cardsCache.tcardlist = tcards;
                             $('[data-role="appendBox"]').html(_.renderCards());*/
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }

                    }
                })
            },
            deletePatient: function () {
                $.ajax({
                    url: '/familyMember/deleteMember.htm',
                    type: 'POST',
                    data: {
                        memberId: patientId
                    },
                    success: function (json) {

                        if (!json.code) {
                            location.href = "/wechat/html/family/list/";
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }
                    }
                })
            }
        }

        return {
            init: function () {
                _.fetchPage();
                this.bindEvent();
            },
            bindEvent: function () {
                $('[data-role="baseInfo"]').on('tap', '[data-role="ModifyTel"]', function () {
                    /* if (mineFlag == 1) {
                        location.href = "/wechat/html/me/mobile/change?mobile=" + $(this).attr('data-tel') + '&go=' + encodeURIComponent(location.href);
                         return false;
                     }*/
                    if (mineFlag != 1) {
                        location.href = "/wechat/html/family/edit/phone/?phone=" + $(this).closest('[data-role="ModifyTel"]').attr('data-tel') + '&patientId=' + patientId;
                        return false;
                    }
                });

                // 解绑医保卡
                $('body').on('tap', '[data-role="relieveSiCardNo"]', function () {
                    var that = this;

                    promptUtil.alert({
                        type: 'confirm',
                        confirm: '确认',
                        content: '确认要解绑医保卡？',
                        confirmFunc: function () {
                            _.relieveSiCardNo($(that).parent('[data-role="medicalCardshow"]').attr('data-num'));
                        }
                    });
                });

                // 解绑诊疗卡
                $('body').on('tap', '[data-role="relievetcardlist"]', function (e) {
                    var that = this;

                    promptUtil.alert({
                        type: 'confirm',
                        confirm: '确认',
                        content: '确认要解绑此诊疗卡？',
                        confirmFunc: function () {
                            var $curr = $(that).parent('[data-view="tcardlistList"]')
                            _.relievetcardlist($curr.attr('data-num'), $curr.attr('data-hospid'));
                        }
                    });
                })

                $('body').on('tap', '[data-role="addPcard"]', function (e) {
                    var $target = $(e.target);
                    _.queryHospitalsNoCard(function (listResponse) {
                        if (!listResponse.code) {
                            location.href = $target.data('href');
                        } else {
                            promptUtil.alert({
                                'content': '已添加完所有医院',
                                'type': 'alert'
                            });
                        }
                    });
                });

                // $('body').on('tap', '[data-role="default_a"]', function () {
                //     if (defaultLock) {
                //         _.setDefault();
                //     }
                // })

                $('[data-role="buttonBox"]').on('tap', function () {
                    if (mineFlag == 1) {
                        promptUtil.alert({
                            "content": '不允许删除本人信息',
                            "type": 'alert'
                        })
                        return false;
                    }

                    promptUtil.alert({
                        type: 'confirm',
                        confirm: '确认',
                        content: '确定要删除此家庭成员？',
                        confirmFunc: function () {
                            _.deletePatient();
                        }
                    });
                })
            }
        }
    }

    familyEdit().init();
})()
