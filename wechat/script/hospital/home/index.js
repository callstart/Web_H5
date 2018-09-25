(function () {

    var utility = TaoGu.APP.Utility;
    var hasPartFlag = null;
    var hospitalId = utility.Network.queryString('hospitalId'),
        districtId = utility.Network.queryString('districtId'),
        hospName = utility.Network.queryString("hospName"),
        patientId = utility.Network.queryString("patientId") || '';
    var hospitalHome = function () {
        var _ = {
            "renderPage": function (data) {
                hasPartFlag = data.havePartFlag
                $('[data-role="hospital-header"]').html([
                    '<img src="/common/image/' + data.imageId + '.htm" width="750" height="354">',
                    '<div class="hos_pbg_black">',
                    '<h1>' + (data.hospName || '') + '</h1>',
                    '<h2>' + (data.hospTierName || '') + ' | ' + (data.hospCatName || '') + '</h2>',
                    '<a data-role="appointment">预约挂号</a>',
                    '</div>'
                ].join(''));

                $('[data-role="hospital-addr"]').html([
                    '<span class="hos_add"><img src="/wechat/images/hos_add.png" width="20" height="24">地址：' + (data.addrDet || '') + '</span>',
                    '<span class="hos_pho" data-role="hospital-tel">',
                    '<img src="/wechat/images/hos_iphone.png" width="20" height="26">',
                    '</span>'
                ].join(''))


                $('[data-role="hospital-introduction"]').html([
                    '<h1>医院介绍 </h1>',
                    '<p>' + (data.detDesc || '暂无') + '</p>'
                ].join(''))

                $('[data-role="call-tel"]').hide();

                $('[data-role="call-tel"]').html([
                    '<div class="phone_popup" id="phone">',
                    '<div class="phone_popup_num">', (function () {
                        var phoneHtml = [];
                        if (data.phone1) {
                            phoneHtml.push('<a href="tel:' + data.phone1 + '">' + data.phone1 + '</a>')
                        }
                        if (data.phone2) {
                            phoneHtml.push('<a href="tel:' + data.phone2 + '">' + data.phone2 + '</a>')
                        }
                        if (data.phone3) {
                            phoneHtml.push('<a href="tel:' + data.phone3 + '">' + data.phone3 + '</a>')
                        }
                        return phoneHtml.join('');
                    })(),
                    '</div>',
                    '<a data-role="phone_cancle" class="phone_cancle">取消</a>',
                    '</div>',
                    '<div id="fade" class="black_overlay" style="display: block;"></div>'
                ].join(''));

            },
            "fetchPage": function () {
                $.ajax({
                    url: location.origin + '/hospital/queryHospitalInfo.htm',
                    type: 'POST',
                    data: {
                        hospitalId: hospitalId
                    },
                    success: function (json) {
                        if (!json.code) {
                            _.renderPage(json)
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
                this.bindEve();
            },
            bindEve: function () {
                $('[data-role="hospital-addr"]').on('tap', '[data-role="hospital-tel"]', function () {
                    $('[data-role="call-tel"]').show()
                })

                $('[data-role="call-tel"]').on('tap', '[data-role="phone_cancle"]', function () {
                    $('[data-role="call-tel"]').hide();
                })

                $('[data-role="hospital-header"]').on('tap', '[data-role="appointment"]', function () {
                    if (hasPartFlag) { //hasPartFlag 1有，0否
                        // 有院区信息 跳转院区
                        TaoGu.APP.Utility.Network.relocate("/wechat/html/hospital/area/list/?hospId=" + hospitalId + '&hospName=' + encodeURIComponent(hospName) + '&patientId=' + patientId);
                    } else {
                        // 无院区信息 跳转科室
                        TaoGu.APP.Utility.Network.relocate("/wechat/html/hospital/office/list/?hospId=" + hospitalId + '&hospName=' + encodeURIComponent(hospName) + '&patientId' + patientId);
                    }

                })

                //挂号规则：跳转到文本信息显示界面，通过预约后台获取，后台会每天通过HIS接口同步到预约平台中
                $('[data-role="registrationRules"]').on('tap', function () {
                    location.href = "/wechat/html/appointment/rule/?hospId=" + hospitalId;
                })


                //TODO:: 出诊排班：跳转到文本信息显示界面，通过预约后台获取，后台会每天通过HIS接口同步到预约平台中
                $('[data-role="Scheduling"]').on('tap', function () {

                })
            }
        }
    }

    hospitalHome().init();
})();
