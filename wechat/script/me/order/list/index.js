/**
 * 订单列表
 */

var page = (function() {
    var PAGE_SIZE = 30,
        INIT_PAGE = 0;
    var cancleOrderLock = true;
    var doSubmitLock = true;
    var _regtId = '';
    var personLock = false;
    var sysTime = 0; //获取系统当前的时间
    var numIndex = 0;
    var _ = {
        patientId: '',
        limits: {
            area: '',
            rules: {}
        },
        saleCountDown: function(payLockTime, index) {
            if (!payLockTime || payLockTime <= 0) {
                return false;
            }
            var timers = null;
            var payLockTime = payLockTime;
            console.log(payLockTime);
            timers = setInterval(function() {
                payLockTime = payLockTime - 1000;
                if (payLockTime <= 0) {
                    $('[data-role="order-detial"]').eq(index).find('[data-role="gopay"]').hide();
                    $('[data-role="order-detial"]').eq(index).find('[data-role="cancel"]').hide();
                    $('[data-role="order-detial"]').find('[data-role="RegtCloseFlagName"]').text('预约失败')
                }

            }, 1000);

        },
        patientList: function() {
            $.ajax({
                url: "/booking/queryMedicalMember.htm",
                type: 'POST',
                data: {},
                success: function(json) {
                    if (!json.code) {
                        this.render(json.list)
                        personLock = false;
                    } else if (json.code == 1500) {
                        this.render([]);
                        personLock = true;
                        $('[data-role="noOrders"]').html(['<div class="no_result">',
                            '<img src="/wechat/images/no_screen.png" alt="您未通过本微信端进行过网络预约挂号" />',
                            '</div>',
                            '<div class="no_result_p">您未通过本微信端进行过网络预约挂号</div>'
                        ].join('')).show();
                    } else {
                        $('[data-role="noOrders"]').html(['<div class="no_result">',
                            '<img src="/wechat/images/no_screen.png" alt="您未通过本微信端进行过网络预约挂号" />',
                            '</div>',
                            '<div class="no_result_p">您未通过本微信端进行过网络预约挂号</div>'
                        ].join('')).show();
                    }
                }.bind(this)
            })
        },
        renderQuery: function() {
            $.ajax({
                url: "/data/queryDictList.htm",
                type: 'POST',
                data: {},
                success: function(json) {
                    if (!json.code) {
                        var dictTypeNamePay = [];
                        var dictTypeNameDoctor = [];
                        $.each(json.list, function(i, d) {
                            if (d.dictTypeId == "PAY_FLAG_ID") {
                                dictTypeNamePay.push('<a href="javascript:;" data-id="' + d.dictId + '">' + d.dispName + '</a>')
                            } else {
                                dictTypeNameDoctor.push('<a href="javascript:;" data-id="' + d.dictId + '">' + d.dispName + '</a>')
                            }
                        })
                        $('[data-role="wage"]').html([
                            '<li style="height:auto;background:#fff;overflow:hidden;">',
                            '<p>预约状态</p>',
                            '<p class="level" data-role="rules" data-dom="d1">',
                            '<a id="d1" href="javascript:;" class="current" data-role="currentLevel">不限</a>' + dictTypeNameDoctor.join(''),
                            '<p>支付状态</p>',
                            '<p class="pad-b30 cata" data-role="rules" data-dom="d2">',
                            '<a id="d2" data-role="currentPad" href="javascript:;" class="current">不限</a>' + dictTypeNamePay.join(''),
                            '</p>',
                            '<div class="popup-btn"><span class="cz-btn" style="float:left"><a id="reset" href="javascript:;" data-role="reset">重置</a></span><span class="wc-btn" style="float:right;"><a id="finish" href="javascript:;" data-role="finish">完成</a></span></div>',
                            '</li>'

                        ].join(''))
                    } else {
                        $('[data-role="noOrders"]').html(['<div class="no_result">',
                            '<img src="/wechat/images/no_screen.png" alt="您未通过本微信端进行过网络预约挂号" />',
                            '</div>',
                            '<div class="no_result_p">您未通过本微信端进行过网络预约挂号</div>'
                        ].join('')).show();
                    }
                }
            })
        },
        render: function(list) {

            //$(['[data-role="noOrders"]', '[data-role="hasOrders"]'][!!list.length * 1]).removeAttr('style');

            if (list.length) {
                $('[data-role="mask"]').css('height', document.documentElement.clientHeight);
                this.buildLimit(list);
                this.buildList();
            }
        },
        fetchData: function(page, callback) {
            var dataAgm = {
                count: PAGE_SIZE,
                start: page * PAGE_SIZE
            };

            _.limits.area ? (dataAgm.tmPId = _.limits.area) : '';
            _.limits['rules'].d1 ? (dataAgm.regtStatId = _.limits['rules'].d1) : '';
            _.limits['rules'].d2 ? (dataAgm.payStatId = _.limits['rules'].d2) : '';

            $.ajax({
                url: '/order/queryRecordList.htm',
                type: 'POST',
                data: dataAgm,
                success: function(json) {
                    if (!json.code) {
                        sysTime = json.sysTime;
                        callback(json.list);
                        $('[data-role="hasOrders"]').show();
                        $('[data-role="noOrders"]').hide();
                    }
                    if (json.code == 1500) {
                        if (dataAgm.tmPId || dataAgm.regtStatId || dataAgm.payStatId) {
                            $('[data-role="hasOrders"]').show();
                        }
                        $('[data-role="noOrders"]').html(['<div class="no_result">',
                            '<img src="/wechat/images/no_screen.png" alt="您未通过本微信端进行过网络预约挂号" />',
                            '</div>',
                            '<div class="no_result_p">' + ((dataAgm.tmPId || dataAgm.payStatId || dataAgm.regtStatId) ? '无筛选结果' : '您未通过本微信端进行过网络预约挂号') + '</div>'
                        ].join('')).show();
                    }
                }
            })
        },
        orderCancel: function(regtOrdId) {
            if (!cancleOrderLock) {
                return false;
            }
            cancleOrderLock = false;

            $('[data-role="cancle-doing"]').removeClass('none');
            $.ajax({
                url: '/order/cancleOrder.htm',
                type: 'POST',
                data: {
                    'regtOrdId': regtOrdId
                },
                success: function(json) {
                    if (!json.code) {
                        $('[data-role="cancle-doing"]').addClass('none');
                        $('[data-role="cancle-over"]').removeClass('none');
                        setTimeout(function() {
                            $('[data-role="cancle-over"]').addClass('none');
                        }, 3000)
                        location.reload();
                    } else {
                        promptUtil.alert({
                            'content': json.message,
                            'type': 'alert'
                        });

                    }
                },
                complete: function() {
                    $('[data-role="cancle-doing"]').addClass('none');
                    cancleOrderLock = false;
                }
            })
        },
        buildDataFunc: function(list, page) {

            var _h = [],
                i = 0;

            numIndex = 0;

            $.each(list, function(i, el) {

                var payLockTime = el.payLockLongTime - sysTime;
                _h.push([
                    '<li data-role="order-detial" data-regtOrdId="' + el.regtOrdId + '" data-href="regtOrdId=' + el.regtOrdId + '&doSubmit=' + encodeURIComponent(el.doSubmit) + '&cancleOrder=' + encodeURIComponent(el.cancleOrder) + '&deptName=' + encodeURIComponent(el.deptName) +
                    '">',
                    '<h2>' + el.hospName + '</h2>',
                    '<div class="state" data-role="RegtCloseFlagName">' + (el.dispName || '') + '</div>' + (function() {
                        if (el.RegtCloseFlagName) {
                            return '<div class="state">' + (el.RegtCloseFlagName || '') + '</div>';
                        } else {
                            return '';
                        }
                    })(),
                    '<h3>' + (function() {
                        // el.deptName + '<span>|</span>' + el.drLvlId + '<span>|</span>' + el.drName
                        var doctorInfo = [];
                        el.deptName && doctorInfo.push(el.deptName)
                        el.drLvlId && doctorInfo.push(el.drLvlId)
                        el.drName && doctorInfo.push(el.drName)

                        return doctorInfo.join('<span>|</span>');
                    })() + '</h3>',
                    '<dl>',
                    '<dd>预约就诊时间：' + (el.regtDate.substr(0, 4) + '-' + el.regtDate.substr(4, 2) + '-' + el.regtDate.substr(6, 2)) + ' ' + el.regtTimeStart + '</dd>',
                    //'<dd>倒计时：'++'</dd>',
                    '<dd>就诊人：' + (el.pName || '') + '</dd>',
                    '<dd class="' + (el.fullName ? '' : 'none') + '">支付状态：' + el.fullName + '<span>￥' + (el.regtAmt || '') + '元</span></dd>',
                    '</dl>',
                    '<div class="ordered_register_bottom">',
                    // 跳转医生主页
                    '<input type="button" value="再次预约" class="again" data-drType="' + el.drType + '" data-role="again" data-href="doctorId=' + el.drId + '&deptId=' + el.deptId + '&hospId=' + el.hospId + '&deptName=' + encodeURIComponent(el.deptName) + '"/>',
                    (function() {
                        var inputHtml = [];
                        if (el.cancleOrder && el.regtStatId != 9) {
                            // if (true) {
                            // TODO:: 跳转预约挂号详情
                            inputHtml.push('<input type="button" value="取消订单" class="cancel" data-role="cancel" />');
                        }
                        if (el.doSubmit && el.regtStatId != 9) {
                            //if (true) {
                            // TODO:: 跳转预约挂号详情 - 立即支付
                            inputHtml.push('<input type="button" value="立即支付" class="payment" data-role="gopay" />');
                        }
                        // })() + '</h3>',
                        return inputHtml.join('');
                    })(),
                    '</div>',
                    '</li>'
                ].join(''));


                _.saleCountDown(payLockTime, numIndex);

                ++numIndex;
            })

            return _h.join('');
        },

        buildLimit: function(list) {
            var _h = ['<li class="current-correct">全部</li>'];
            $.each(list, function(i, el) {
                _h.push('<li data-v="' + el.tmPId + '">' + el.pName + '</li>')
            });
            $('[data-role="area"]').html(_h.join(''));
        },
        buildList: function() {
            $('[data-role="list"]').empty();
            taoguKit.scrollLoad({
                wrapper: $('[data-role="list"]'),
                fetchDataFunc: this.fetchData,
                buildDataFunc: this.buildDataFunc,
                pageSize: PAGE_SIZE,
                currPage: INIT_PAGE
            })
        },
        bindEvt: function() {
            $('[data-role="limit"]').on('click', function(e) {
                if ($(this).data('view') == "limitArea" && personLock) {
                    return false;
                }
                $(e.target).toggleClass('up');
                if ($(e.target).hasClass('up')) {
                    $('[data-screen="screen"]').hide();
                    $('[data-role="mask"]').show();
                    $(e.target).siblings().removeClass('up');
                    $('[data-role="' + $(e.target).attr('id') + '"]').show().siblings().hide();
                } else {
                    $('[data-view="cont"]').hide();
                    $('[data-role="mask"]').hide();
                }
            });


            // 就诊人选择
            var lastArea;
            $('[data-role="area"]').on('tap', function(e) {
                lastArea = lastArea || $('[data-role="area"]>li').first();
                lastArea.removeClass('current-correct');
                $('#area').text($(e.target).text());
                this.limits.area = $(e.target).addClass('current-correct').data('v') || '';
                $('[data-role="limit"]').eq(0).toggleClass('up');
                lastArea = $(e.target);

                $('[data-role="area"]').hide();
                $('[data-role="mask"]').hide();
                this.buildList();
            }.bind(this));


            // 筛选条件
            $('[data-role="wage"]').on('click', 'a', function(e) {
                $(e.target).addClass('current').siblings().removeClass('current');
                this.limits['rules'][$(e.target).closest('[data-role="rules"]').data('dom')] = $(e.target).attr('data-id');
            }.bind(this));


            // 重置
            $('[data-role="wage"]').on('click', '[data-role="reset"]', function(e) {
                $('[data-role="rules"] a').removeClass('current')
                $('[data-role="currentLevel"]').addClass('current');
                $('[data-role="currentPad"]').addClass('current');
                this.limits['rules'] = {};
            }.bind(this));
            // 完成
            $('[data-role="wage"]').on('click', '[data-role="finish"]', function(e) {
                $('[data-role="wage"]').hide();
                $('[data-role="mask"]').hide();
                $('#wage').removeClass('up');
                this.buildList();
            }.bind(this));


            $('[data-role="list"]').on('click', '[data-role="order-detial"]', function(e) {
                _regtId = $(this).attr('data-regtOrdId')
                if ($(e.target).closest('[data-role="again"]').length) {
                    // 跳转医生主页
                    if ($(e.target).data('drType') == 0) {
                        location.href = "/wechat/html/doctor/home/?" + $(e.target).data('href');
                        return false;
                    } else {
                        location.href = "/wechat/html/doctor/home/?" + $(e.target).data('href');
                        return false;
                    }

                }

                if ($(e.target).closest('[data-role="cancel"]').length) {
                    // TODO:: 取消订单
                    $('[data-role="cancle_popup"]').removeClass('none');
                    $('#fade').show();
                    //  _.orderCancel(_regtId, $(this))
                    return false;
                }
                if ($(e.target).closest('[data-role="gopay"]').length) {
                    if (!doSubmitLock) {
                        return false;
                    }

                    doSubmitLock = false;
                    $.ajax({
                        url: '/order/pay.htm',
                        type: 'POST',
                        data: {
                            regtOrdId: _regtId
                        },
                        success: function(json) {
                            if (!json.code) {
                                location.href = json.returnUrl;
                            } else {
                                promptUtil.alert({
                                    'content': json.message,
                                    'type': 'alert'
                                });

                            }
                        },
                        complete: function() {
                            doSubmitLock = true;
                        }
                    })
                    return false;
                }

                location.href = "/wechat/html/me/order/detail/?regtOrdId=" + _regtId;
            })


            //是否取消订单
            $('[data-role="sureBtn"]').on('tap', function() {
                $('[data-role="cancle_popup"]').addClass('none');
                $('#fade').hide();
                _.orderCancel(_regtId)
            })


            $('[data-role="cancerBtn"]').on('click', function() {
                $('[data-role="cancle_popup"]').addClass('none');
                $('#fade').hide();
            })

        }

    }

    return {
        init: function() {
            _.patientList();
            _.bindEvt();
            _.renderQuery();
        }
    }
})();

page.init();
