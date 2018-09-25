var page = (function () {
    var PAGE_SIZE = 30,
        INIT_PAGE = 1;

    var _ = {
        fetchData: function (page, callback) {
            $.ajax({
                url: '/user/queryMyFavoriteDoctorList.htm',
                type: 'POST',
                data: {
                    count: PAGE_SIZE,
                    start: 0
                },
                success: function (json) {
                    if (!json.code) {
                        callback(json.attdrlist);
                    } else {
                        callback([]);
                    }
                    // if (json.code == 1500) {
                    //     $('body').html([
                    //         '<div class="my_con_noresult">',
                    //         '<img src="/wechat/images/blank.png">',
                    //         '</div>',
                    //         '<p class="cen_text">您还没有关注过任何医生</p> '
                    //     ].join(''))
                    // }
                }
            })
        },
        buildDataFunc: function (list, page) {
            // 没有关注过
            if (page == INIT_PAGE && (!list || !list.length)) {

                $('[data-role="focus"]').addClass('result_bg');

                return [
                    '<div class="my_con_noresult">',
                    '<img src="/wechat/images/blank.png">',
                    '</div>',
                    '<p class="cen_text">您还没有关注过任何医生</p>'
                ].join('');
            }

            var _h = [];

            $.each(list, function (i, el) {
                _h.push([
                    '<div class="my_con" data-role="item" data-href="doctorId=' + el.drId + '&deptId=' + el.deptId + '&deptName=' + encodeURIComponent(el.deptName || '') + '">',
                    '<div class="my_con_pic"><img src="' + '/common/image/' + el.imageId + '.htm' + '" width="138" height="137"/></div>',
                    '<div class="my_con_text">',
                    '<p class="t_name">' + el.drName + '<span class="t_name_o">' + el.drLvlName + '</span></p>',
                    '<p class="amount">预约量:' + el.regtAmt + ' | 关注量:' + el.focusAmt + '</p>',
                    '<p class="hos_cp">',
                    (function () {
                        var a = [];
                        el.deptName && a.push('<span class="kes_n">' + el.deptName + '</span>');
                        el.hospName && a.push('<span class="s_point">' + el.hospName + '</span>');
                        return a.join(' | ');
                    })(),
                    '</p>',
                    '</div>',
                    '</div>'
                ].join(''))
            })

            return _h.join('');
        },
        buildList: function () {
            taoguKit.scrollLoad({
                wrapper: $('[data-role="focus"]'),
                fetchDataFunc: this.fetchData,
                buildDataFunc: this.buildDataFunc,
                pageSize: PAGE_SIZE,
                currPage: INIT_PAGE
            })
        },
        bindEvt: function () {
            $('[data-role="focus"]').on('tap', '[data-role="item"]', function (e) {
                var dom = $(e.target).closest($('[data-role="item"]'));
                if (dom.length) {
                    // 跳转到医生主页
                    location.href = "/wechat/html/doctor/home/?" + dom.data('href');
                }
            })
        }
    }

    return {
        init: function () {
            _.buildList();
            _.bindEvt();
        }
    }
})();

page.init();
