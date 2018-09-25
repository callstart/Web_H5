// login panel
var loginPanel = {
    // 初始化调用
    "init": function () {
        $(document).bind('loginKit_login', function (e, params) {
            params = params || {};
            this.compose(params);
        }.bind(this));
    },

    "compose": function (p) {
        var tel = p.tel || null,
            hasClose = p.hasClose || false;

        if (this.loaded) {
            this.$err.empty();
            this.$fade.css('display', 'block');
            this.$top.css('display', 'block');
            this.$tel.val(tel || '');
            this.$pw.val('');
            return false;
        }

        $('body').append(this.htmlBuilder(hasClose));

        setTimeout(function () {
            this.bindEvt(p);
        }.bind(this), 300);

        this.loaded = true;
    },

    "htmlBuilder": function (hasClose) {
        var b = $('body').get(0);
        var h = [
            '<div id="loginKitPop" class="login_popup" style="display:block;">',
            '<h1>登录',
            hasClose ? '<i><img src="/wechat/images/close.png" class="close_icon" data-login="close"></i>' : '',
            '</h1>',
            '<ul class="inp_list_n">',
            '<li>',
            '<input type="text" data-login="tel" placeholder="请输入注册时的手机号" value="" />',
            '</li>',
            '<li>',
            '<input type="password" data-login="pw" placeholder="请输入注册时设置的密码" value="" />',
            '</li>',
            '</ul>',
            '<div class="forget_password_n"><a data-login="forgot" href="/wechat/html/sys/forgot/">忘记密码？</a></div>',
            '<div data-login="err" style="text-align:center;color:#f00;height:1em;"></div>',
            '<section class="but_div2_n">',
            '<input type="button" value="登录" data-login="btn" class="disabled" disabled />',
            '</section>',
            '<div class="go_register_n">还没有账户，<a href="/wechat/html/sys/reg/" data-login="reg">立即注册</a></div>',
            '</div>',
            // 就诊人选择
            '<div data-login="patients" class="pop_patients" style="z-index:3000;display:none;">',
            '<h2>选择就诊人</h2>',
            '<ul data-login="patientlist"></ul>',
            '</div>',
            '<div id="loginKitFade" class="black_overlay" style="display:block;"></div>'
        ];
        return h.join('');
    },

    // 绑定点击事件
    "bindEvt": function (p) {
        var tel = p.tel || null,
            hasClose = p.hasClose || false;

        this.$top = $('#loginKitPop');
        this.$fade = $('#loginKitFade');

        // 就诊人选择
        this.$patients = $('[data-login="patients"]');

        this.$tel = $('[data-login="tel"]', this.$top);
        this.$pw = $('[data-login="pw"]', this.$top);
        this.$forgot = $('[data-login="forgot"]', this.$top);
        this.$btn = $('[data-login="btn"]', this.$top);
        this.$reg = $('[data-login="reg"]', this.$top);
        this.$close = $('[data-login="close"]', this.$top);
        this.$err = $('[data-login="err"]', this.$top).empty();

        this.$tel.val(tel || '');
        this.$pw.val('');
        this.$forgot.attr('href', this.$forgot.attr('href') + '?backto=' + encodeURIComponent(location.href));
        this.$reg.attr('href', this.$reg.attr('href') + '?backto=' + encodeURIComponent(location.href));

        this.$fade.on('touchmove', function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        })

        // 登陆检查及提交
        this.$btn.on('tap', function (e) {
            this.$err.empty();

            var errmsg = '';
            var telnumVal = $.trim(this.$tel.val());
            var pwdVal = $.trim(this.$pw.val());

            if (!errmsg && !taoguKit.valid.mobile(telnumVal)) {
                errmsg = '请输入正确的手机号码';
            }

            if (!errmsg && !taoguKit.valid.passwordFormat(pwdVal)) {
                errmsg = '请输入正确的密码';
            }

            if (errmsg) {
                // 提示信息
                this.$err.text(errmsg);
                // this.$notice.text(errmsg).addClass('stock');
                return false;
            }

            // 提交
            this.subForm({
                "phoneNo": telnumVal,
                "password": window.MD5(pwdVal)
            });
        }.bind(this));

        //点击选择就诊人
        this.$patients.on('click', '[data-login="pNameList"]', function (e) {
            var pid = $(e.target).data('id');
            var pname = $(e.target).data('name');
            if (!pid) {
                return false;
            }
            // 接口种session
            $.ajax({
                url: "/security/savePatientId.htm",
                type: "POST",
                data: {
                    "patientId": pid
                },
                success: function (json) {},
                complete: function () {
                    location.reload(true);
                }
            });
        });

        // 关闭弹窗
        this.$close.on('click', function (e) {
            setTimeout(function () {
                this.$top.css('display', 'none');
                this.$fade.css('display', 'none');
            }.bind(this), 500)
        }.bind(this))

        // 校验输入信息
        this.$tel.add(this.$pw).on('input', function (e) {
            this.$err.empty();

            var tel = $.trim(this.$tel.val()),
                pw = $.trim(this.$pw.val());

            if (tel.length && pw.length) {
                this.$btn.removeClass('disabled').removeAttr('disabled');
            } else {
                this.$btn.addClass('disabled').attr('disabled', true);
            }
        }.bind(this));
    },

    // 提交登陆
    "subForm": function (valObj) {
        if (this.lockSubmit) {
            return false;
        }

        this.lockSubmit = true;

        $.ajax({
            url: '/security/login.htm',
            type: 'POST',
            data: valObj,
            "forbidLoginHook": true,
            "success": function (json) {
                if (!json.code) {
                    this.$top.css('display', 'none');

                    setTimeout(function () {
                        this.fetchPatientList();
                    }.bind(this), 500)
                } else {
                    // 弹窗上进行错误提示
                    this.$err.text(json.message);
                    // this.$fade.css('display', 'none');
                    // promptUtil.alert({
                    //     'content': json.message,
                    //     'type': 'alert'
                    // });
                }
            }.bind(this),
            "complete": function () {
                this.lockSubmit = false;
            }.bind(this)

        })
    },
    // 渲染就诊人列表
    renderPatientList: function (data) {
        var htmlStr = '';
        $.each(data, function (i, item) {
            htmlStr += "<li data-login='pNameList' data-id='" + item.tmPId + "' data-name=" + item.pName + ">" + item.pName + "</li>";
        });
        $('[data-login="patientlist"]').html(htmlStr);
    },
    // 获取就诊人列表
    fetchPatientList: function () {
        $.ajax({
            url: '/familyMember/queryMyMembers.htm',
            type: 'POST',
            success: function (data) {
                if (!data.code) {
                    this.$fade.css('display', 'block');
                    this.$patients.css('display', 'block');
                    this.renderPatientList(data.familflist)
                } else {
                    this.$fade.css('display', 'none');
                    promptUtil.alert({
                        'content': data.message,
                        'type': 'alert'
                    });
                }
            }.bind(this)
        })


    },
}

loginPanel.init();
