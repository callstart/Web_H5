var page = (function () {
    var utility = TaoGu.APP.Utility;
    var addr = utility.Network.queryString('addr');
    var backto = utility.Network.queryString('backto');

    var _ = {
        $addr: $('[data-role="addr"]'),
        renderData: function () {
            this.$addr.val(addr);
        },
        valid: function (str) {
            return taoguKit.valid.addr(str);
        },
        bindEvt: function () {
            var initHeight = $('[data-role="addr"]').height();
            var initRows = $('[data-role="addr"]').attr('rows');
            var initLineHeight = initHeight / initRows;
            var lv = $('[data-role="addr"]').val();

            $('[data-role="addr"]').attr('rows', Math.ceil($('[data-role="addr"]').get(0).scrollHeight / initLineHeight));

            $('[data-role="addr"]').on('input', function (e) {
                var nv = this.value;
                var sh = this.scrollHeight;

                // 变多
                if (nv.length > lv.length) {
                    $(this).attr('rows', Math.ceil(sh / initLineHeight));
                } else {
                    $(this).attr('rows', $(this).attr('rows') * 1 - 1);
                    $(this).attr('rows', Math.max(Math.ceil(this.scrollHeight / initLineHeight), initRows));
                }
                lv = nv;
            })

            $('[data-role="button"]').on('click', function (e) {
                var v = $.trim(this.$addr.val());

                if (v.length < 1 || v.length > 25) {
                    promptUtil.toast('地址最大不超过25个字符，最少1个字符');
                    return false;
                }

                if (!this.valid(v)) {
                    promptUtil.toast('输入正确的中英文，数字');
                    return false;
                }

                if (this.lock) {
                    return false;
                }

                this.lock = true;

                $.ajax({
                    url: '/user/addAddress.htm',
                    type: 'POST',
                    data: {
                        memberId: utility.Network.queryString('memberId') || '',
                        address: v
                    },
                    success: function (json) {
                        if (!json.code) {
                            /* if (backto) {
                                 location.href = backto;
                             } else {
                                 history.go(-1);
                             }*/
                            promptUtil.alert({
                                'content': '修改成功',
                                'type': 'alert'
                            });
                            $('[data-role="button"]').attr('disabled', 'disabled');
                            $('[data-role="button"]').addClass('disabled');
                            $('[data-role="addr"]').attr('readonly', 'readonly')
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }
                    },
                    complete: function () {
                        this.lock = false;
                    }.bind(this)
                })
            }.bind(this));
        }
    }

    return {
        init: function () {
            _.renderData();
            _.bindEvt();
        }
    }
})();

page.init();
