var page = (function () {
    var PAGE_SIZE = 20,
        INIT_PAGE = 0,
        Utility = TaoGu.APP.Utility;
    loginUtil.wxConfRegister(['openLocation', 'getLocation']);
    var hospName = Utility.Network.queryString("hospName");
    var hospId = Utility.Network.queryString("hospId");
    var patientId = Utility.Network.queryString("patientId") || '';
    var latitude, longitude;
    var _ = {
        fetchData: function (page, callback) {
            $.ajax({
                url: '/hospital/queryHospitalAreaList.htm',
                type: 'POST',
                data: {
                    hospId: hospId,
                    longitude: _.latitude, //通过微信可以获得经纬度
                    latitude: _.longitude,
                    count: PAGE_SIZE,
                    start: page * PAGE_SIZE
                },
                success: function (json) {
                    if (!json.code) {
                        $('[data-role="areaList"]').removeClass('none');
                        $('[data-role="hospName"]').removeClass('none');
                        callback(json.list);
                    }
                }
            })
        },
        getLocation: function () {
            if (wx) {
                wx.ready(function () {
                    wx.getLocation({
                        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        success: function (res) {
                            // alert(JSON.stringify(res))
                            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                            _.buildList(latitude, longitude);
                        },
                        cancel: function (res) {
                            //alert(JSON.stringify(res))
                            _.buildList();
                            // alert('用户拒绝授权获取地理位置');
                        }
                    });
                });

                wx.error(function (res) {
                    // alert(JSON.stringify(res))
                    _.buildList();
                })

            } else {
                // alert('err')
                _.buildList();
            }
        },
        buildDataFunc: function (list, page) {
            if (page == INIT_PAGE) {
                $('[data-role="hospName"]').find('a').append(hospName);
                // $('[data-role="hospName"]').find('a').attr('href', '/wechat/html/hospital/home/?hospitalId=' + hospId + '&hospName=' + encodeURIComponent(hospName) + '&patientId=' + patientId);
            }
            var listArray = [];
            $.each(list, function (i, item) {
                listArray.push([
                    '<div class="hos_list_cont" data-name="' + item.hospName + '" data-depId="' + item.hospId + '">',
                    '<span class="list_cont_pic"><img src="/common/image/' + item.imageId + '.htm" width="128" height="127" style="-webkit-transition:opacity 300ms linear ;opacity:0;" onload="this.style.opacity=1"></span>',
                    // '<span class="list_cont_pic"><img src="/common/image/' + item.imageId + '.htm" width="128" height="127" ></span>',
                    '<div class="list_cont_text">',
                    '<h1>' + item.hospName + (item.havaTreat ? '<span class="fr blue_btn_sl"> 曾就诊 </span>' : '') + (item.distance ? ('<span class="fr pos_m"><img src="/wechat/images/gray_pos_icon.png" width="18" height="23"> ' + item.distance + '</span>') : '') + '</h1>',
                    '<h2>电话：' + (function () {
                        var phone = '';
                        if (item.phone1) {
                            phone += item.phone1;
                        }
                        if (item.phone2 && phone) {
                            phone += ' | ' + item.phone2;
                        } else {
                            phone += item.phone2;
                        }
                        if (item.phone3 && phone) {
                            phone += ' | ' + item.phone3;
                        } else {
                            phone += item.phone3;
                        }
                        return phone;
                    })() + '</h2>',
                    '<p class="same_occu">地址：' + item.addrDet || '' + '</p>',
                    '</div></div>'
                ].join(''));
            });
            return listArray.join('');
        },
        buildList: function (lat, lng) {
            _.latitude = lat;
            _.longitude = lng;

            taoguKit.scrollLoad({
                wrapper: $('[data-role="areaList"]'),
                fetchDataFunc: this.fetchData,
                buildDataFunc: this.buildDataFunc,
                pageSize: PAGE_SIZE,
                currPage: INIT_PAGE
            })
        },
        bindEvt: function () {
            $('body').on('tap', '[data-depId]', function () {
                var depId = $(this).data('depid');
                TaoGu.APP.Utility.Network.relocate('/wechat/html/hospital/office/list/?hospId=' + depId + '&hospName=' + encodeURIComponent($(this).data('name')) + '&patientId=' + patientId)
            })
        }
    }


    return {
        init: function () {
            _.bindEvt();
            _.getLocation();
        }
    }
})();
page.init();
