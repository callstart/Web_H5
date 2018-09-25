    var Utility = TaoGu.APP.Utility;
    var regtFee, //费用
        regDate, //日期
        ampmType, //午别
        dateWeekAmPm, //当前时间
        isFollow,
        outDate,
        doctorId = Utility.Network.queryString("doctorId"),
        hospId = Utility.Network.queryString("hospId"),
        deptId = Utility.Network.queryString("deptId"),
        hospName = Utility.Network.queryString("hospName"),
        deptName = Utility.Network.queryString("deptName"),
        patientId = Utility.Network.queryString("patientId") || '',
        doctorName = Utility.Network.queryString("doctorName") || '';
    var jumpHref = "";
    var _scrollTop = 0;
    var isFollow = 0;
    var stateMap = {
        '0': {
            'style': "order_blue_btn",
            'state': "挂号"
        },
        '1': {
            'style': "order_stop_btn",
            'state': "停诊"
        },
        '2': {
            'style': "order_full_btn",
            'state': '约满'
        },
        '3': {
            style: "order_blue_btn",
            state: '预约挂号'
        },
        '4': {
            style: "order_blue_btn",
            state: '当日挂号'
        }
    };
    $('#light').css('display', 'none');

    function fetchScheduleData() {
        $('[data-role="cancle-doing"]').show();
        $.ajax({
            url: '/hospital/queryScheduleByDoctorPage.htm',
            type: 'POST',
            data: {
                doctorId: doctorId,
                deptId: deptId
            },
            success: function (json) {
                if (!json.code) {
                    doctorName = json.doctorName;
                    renderSchedule(json.schedualInfoDtoList);
                } else {
                    promptUtil.alert({
                        'content': json.message,
                        'type': 'alert'
                    });
                }
            },
            complete: function () {
                $('[data-role="cancle-doing"]').hide();
            }
        })
    }

    function fetchTitleData() {
        $.ajax({
            url: '/doctor/queryDoctorInfo.htm',
            type: 'POST',
            data: {
                doctorId: doctorId
                    //deptId: deptId
            },
            success: function (json) {
                if (!json.code) {
                    renderTitle(json.map);
                } else {
                    promptUtil.alert({
                        'content': json.message,
                        'type': 'alert'
                    });
                }
            }
        })
    }

    function renderTitle(data) {
        $('[data-role="image"]').html('<img src="/common/image/' + data.imageId + '.htm" width="138" height="137">');
        $('[data-role="drName"]').text(deptName + '普通号');
        $('[data-role="regtAmt"]').text('预约量:' + data.regtAmt);
        $('[data-role="hospName"]').text(hospName);
        $('[data-role="deptName"]').text(deptName);
    }


    function renderSchedule(data) { //TODO主意数据是否是mok数据
        var htmlStr = [];

        $.each(data, function (i, item) {
            htmlStr.push(['<li data-ampmtype="' + item.ampmType + '" data-dateWeekAmPm="' + item.dateWeekAmPm + '" data-date="' + item.outDate + '" data-flag="' + item.timeFlag + '" data-fee="' + item.regfee + '" data-role="' + stateMap[item.outStatus].style + '" class="mar_lr28" data-treatId="' + item.schedualId + '" data-outdate="' + item.outDate + '"><h1>' + item.dateWeekAmPm + '</h1><h2>' + item.numberType + '  ￥' + item.regfee + '元 </h2><a href="javascript:;" class="' + stateMap[item.outStatus].style + '">' + stateMap[item.outStatus].state + '</a></li>'].join(''))
        });
        $('[data-role="list"]').append(htmlStr.join(''));
    }

    function focus() {
        $.ajax({
            url: '/doctor/followOrCancleDoctor.htm',
            type: 'POST',
            data: {
                hospId: hospId,
                doctorId: doctorId,
                isFollow: !+isFollow * 1,
                deptId: deptId
            },
            success: function (json) {
                if (!json.code) {
                    if (+isFollow) {
                        // 已取消
                        isFollow = 0;
                        $('[data-role=focus]').text('关注');
                    } else {
                        // 已关注
                        isFollow = 1;
                        $('[data-role=focus]').text('取消关注');
                    }

                    var newFocusNum = +$('[data-view="focusNumber"]').text() + 1 * [-1, 1][isFollow];
                    $('[data-view="focusNumber"]').text(newFocusNum < 0 ? 0 : newFocusNum);
                } else {
                    promptUtil.alert({
                        'content': json.message,
                        'type': 'alert'
                    });
                }
            }
        })
    }
    //获取详细的时间列表
    function getTiemList() {
        $('[data-role="cancle-doing"]').css('top', document.body.scrollTop + $(window).height() / 3).show();
        $.ajax({
            url: "/order/queryNumberResourcesByType.htm",
            type: "POST",
            data: {
                "hospId": hospId,
                "deptId": deptId,
                "doctorId": doctorId,
                "numberBeginDate": regDate,
                "numberEndDate": regDate,
                "ampmType": ampmType
            },
            success: function (json) {
                if (json.code) {
                    promptUtil.alert({
                        'content': json.message,
                        'type': 'alert'
                    });
                    return false;
                }
                if (!json.code) {
                    var _h = [];

                    _h.push('<h2 class="reg_tips_title">' + dateWeekAmPm + '</h2><ul style="-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);-webkit-overflow-scrolling:touch;overflow-scrolling:touch;">');

                    $.each(json.list, function (idx, item) {
                        jumpHref = jumpHref + "&timeSlot=" +
                            item.timeSlot + "&resourceId=" +
                            item.schedualId + "&numberType=" + item.numberType;
                        confirmHtml = _h.push(
                            '<li class="' + (item.numberRemaNum == 0 ? ' no_order ' : '') + '">',
                            // TODO:: 挂号页面地址写到href中
                            item.numberRemaNum > 0 ? '<a href=' + jumpHref + '>' : '',
                            item.timeSlot + ' ' + ' 剩余:' + item.numberRemaNum,
                            item.numberRemaNum > 0 ? '</a>' : '',
                            '</li>'
                        );
                    });

                    _h.push('</ul><div class="reg_tops_cancle" data-role="cancel"><a href="javascript:;">取消</a></div>');

                    $('#light').html(_h.join(''));
                    $('#light').show().removeClass('none');
                    $('#fade').show().removeClass('none').on('touchmove', function (e) {
                        e.preventDefault();
                    });;
                    _scrollTop = document.body.scrollTop;
                    $("body").addClass("overflow_h").css('position', 'fixed').css('top', _scrollTop * -1);
                    // $("body").addClass("overflow_h");
                    var lightH = $("#light").height();
                    var listL = $("#light").find("li").length;
                    $("#light").css("margin-top", lightH / 2);
                    var winHeight = $(window).height();
                    $("#light").css("margin-top", lightH / 2 * -1);

                    // $("#light").css("margin-top", $('body').scrollTop() + (winHeight - lightH) / 2 - winHeight / 2);
                    if (listL > 5) {
                        $("#light").find("ul").addClass("scroll");
                        $("#light").css("margin-top", "-17rem");
                    }
                }
            },
            complete: function () {
                $('[data-role="cancle-doing"]').hide();
            }
        })
    }

    function isLogin() {
        $.ajax({
            url: '/user/queryUserInfo.htm',
            type: 'POST',
            success: function (json) {
                if (json.code == 1000) {
                    $(document).trigger('loginKit_login');
                    // location.href = "/wechat/html/sys/login/index.html?backto=" + encodeURIComponent(location.href);
                } else if (!json.code) {
                    focus();
                }
            }
        })
    }

    $('body').on('click', '[data-role="cancel"]', function () {
        $('#light').css('display', 'none');
        $('#fade').css('display', 'none');
    });

    $('body').on('click', '[data-role="focus"]', function (e) {
        isLogin();
    });

    $('body').on('click', '[data-role="order_blue_btn"]', function () {
        var timeFlag = $(this).data('flag');
        regtFee = $(this).data('fee');
        regDate = $(this).data('date');
        dateWeekAmPm = $(this).data('dateweekampm');
        outDate = $(this).data('outdate');
        ampmType = $(this).data('ampmtype');
        jumpHref = "/wechat/html/appointment/confirm/?hospId=" + hospId + "&deptId=" + deptId + "&doctorId=" + doctorId + "&date=" + regDate + "&ampmtype=" + ampmType + "&timeStart=" + outDate + "&timeEnd=" + outDate + "&regAmt=" + regtFee + "&hospitaName=" + encodeURIComponent(hospName) + "&departmentName=" + encodeURIComponent(deptName) + "&doctorName=" + encodeURIComponent(doctorName) + "&patientId=" + patientId;
        if (timeFlag == 1) {
            getTiemList();
        } else {
            location.href = jumpHref;
        }

    });

    $('[data-role="cancel"]').on('click', function () {
        $('#light').addClass('none');
        $('#fade').addClass('none');
        $("body").removeClass("overflow_h").removeAttr('style');
        document.body.scrollTop = _scrollTop;
    });

    // $('body').on('click', '[data-timelist]', function() {

    //     location.href = "/wechat/html/appointment/confirm/?doctorTime=" + encodeURIComponent('') + "&doctorData=" + encodeURIComponent('病人') + "&hospitaName=" + hospName + "&departmentName=" + deptName + "&doctorName=" + doctorName + "&departmentAddr=" + encodeURIComponent('滨河西路') + "&costShow=" + regtFee;
    // });

    fetchScheduleData();
    fetchTitleData();
    //renderSchedule();
