var page = (function () {
    var PAGE_SIZE = 20,
        INIT_PAGE = 0;
    var Utility = TaoGu.APP.Utility;
    var noresultLock = true;
    var patientId = Utility.Network.queryString("patientId") || '';

    var $searchInput = $('[data-role="input"]').val(''), // 搜索框
        $searchCancel = $('[data-role="cancel"]'), // 医院列表
        $searchClear = $('[data-role="clsearBtn"]'), // 医院列表
        $hospList = $('[data-role="hospList"]'), // 医院列表
        $noRecord = $('[data-role="no_his_record"]'), // 医院为空
        $docRecord = $('[data-role="record"]'), // 医生搜索记录
        $doctorList = $('[data-role="doctorList"]'); // 医生列表

    var _ = {
        isLogin: function () {
            $.ajax({
                url: '/user/queryUserInfo.htm',
                type: 'POST',
                forbidLoginHook: true,
                success: function (json) {
                    if (json.code == 1000) {
                        // TaoGu.APP.Utility.Network.relocate("/wechat/html/sys/login/?backto=" + encodeURIComponent(window.location.href));
                        $(document).trigger('loginKit_login');
                        /*
                        promptUtil.alert({
                            'content': '您当前还未登录，登录成功后，方便快速挂号预约',
                            'type': 'confirm',
                            'confirm': '立即登录',
                            'cancel': '暂不登录',
                            'confirmFunc': function() {
                                location.href = '/wechat/html/sys/login/?backto=/wechat/html/hospital/list/';
                            }
                        })
                        */
                    }
                    if (!json.code) {
                        patientId = json.patientId;
                    }
                }
            })
        },
        // 医院列表data
        fetchData: function (page, callback) {
            $.ajax({
                url: '/hospital/queryHospitalList.htm',
                type: "POST",
                data: {
                    count: PAGE_SIZE,
                    start: page * PAGE_SIZE
                },
                success: function (json) {
                    if (!json.code) {
                        $noRecord.addClass('none');

                        callback(json.list);
                    } else if (json.code == 1500) {
                        callback([]);

                        $noRecord.removeClass('none');
                    }
                }
            })
        },
        // 医院列表html
        buildDataFunc: function (list, page) {
            var htmlStr = [];
            if (list) {
                $.each(list, function (i, item) {
                    htmlStr.push([
                        '<div class="hos_list_cont" data-role="hos_list_cont" data-hospId="' + item.hospId + '" data-part="' + item.havePartFlag + '" data-hospName="' + item.hospName + '">',
                        '<span class="list_cont_pic" data-role="list_cont_pic"><img src="/common/image/' + item.imageId + '.htm" width="128" height="127"/><i>' + (item.orgMiFlag ? '<img src="/wechat/images/dd_icon.png">' : '') + '</i></span>',
                        '<div class="list_cont_text" data-role="list_cont_text">',
                        '<h1>' + item.hospName + '<span class="fr ' + (item.havaTreatCard ? 'orange_btn_s' : '') + '" style="' + (item.havaTreatCard ? '' : 'display:none;') + '">诊疗卡</span></h1>',
                        '<h2>' + (item.hospTierName ? item.hospTierName + ' | ' : '') + (item.hospCatName ? item.hospCatName : '') + '</h2>',
                        '<p>' + (item.hospMajorDet ? item.hospMajorDet : '') + '</p>',
                        '</div></div>'
                    ].join(""))
                })

                return htmlStr.join('');
            }
        },
        // 医院列表scoll
        buildList: function () {
            taoguKit.scrollLoad({
                wrapper: $hospList,
                fetchDataFunc: this.fetchData,
                buildDataFunc: this.buildDataFunc,
                pageSize: PAGE_SIZE,
                currPage: INIT_PAGE
            })
        },
        // 渲染历史搜索
        renderRecord: function (data) {
            $('[data-record="ul"]').remove();

            var recordArr = [];

            recordArr.push('<ul data-record="ul"><li class="his_record_title">历史搜索</li>');
            $.each(data, function (i, item) {
                recordArr.push([
                    '<li data-role="history" data-name="' + data[i] + '"><a href="javascript:;">' + data[i] + '</a></li>'
                ].join(''))
            })
            recordArr.push('<li class="his_record_cen" data-role="clearRecord"><a href="javascript:;">清空搜索记录</a></li></ul>');

            $docRecord
                .html(recordArr.join(''))
                .css('margin-top', $('.pf').height() + 'px')
                // .show()
                // .removeClass('none');
        },
        // 获取页面历史
        getRecord: function () {
            $.ajax({
                url: '/doctor/querySearchHistory.htm',
                type: 'POST',
                data: {
                    historyType: 10,
                    wxTmpId: loginUtil.getWxOpenId() || ''
                },
                success: function (json) {
                    if (!json.code) {
                        _.renderRecord(json.resList);
                    }
                }
            })
        },
        // 清除历史记录
        clearRecord: function () {
            $.ajax({
                url: '/doctor/deleteSearchHistory.htm',
                data: {
                    historyType: 10,
                    wxTmpId: loginUtil.getWxOpenId() || ''
                },
                type: 'POST',
                success: function (json) {
                    if (!json.code) {
                        $(['data-record="ul"']).remove();
                    }
                }
            })
        },
        // 医生列表
        buildListDrList: function () {
            var doctorName = $searchInput.val();

            if (!$.trim(doctorName).length) {
                return false;
            }

            $doctorList.empty();

            function fetchDrList(page, callback) {
                $.ajax({
                    url: '/doctor/queryDoctorList.htm',
                    type: 'POST',
                    data: {
                        doctorName: doctorName,
                        wxTmpId: loginUtil.getWxOpenId() || "",
                        start: page * PAGE_SIZE,
                        count: PAGE_SIZE
                    },
                    success: function (json) {
                        if (!json.code) {
                            callback(json.list);
                        } else {
                            callback([]);
                        }
                        if (json.code == 1500 && !page) {
                            $noRecord.removeClass('none');
                        }
                        if (json.code == 1500 && page) {
                            $('[data-role="doctorList"]').append('<h2 style="text-align:center line-height:40px">加载完毕</h2>');
                        }
                    },
                    error: function () {
                        callback([]);
                    }
                })
            }

            function renderDrList(list, page) {
                if (page == 0 && (!list || !list.length)) {
                    $noRecord.removeClass('none');
                    // alert("未找到相关结果")
                } else {
                    $noRecord.addClass('none');
                }
                // $docRecord.addClass('none');

                var htmlStr = [];
                $.each(list, function (i, item) {
                    htmlStr.push(['<div class="my_con" data-role="doctor" data-doctorid="' + item.drId + '" data-deptid="' + item.deptId + '" data-hospid="' + item.hospId + '" data-hospname="' + item.hospName + '" data-deptname="' + item.deptName + '">',
                        '<div class="my_con_pic"><img src="/common/image/' + item.imageId + '.htm"  width="138" height="137"></div>',
                        '<div class="my_con_text">',
                        '<p class="t_name">' + item.drName + '<span class="t_name_o">' + item.drLvlName + '</span></p>',
                        '<p class="amount">预约量:' + item.regtAmt + ' | 关注量:' + item.focusAmt + '</p>',
                        /*'<p class="goodat">擅长:' + item.skill + '</p>',*/
                        ' <p class="hos_cp">',
                        (function () {
                            var a = [];
                            item.deptName && a.push('<span>' + item.deptName + '</span>');
                            item.hospName && a.push('<span>' + item.hospName + '</span>');
                            return a.join(' | ');
                        })(),
                        '</p>',
                        '</div></div>'
                    ].join(''))
                });

                return htmlStr.join('');
            }

            // 搜索医生
            taoguKit.scrollLoad({
                wrapper: $doctorList,
                fetchDataFunc: fetchDrList,
                buildDataFunc: renderDrList,
                pageSize: PAGE_SIZE,
                currPage: INIT_PAGE
            })
        },
        bindEvt: function () {
            var me = this;

            var searchTimer = null;

            //搜索医生
            $searchInput.on('focus', function () {
                $(this).parent().siblings(".city_but").show();
                $(this).parent().addClass("mr");

                $hospList.hide();
                $docRecord.show().removeClass('none');
                $searchCancel.removeClass('none');

                $doctorList.addClass('none');
                $noRecord.addClass('none');

                _.getRecord();
            });

            // 输入框联动清除按钮展示
            $searchInput.on('input', function (e) {
                if ($(this).val()) {
                    $searchClear.show();
                } else {
                    $searchClear.hide();
                }
            })

            // 取消
            $searchCancel.on('click', function () {
                $(this).siblings(".search_mr").removeClass("mr");
                // $(this).hide();
                $searchClear.css('display', 'none');
                $(this).siblings(".pos_add").show();
                // $('[data-record="ul"]').css('display', 'none');
                $hospList.show();
                $searchInput.val('');
                $('[data-record="ul"]').remove();
                $doctorList.addClass('none').empty();
                $searchCancel.addClass('none');
                $noRecord.addClass('none');
                $docRecord.addClass('none');
            });

            //清理输入框的内容
            $searchClear.on('tap', function () {
                // console.log('clear')

                searchTimer && clearTimeout(searchTimer);

                $searchInput.val('').focus();

                $docRecord.removeClass('none');

                $doctorList.addClass('none');
                $noRecord.addClass('none');

                $(this).hide();
                _.getRecord();
            });

            // 点击历史搜索
            $('body').on('tap', '[data-role="history"]', function () {
                // console.log('history')
                var doctorName = $(this).data('name');
                $searchInput.val(doctorName);
                $searchClear.show();

                $docRecord.addClass('none');
                $doctorList.removeClass('none');

                _.buildListDrList();
            });

            // 搜索
            $searchInput.on('change propertychange', function () {
                // console.log('change')
                var search = $searchInput.val();

                // var reg = true;
                // if ($(this).val().length > 0) {
                //     reg = true;
                // }

                if (search.length == 0) {
                    $doctorList.addClass('none');

                    $noRecord.addClass('none');
                    $docRecord.removeClass('none');
                    _.getRecord();
                    return false;
                }
                // if (reg && (/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(search))) {
                //     $('[data-role="clearBtn"]').css('display', 'block');
                // } else {
                //     alert('请输入正确的搜索内容');
                // }


                $docRecord.addClass('none');
                $doctorList.removeClass('none');
                // searchTimer = setTimeout(function () {

                if (searchTimer) {
                    clearTimeout(searchTimer)
                }

                searchTimer = setTimeout(function () {
                    _.buildListDrList();
                }, 300)

                // }, 1000)
            });

            // 搜索医生结果
            $('body').on('tap', '[data-role="doctor"]', function () {
                var doctorId = $(this).data('doctorid'),
                    hospId = $(this).data("hospid"),
                    deptId = $(this).data("deptid"),
                    hospName = $(this).data("hospname"),
                    deptName = $(this).data("deptname");

                TaoGu.APP.Utility.Network.relocate("/wechat/html/doctor/home/?hospId=" + hospId + "&hospName=" + encodeURIComponent(hospName) + "&doctorId=" + encodeURIComponent(doctorId) + "&deptId=" + encodeURIComponent(deptId) + "&deptName=" + encodeURIComponent(deptName));

            });

            // 清除搜索结果
            $('body').on('tap', '[data-role="clearRecord"]', function () {
                $('[data-record="ul"]').remove();
                _.clearRecord();
            });

            // // 进入院区
            $('body').on('tap', '[data-role="hos_list_cont"]', function () {

                var havePartFlag = $(this).data('part');
                var hospId = $(this).data('hospid');
                var hospName = $(this).data('hospname');
                if (havePartFlag) {
                    TaoGu.APP.Utility.Network.relocate("/wechat/html/hospital/area/list/?hospId=" + hospId + "&hospName=" + encodeURIComponent(hospName) + '&patientId=' + patientId);
                } else {
                    TaoGu.APP.Utility.Network.relocate("/wechat/html/hospital/office/list/?hospId=" + hospId + "&hospName=" + encodeURIComponent(hospName) + '&patientId=' + patientId);
                }
            });
        }
    }
    return {
        init: function () {
            _.isLogin();
            _.buildList();
            _.bindEvt();
        }
    }
})();

page.init();
