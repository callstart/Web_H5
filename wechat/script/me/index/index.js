/**
 * 我的个人账户
 */
// 注册微信JSAPI
loginUtil.wxConfRegister(['closeWindow']);

var page = (function() {
    var utility = TaoGu.APP.Utility;

    var _ = {
        fetchData: function() {
            $.ajax({
                url: '/user/queryUserInfo.htm',
                type: 'POST',
                data: {},
                success: function(json) {
                    if (!json.code) {
                        this.renderData(json);
                    } else {
                        promptUtil.alert({
                            'content': json.message,
                            'type': 'alert'
                        });
                    }
                }.bind(this)
            })
        },
        renderData: function(obj) {
            var obj = obj.map;
            $('[data-role="pName"]').text(obj.pName);

            $('[data-role="pGendId"]').text(obj.pGendId);

            $('[data-role="pCertNo"]').text(obj.pCertNo);

            $('[data-role="phone"]').text(obj.phone);
            // .attr('href', '/wechat/html/me/mobile/change/?mobile=' + encodeURIComponent(obj.phone) + '&go=' + encodeURIComponent(location.href));

            $('[data-role="pAddr"]')
                .text(obj.pAddr)
                .attr('href', '/wechat/html/me/addr/?addr=' + encodeURIComponent(obj.pAddr) + '&backto=' + encodeURIComponent(location.href));

            $('[data-role="miCardNo"]')
                .text(obj.siCardNo || '未绑定')
                .attr('href', '/wechat/html/me/miCard/' + (obj.siCardNo ? 'unbind' : 'bind') + '/?micard=' + encodeURIComponent(obj.siCardNo) + '&patientId=' + obj.patientId + '&backto=' + encodeURIComponent(location.href));
        },
        bindEvt: function() {
            $('[data-role="logout"]').on('click', function(e) {
                $('[data-role="mask"]').show();
                $('[data-role="logoutPanel"]').show();
            });

            $('[data-role="cancel"]').on('click', function(e) {
                $('[data-role="mask"]').hide();
                $('[data-role="logoutPanel"]').hide();
            });

            $('[data-role="confirm"]').on('click', function(e) {
                if (this.lock) {
                    return false;
                }
                this.lock = true;
                $.ajax({
                    url: '/security/logout.htm',
                    type: 'POST',
                    data: {},
                    success: function(json) {
                        if (json.code) {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                            return false;
                        }

                        // $('[data-role="mask"]').hide();
                        // $('[data-role="logoutPanel"]').hide();

                        wx && wx.closeWindow();
                    },
                    complete: function() {
                        this.lock = false;
                    }
                })
            }.bind(this));
        }
    }

    return {
        init: function() {
            _.fetchData();
            _.bindEvt();
        }
    }
})();

page.init();
