(function () {
    var utility = TaoGu.APP.Utility;
    var PAGE_SIZE = 30,
        INIT_PAGE = 0;
    //选择的是日期还是全部 0代表全部，1代表有选择具体的日期;
    var regtFee, //费用
        regDate, //日期
        ampmType, //午别
        dateWeekAmPm, //当前时间
        doctorName,
        doctorId;
    var jumpStr = "";
    var changeDateType = 0;
    var hospId = utility.Network.queryString('hospId');
    var deptId = utility.Network.queryString('deptId');
    var patientId = utility.Network.queryString('patientId') || '';
    var deptName = utility.Network.queryString('deptName');
    var hospName = utility.Network.queryString('hospName');
    var theDate;
    var paramsMap = {};
    var _scrollTop = 0;
    var ampmMap = {
        '1': '上午',
        '2': '下午',
        '3': '全天',
        '4': '中午',
        '5': '晚上',
        '6': '早上'
    }
    $('[data-role="hospital-title"]').html('<span>' + deptName + '</span>');
    var doctorPage = function () {
        //时间滚动
        var widtdays = $('[data-role="scrollWindow"]').width() / 3;
        var translateScroll = 0;

        var _ = {
            renderDate: function () {
                $.ajax({
                    url: '/hospital/queryMaxDys.htm',
                    type: 'POST',
                    data: {
                        hospId: hospId
                    },
                    success: function (json) {
                        if (!json.date) {
                            var dataList = json.scheduleList;

                            var navDateList = [];
                            _.parseDate(json.sysTime, json.regtMaxDays)

                            $('[data-role="scrollUl"]').width((widtdays + 3) * (json.regtMaxDays + 1));
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            })
                        }

                    }
                })
            },
            renderDoctor: function (data, page) {
                var doctorListHtml = [];
                var btntext = "";
                $.each(data, function (i, d) {
                    //schedual list
                    var timeshadle = [];
                    if (d.schedualInfoDtoList) {
                        $.each(d.schedualInfoDtoList, function (j, e) {
                            paramsMap[j] = e;
                            timeHref = 'deptId=' + deptId + '&doctorId=' + d.drId + '&hospitaName=' + hospName + '&regfee=' + e.regfee + '&patientId= ' + patientId + '&doctorName=' + d.drName + '&doctorTime=' + d.doctorTime + '&departmentName=' + deptName;
                            if (e.outStatus == 0) {
                                btntext = '<a class="fr order_blue_btn" data-drname="' + d.drName + '" data-role="order-doctor" data-role="order_blue_btn" data-flag="' + e.timeFlag + '" data-drId="' + d.drId + '" data-regdate="' + e.outDate + '" data-ampm="' + e.ampmType + '" data-week="' + e.dateWeekAmPm + '" data-fee="' + e.regfee + '">挂号</a>';
                            } else if (e.outStatus == '1') {
                                //TODO::  encodeURIComponent()
                                btntext = '<a class="fr order_stop_btn" data-role="stop-doctor">停诊</a>';
                            } else if (e.outStatus == '2') {
                                btntext = '<a class="fr order_full_btn" data-role="full-doctor">约满</a>';
                            } else {
                                btntext = '<a class="fr order_full_btn" data-role="full-doctor">暂未开放</a>';
                            }
                            timeshadle.push('<p class="' + (i ? '' : 'bor_bl') + '">' + e.dateWeekAmPm + '&nbsp;&nbsp;&nbsp;&nbsp;￥' + e.regfee + '元' + btntext + '</p>')
                        });
                    }
                    doctorListHtml.push([
                        '<div class="my_con ' + (d.statuInfo ? '' : ' my_con_arrow ') + '" data-drId="' + d.drId + '" data-role="doctorPage" data-drtype="' + d.drType + '" data-id="' + i + '">',
                        '<div class="my_con_pic"><img src="/common/image/' + d.imageId + '.htm" width="138" height="137"></div>',
                        '<div class="my_con_text">',
                        '<p class="t_name">' + (d.drName || '') + '<span class="t_name_o">' + (d.drLvlName || '') + '</span>' + (d.statuInfo ? ('<span class="fr ' + (d.statuInfo == '预约' ? ' o_b_b ' : ' o_g_b ') + '">' + (d.statuInfo || '') + '</span>') : '') + '</p>',
                        (function () {
                            if (d.drType == '1') {
                                return '<p class="amount">预约量:' + d.regtAmt + ' | 关注量:' + d.focusAmt + '</p><p class="goodat pad_r24">擅长:' + (d.skill || '暂无') + '</p>';
                            } else {
                                return '<p class="amount">预约量:' + d.regtAmt + '</p>';
                            }
                        })(),
                        /*'<p class="amount">预约量:' + d.regtAmt + ' | 关注量:' + d.focusAmt + '</p>',
                        '<p class="goodat pad_r24">擅长:' + (d.skill || '暂无') + '</p>',*/
                        '</div>',
                        '</div>' + (changeDateType == 1 ? '<div class="date_detail">' + timeshadle.join('') + '</div>' : '')
                    ].join(''))

                    //$('[data-role="doctorList"]').html(doctorListHtml.join(''))
                });
                return doctorListHtml.join('');
            },
            fetechDotor: function (page, callback) {
                $.ajax({
                    url: '/hospital/queryScheduleByDept.htm',
                    type: 'POST',
                    data: {
                        hospId: hospId,
                        deptId: deptId,
                        //date: sendDate,
                        count: PAGE_SIZE,
                        start: page * PAGE_SIZE
                    },
                    success: function (json) {
                        if (!json.code) {
                            $('[data-role="cancle-doing"]').addClass('none');
                            $('[data-role="none"]').css('display', 'none');
                            callback(json.regdeptlist);
                        }
                        if (json.code == '1500') {
                            $('[data-role="none"]').css('display', 'block');
                        }
                        if (json.code && json.code != '1500') {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            })
                        }
                    },
                    complete: function () {
                        $('[data-role="cancle-doing"]').addClass('none');
                    }
                })
            },
            buildList: function () {
                taoguKit.scrollLoad({
                    wrapper: $('[data-role="doctorList"]'),
                    fetchDataFunc: _.fetechDotor,
                    buildDataFunc: _.renderDoctor,
                    pageSize: PAGE_SIZE,
                    currPage: INIT_PAGE
                })
            },
            buildListBySomeDay: function () {
                taoguKit.scrollLoad({
                    wrapper: $('[data-role="doctorList"]'),
                    fetchDataFunc: _.fetechDotorSomeDay,
                    buildDataFunc: _.renderDoctor,
                    pageSize: PAGE_SIZE,
                    currPage: INIT_PAGE
                })
            },
            fetechDotorSomeDay: function (page, callback) {
                $.ajax({
                    url: '/hospital/queryScheduleBySpecDay.htm',
                    type: 'POST',
                    data: {
                        hospId: hospId,
                        deptId: deptId,
                        date: theDate, //2016-06-19
                        count: PAGE_SIZE,
                        start: page * PAGE_SIZE
                    },
                    success: function (json) {
                        if (!json.code) {
                            $('[data-role="cancle-doing"]').addClass('none');
                            if (json.schedualDepList.length) {
                                $('[data-role="none"]').css('display', 'none');
                                callback(json.schedualDepList);
                            } else {
                                $('[data-role="none"]').css('display', 'block');
                            }
                        }
                        if (json.code && json.code != '1500') {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            })
                        }
                    },
                    complete: function () {
                        $('[data-role="cancle-doing"]').addClass('none')
                    }
                })
            },
            renderDoctorTime: function (time, doctorId) {
                //选择一个时间段所剩的号源
                $.ajax({
                    url: '/queryNumberByTime',
                    data: {
                        hospId: hospId,
                        deptId: deptId,
                        doctorName: timeName,
                        userId: null,
                        patientId: patientId,
                        time: time
                    },
                    type: 'POST',
                    success: function (json) {
                        if (!json.code) {

                            var DoctorTimeHtml = [];
                            DoctorTimeHtml.push('<li class="reg_tips_title" data-role="DoctorTimeTitle">' + dateWeekAmPm + '</li>');
                            $.each(json.data.list, function (i, d) {
                                //TODO:: 跳转到挂号确认页面
                                DoctorTimeHtml.push('<li class="' + (d.count ? '' : 'no_order') + '"><a href="/wechat/html/appointment/confirm?' + timeHref + '">' + d.startTime + '   剩余' + d.count + '</a></li>')
                            })

                            DoctorTimeHtml.push('<li data-role="cancleTime" class="reg_tops_cancle"><a>取消</a></li>')

                            $('[data-role="timePromptUl"]').html(DoctorTimeHtml.join(''));
                            $('[data-role="model"]').css({
                                "display": "block"
                            })
                            $('[data-role="timePrompt"]').css({
                                "display": "block"
                            })
                        } else {
                            // TaoGu.APP.Utility.Network.relocate("/wechat/html/sys/login/?backto=" + encodeURIComponent(location.href));
                        }

                    }
                })
            },
            prevScroll: function () {

                var widtdaysWidthUl = widtdays * $('[data-role="daysShow"]').length;


                if (translateScroll > 0) {

                    $('[data-role="prevBtn"]').addClass('active');
                    // $('[data-role="nextBtn"]').removeClass('active');
                    $('[data-role="nextBtn"]').addClass('active');

                    translateScroll = translateScroll - widtdays * 3 - 3;
                    if (translateScroll <= 0) {
                        $('[data-role="prevBtn"]').removeClass('active');
                        $('[data-role="nextBtn"]').addClass('active');
                    }
                    $('[data-role="scrollUl"]').css({
                        '-webkit-transition-duration': '0.5s',
                        "-webkit-transform": 'translateX(' + (-translateScroll) + 'px)'
                    })
                } else {
                    $('[data-role="prevBtn"]').removeClass('active');
                    $('[data-role="nextBtn"]').addClass('active');
                }
            },
            nextScroll: function () {

                var widtdaysWidthUl = widtdays * ($('[data-role="daysShow"]').length - 1);

                if (widtdaysWidthUl - widtdays * 3 > translateScroll) {
                    // $('[data-role="prevBtn"]').removeClass('active');
                    $('[data-role="prevBtn"]').addClass('active');
                    $('[data-role="nextBtn"]').addClass('active');


                    translateScroll = translateScroll + widtdays * 3 + 3;
                    if (widtdaysWidthUl - widtdays * 3 <= translateScroll) {
                        $('[data-role="prevBtn"]').addClass('active');
                        $('[data-role="nextBtn"]').removeClass('active');
                    }
                    $('[data-role="scrollUl"]').css({
                        '-webkit-transition-duration': '0.5s',
                        "-webkit-transform": 'translateX(' + -translateScroll + 'px)'
                    });
                } else {
                    $('[data-role="prevBtn"]').addClass('active');
                    $('[data-role="nextBtn"]').removeClass('active');
                }
            },
            parseDate: function (time, maxDays) {
                var rollerStr = "";
                var rollerDate;
                var weekMap = {
                    '1': '星期一',
                    '2': '星期二',
                    '3': '星期三',
                    '4': '星期四',
                    '5': '星期五',
                    '6': '星期六',
                    '0': '星期日'
                }
                for (i = 0; i <= maxDays; i++) {
                    currTime = new Date(time * 1);
                    rollerDate = currTime.getFullYear() + '-' + (currTime.getMonth() + 1) + '-' + currTime.getDate();
                    rollerStr += '<li data-role="daysShow" style="width:' + widtdays + 'px" data-date="' + rollerDate + '">' + (i == 0 ? '今天' : weekMap[currTime.getDay()]) + '<span>' + ((currTime.getMonth() + 1) > 10 ? (currTime.getMonth() + 1) : '0' + (currTime.getMonth() + 1)) + '-' + (currTime.getDate() > 9 ? currTime.getDate() : '0' + currTime.getDate()) + '</span></li>'
                    time = 1 * 24 * 60 * 60 * 1000 + time * 1;
                }
                if (maxDays <= 2) {
                    $('[data-role="prevBtn"]').removeClass('active');
                    $('[data-role="nextBtn"]').removeClass('active');
                }
                $('[data-role="scrollUl"]').append(rollerStr);
            },
            //获取详细的时间列表
            getTiemList: function () {
                $('[data-role="timePrompt"]').html(' ');
                $('[data-role="cancle-doing"]').removeClass('none')
                    // $('#fade').css('height', $(window).height() + 'px');
                    // $('#fade').css('top', $('body').height + 'px');

                //$('#fade').css('display', 'block');
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
                        if (!json.code) {
                            var _h = [];
                            _h.push('<h2 class="reg_tips_title">' + dateWeekAmPm + '</h2><ul class="' + (json.list.length > 5 ? 'scroll' : '') + '">');

                            //TDDO::这里使用了mok数据
                            $.each(json.list, function (idx, item) {
                                var hrefStr = '';
                                hrefStr = jumpStr + "&timeSlot=" +
                                    item.timeSlot + "&resourceId=" +
                                    item.schedualId + '&numberType=' + item.numberType;
                                _h.push(
                                    '<li class="' + (item.numberRemaNum == 0 ? 'no_order' : '') + '">',
                                    // TODO:: 挂号页面地址写到href中
                                    item.numberRemaNum > 0 ? '<a href="' + hrefStr + '">' : '',
                                    item.timeSlot + ' ' + '剩余' + item.numberRemaNum,
                                    item.numberRemaNum > 0 ? '</a>' : '',
                                    '</li>'
                                );
                            });
                            _h.push('</ul><div class="reg_tops_cancle" data-role="cancel"><a href="javascript:;">取消</a></div>');
                            var winHeight = $(window).height();
                            $('#fade').css({
                                'display': 'block',
                                //  'height': winHeight + "px"
                            }).on('touchmove', function (e) {
                                e.preventDefault();
                            })

                            $('#light').html(_h.join(''));
                            $('#light').show();
                            _scrollTop = document.body.scrollTop;
                            $("body").addClass("overflow_h").css('position', 'fixed').css('top', _scrollTop * -1);
                            //$("body").addClass("overflow_h");
                            // alert(winHeight)
                            var lightH = $("#light").height();
                            var listL = $("#light").find("li").length;
                            //$("#light").css("margin-top", -lightH / 2);

                            $("#light").css("margin-top", -lightH / 2);
                            if (listL > 5) {
                                $("#light").css("margin-top", "-17rem");
                            }
                        } else {
                            json.code && promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }
                    },
                    error: function () {
                        //alert('error');
                    },
                    complete: function () {
                        $('[data-role="cancle-doing"]').addClass('none');
                    }
                })
            }
        }
        return {
            init: function () {
                _.renderDate();
                _.buildList();
                this.bindEve();
            },
            bindEve: function () {
                $('[data-role="prevBtn"]').on('tap', function () {
                    _.prevScroll()
                })

                $('[data-role="nextBtn"]').on('tap', function () {
                    _.nextScroll()
                })

                $('body').on('tap', '[data-role="daysShow"]', function () {

                    //if it's active ,do nothing
                    if ($(this).hasClass('active')) {
                        return false;
                    }
                    $('[data-role="cancle-doing"]').removeClass('none');
                    //clear the content for render list
                    $('[data-role="doctorList"]').html('');
                    //repaint list
                    if ($(this).attr('data-all')) {
                        changeDateType = 0;
                        _.buildList();
                    } else {
                        changeDateType = 1;
                        theDate = $(this).data('date');
                        _.buildListBySomeDay();
                    }

                    $('[data-role="navChange"]').find('[data-role="daysShow"]').removeClass("active");
                    $(this).addClass("active")
                })

                $('body').on('tap', '[data-role="doctorPage"]', function (e) {
                    var paramStr = "";
                    // 0是普通号 1是医生
                    if ($(this).data('drtype') == 1) {
                        TaoGu.APP.Utility.Network.relocate("/wechat/html/doctor/home/?deptId=" + deptId + '&doctorId=' + $(this).attr('data-drId') + '&patientId=' + patientId + '&hospId=' + hospId + '&hospName=' + encodeURIComponent(hospName) + '&deptName=' + encodeURIComponent(deptName));
                    } else {
                        // var length = Object.keys(paramsMap).length;
                        // var paramsObj = paramsMap[$(this).data('id')];
                        // paramStr = "deptId=" + paramsObj.deptId + "&deptName=" + encodeURIComponent(paramsObj.deptName) + "&drId=" + paramsObj.drId + "&drLvlId=" + paramsObj.drLvlId + "&drLvlName=" + paramsObj.drLvlName + "&drName=" + encodeURIComponent(paramsObj.drName) + "&drType=" + paramsObj.drType + "&focusAmt=" + paramsObj.focusAmt + "&hospId=" + paramsObj.hospId + "&hospName=" + paramsObj.hospName + "&imageId=" + paramsObj.imageId + "&regStatus=" + paramsObj.regStatus + "&regtAmt=" + paramsObj.regtAmt + "&regtSrcId=" + paramsObj.regtSrcId + "&skill=" + paramsObj.skill;
                        paramStr = "hospId=" + hospId + '&deptId=' + deptId + '&doctorId=' + $(this).attr('data-drId') + '&patientId=' + patientId + '&hospName=' + encodeURIComponent(hospName) + '&deptName=' + encodeURIComponent(deptName) + '&patientId' + patientId
                        TaoGu.APP.Utility.Network.relocate('/wechat/html/hospital/office/home/index.html?' + paramStr);
                    }
                });

                $('[data-role="doctorList"]').on('click', '[data-role="order-doctor"]', function () {
                    var mapId = $(this).data('id');
                    var timeFlag = $(this).data('flag');
                    doctorName = $(this).data('drname');
                    doctorId = $(this).data('drid');
                    regDate = $(this).data('regdate');
                    ampmType = $(this).data('ampm');
                    dateWeekAmPm = $(this).data('week');
                    regtFee = $(this).data('fee');
                    //regDate = paramsMap[mapId].outDate;
                    // ampmType = paramsMap[mapId].ampmType;
                    // dateWeekAmPm = paramsMap[mapId].dateWeekAmPm;
                    // var outDate = paramsMap[mapId].outDate;
                    // var regtFee = paramsMap[mapId].regfee;
                    // var feeUnit = paramsMap[mapId].feeUnit;
                    jumpStr = "/wechat/html/appointment/confirm/?hospId=" + hospId + "&deptId=" + deptId + "&doctorId=" + doctorId + "&date=" + regDate + "&ampmtype=" + ampmType + "&regAmt=" + regtFee + "&hospitaName=" + encodeURIComponent(hospName) + "&departmentName=" + encodeURIComponent(deptName) + "&doctorName=" + encodeURIComponent(doctorName);
                    if (timeFlag) {
                        _.getTiemList();
                    }
                });

                $('[data-role="timePromptUl"]').on('tap', '[data-role="cancleTime"]', function () {
                    $('[data-role="model"]').css({
                        "display": "none"
                    })
                    $('[data-role="timePrompt"]').css({
                        "display": "none"
                    })

                });
                $('body').on('tap', '[data-role="cancel"]', function () {
                    $('#light').css('display', 'none');
                    $('#fade').css('display', 'none');
                    $("body").removeClass("overflow_h").removeAttr('style');
                    document.body.scrollTop = _scrollTop;
                });
            }
        }
    }
    doctorPage().init();
})()
