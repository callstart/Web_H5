(function () {

    var utility = TaoGu.APP.Utility;
    var network = utility.Network;
    var storage = utility.Storage;

    // 微信授权页面返回的字段， 用于获取openid
    var CODE = network.queryString('code') || '';

    var loginUtil = {};

    loginUtil.setUserId = function (v) {
        storage.set('wechat-userid', v);
    }

    loginUtil.getUserId = function () {
        return storage.get('wechat-userid') || '';
    }

    loginUtil.setWxOpenId = function (v) {
        storage.set('wechat-openid', v);
    }

    loginUtil.getWxOpenId = function () {
        return storage.get('wechat-openid') || '';
    }

    loginUtil.checkCode = function (resolve, reject) {
        var me = this;

        // 微信授权后入口页面
        if (CODE.length && !window.forbidAutoGetOpenId) {
            $.ajax({
                url: '/common/findOpenId.htm',
                type: 'POST',
                data: {
                    "code": CODE
                },
                forbidLoginHook: true,
                success: function (openid) {
                    if (openid && typeof openid == 'string') {
                        me.setWxOpenId(openid);
                    }
                },
                complete: function () {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    }

    loginUtil.wxConfRegister = function (apilist) {
        var p = new Promise(function (resolve, reject) {
            // 获取appId， timestamp， nonceStr， signature
            $.ajax({
                url: '/common/getJsSign.htm',
                type: 'POST',
                data: {
                    url: location.href.split('#')[0]
                },
                success: function (json) {
                    if (!json.code) {
                        resolve(json)
                    } else {
                        // reject(json.message);
                    }
                },
                error: function () {
                    reject(null);
                }
            })
        });

        p.then(function (json) {
            wx && wx.config({
                debug: false,
                appId: json.appId, // 必填，公众号的唯一标识
                timestamp: json.timestamp, // 必填，生成签名的时间戳
                nonceStr: json.noncestr, // 必填，生成签名的随机串
                signature: json.signature, // 必填，签名，见附录1
                jsApiList: apilist // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        }, function (str) {
            promptUtil.alert({
                'content': str || '获取微信JS注册信息失败！',
                'type': 'alert'
            })
        })
    }

    // 为了保证有code页面换取openid的顺序在业务逻辑之前，
    // 每个业务页面的初始化执行都要套用该方法
    loginUtil.bizStartPage = function (startFn) {
        if (!loginUtil.hasStarted) {
            $(document).on('bizStartPage', startFn);
        } else {
            startFn();
        }
    }

    var ps = new Promise(function (resolve, reject) {
        loginUtil.checkCode(resolve, reject);
    });

    ps.then(function () {
        $(document).trigger('bizStartPage');
        loginUtil.hasStarted = true;
    });

    window.loginUtil = (!window.loginUtil && window.loginUtil == undefined) ? loginUtil : window.loginUtil;

})()
