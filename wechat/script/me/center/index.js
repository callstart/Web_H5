(function () {
    var patientId = "",
        patientName = '';
    var hasLogin = false;

    function queryLogin() {
        $.ajax({
            url: '/user/queryUserInfo.htm',
            type: 'POST',
            forbidLoginHook: true,
            success: function (json) {
                if (!json.code) {
                    hasLogin = true;
                    patientId = json.map.patientId;
                    patientName = json.map.pName;
                    renderPage(json.map);
                } else if (json.code == 1000) {
                    $('[data-role="noLogin"]').removeClass('none');
                    // $('[data-role="noLogin"]').find('a').attr('href', '/wechat/html/sys/login/?backto=' + location.origin + location.pathname);
                }
            }
        })
    }

    function renderPage(data) {
        $('[data-role="noLogin"]').remove();
        $('[data-role="login"]').removeClass('none');
        $('[data-role="name"]').text(data.pName);
        $('[data-role="phone"]').text(data.phone);
        $('[data-role="loginArrow"]').removeClass('none');
    }

    function bindEvt() {
        // 登陆按钮
        $('[data-role="loginbtn"]').on('tap', function (e) {
            $(document).trigger('loginKit_login', {
                hasClose: true
            });
        });

        $('[data-mine="myCard"]').on('click', function () {
            if (hasLogin) {
                location.href = "/wechat/html/pCard/cardList/?patientId=" + patientId + "&careName=" + encodeURIComponent(patientName);
            } else {
                // location.href = "/wechat/html/sys/login/?backto=" + encodeURIComponent(location.href);

                $(document).trigger('loginKit_login', {
                    hasClose: true
                });
            }
        });

        $('[data-mine="reg"]').on('click', function () {
            if (hasLogin) {
                location.href = "/wechat/html/me/order/list/";
            } else {
                // location.href = "/wechat/html/sys/login/?backto=" + encodeURIComponent(location.href);

                $(document).trigger('loginKit_login', {
                    hasClose: true
                });
            }
        })

        $('[data-mine="myFamilyNum"]').on('click', function () {
            if (hasLogin) {
                location.href = "/wechat/html/family/list/?patientId=" + patientId;
            } else {
                // location.href = "/wechat/html/sys/login/?backto=" + encodeURIComponent(location.href);

                $(document).trigger('loginKit_login', {
                    hasClose: true
                });
            }
        });
        $('[data-mine="myFocus"]').on('click', function () {
            if (hasLogin) {
                location.href = "/wechat/html/me/focus/?patientId=" + patientId;
            } else {
                // location.href = "/wechat/html/sys/login/?backto=" + encodeURIComponent(location.href);

                $(document).trigger('loginKit_login', {
                    hasClose: true
                });
            }
        });
        $('[data-mine="aboutUs"]').on('click', function () {
            location.href = "/wechat/html/aboutus/";
        });

        //查看个人账户
        $('[data-role="login"]').on('click', function () {
            location.href = "/wechat/html/me/index/?patientId=" + patientId;
        })

    }
    queryLogin();
    bindEvt();
})()
