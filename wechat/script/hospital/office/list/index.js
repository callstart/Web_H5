var page = (function () {
    var PAGE_SIZE = 20,
        INIT_PAGE = 0,
        Utility = TaoGu.APP.Utility;
    var _height = $(window).height() - 67;
    $('[data-role="hos_tab"]').height(_height);
    var hospName = Utility.Network.queryString("hospName"); //医院名称是必填的
    var hospId = Utility.Network.queryString("hospId");
    var patientId = Utility.Network.queryString("patientId") || '';
    var officeMap = {};
    var _ = {
        'fetchData': function () {
            $.ajax({
                url: '/hospital/queryDeptList.htm',
                type: "POST",
                data: {
                    hospId: hospId
                },
                success: function (json) {
                    if (!json.code) {
                        _.renderData(json);
                    }
                }
            })
        },
        'renderData': function (json) {
            var data = json.resDept;
            // 医院主页
            $('[data-role="orgName"]').append(hospName) //.attr('href', '/wechat/html/hospital/home/?hospitalId=' + json.hospId + '&districtId=' + json.districtId + '&hospName=' + encodeURIComponent(hospName) + '&patientId=' + patientId);

            var rightHtml = []; //科室分类html
            var leftHtml = []; //科室列表html
            //将科室分类和科室列表map起来
            $.each(data, function (i, item) {
                officeMap[item.deptId] = item.childrenDepts;
            })
            $.each(data, function (i, item) {
                leftHtml.push([
                        '<li data-role="office" data-districtid="' + item.deptId + '" ' + (i == 0 ? 'class="current_wbg"' : '') + '>' + item.deptName + '</li>'
                    ].join(''))
                    //只渲染第一个科室的左边
                if (i == 0) {
                    $.each(item.childrenDepts, function (j, d) {
                        rightHtml.push([
                            '<li data-officeId="' + d.deptId + '"><a href="/wechat/html/appointment/doctor/?deptId=' + d.deptId + '&hospId=' + hospId + '&deptName=' + d.deptName + '&hospName=' + hospName + '">' + d.deptName + '</a></li>'
                        ].join(''))
                    })
                }
            })
            $('[data-role="office"]').html(leftHtml.join(''));
            $('[data-role="officeList"]').html(rightHtml.join(''));
        },
        'renderOfficeList': function (data) {
            var officeHtml = [];
            $.each(data, function (i, item) {
                officeHtml.push(['<li data-officeId="' + item.deptId + '"><a href="/wechat/html/appointment/doctor/?deptId=' + item.deptId + '&hospId=' + hospId + '&deptName=' + item.deptName + '&hospName=' + hospName + '&patientId=' + patientId + '">' + item.deptName + '</a></li>'].join(''))
            })
            $('[data-role="officeList"]').html(officeHtml.join(''));
        },
        'bindEvt': function () {
            $('body').on('tap', '[data-districtid]', function () {
                var _t = $(this).closest('[data-districtid]');
                $('[data-role="office"]').removeClass('current_wbg');
                _t.addClass('current_wbg');
                var districtId = _t.data('districtid');

                $('[data-role="officeList"]').css({
                    '-webkit-transform': 'translate3d(0,0,0)'
                });
                _.renderOfficeList(officeMap[districtId]);
            });
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
