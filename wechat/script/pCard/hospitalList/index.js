(function () {
    var utility = TaoGu.APP.Utility;
    var memberId = utility.Network.queryString('patientId');
    var backto = utility.Network.queryString('backto');

    var page = function () {
        var _ = {
            renderPage: function (data) {

                var hospitalNameHTML = [];
                $.each(data.hosplist, function (i, d) {

                    hospitalNameHTML.push('<li><a data-hospid="' + d.hospId + '" data-role="linkHref" data-href="/wechat/html/card/noCard?patientId=' + data.tmNumber + '&hospName=' + d.hospName + '&hospId=' + d.hospId + '&backto=' + encodeURIComponent(backto) + '">' + d.hospName + '</a></li>');
                })

                $('[data-role="hospital_list"]').html(hospitalNameHTML.join(''))
            },
            fetchPage: function () {
                $.ajax({
                    url: '/treatcard/queryHospitalsNoCard.htm ',
                    type: 'POST',
                    data: {
                        memberId: memberId
                    },
                    success: function (data) {
                        if (!data.code) {
                            _.renderPage(data)
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
                $('[data-role="hospital_list"]').on('click', '[data-role="linkHref"]', function () {
                    // 坑！！！！！！！
                    var isGFY = $(this).data('hospid') == 'EBAOWSGHGZYKDXDYFSYY000000000000';

                    var linkHref = $(this).data('href');

                    if (isGFY) {
                        location.href = linkHref;
                        return false;
                    }


                    $.ajax({
                        url: '/treatcard/queryCardsByHosp.htm',
                        type: 'POST',
                        data: {
                            hospId: $(this).data('hospid'),
                            memberId: memberId
                        },
                        success: function (json) {
                            if (json.code == 0) {
                                if (json.medicalCardFlag == 1) {
                                    location.href = linkHref;
                                }
                                if (json.medicalCardFlag == 0) {
                                    //alert('获取诊疗卡异常,请到医院窗口或自助机管理')
                                    promptUtil.alert({
                                        'content': '获取诊疗卡异常,请到医院窗口或自助机管理',
                                        'type': 'alert'
                                    });
                                }
                                return false;
                            }
                            if (json.code == 1500) {
                                location.href = linkHref;
                                return false;
                            } else {
                                //alert(json.message)
                                promptUtil.alert({
                                    'content': json.message,
                                    'type': 'alert'
                                });
                            }

                        }
                    })

                })
            }
        }
    }

    page().init();

})()
