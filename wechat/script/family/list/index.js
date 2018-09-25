(function() {
    var pNum = 0;
    var familyList = function() {
        var _ = {
            renderPage: function(data) {

                var familyListHtml = [];
                $.each(data, function(i, d) {
                    familyListHtml.push([
                        '<li data-role="PatientPLlist" data-info="' + d.tmPId + '">',
                        '<h3>' + d.pName + '</h3>',
                        '<dl>',
                        '<dd><span>身份证：</span>' + d.pCertNo + '</dd></dd>',
                        '<dd><span>手机号：</span>' + d.phone + '</dd>',
                        '<dd><span>诊疗卡：</span>' + (d.treatCardNum != '0' ? '已绑定' + d.treatCardNum + '张' : '未绑定') + '</dd>',
                        '</dl>',
                        '</li>'
                    ].join(''));
                });

                $('[data-role="familyListUl"]').html(familyListHtml.join(''));
            },
            fetchPage: function() {
                $.ajax({
                    url: '/familyMember/queryMyMembers.htm',
                    data: {},
                    type: 'POST',
                    success: function(json) {
                        if (!json.data) {
                            if (json.familflist.length) {
                                if (json.fmNumber > 0) {
                                    $('[data-role="surplusNum"]').attr('href', '/wechat/html/family/add/')
                                }
                                $('[data-role="surplusNum"]').text('还能添加' + json.fmNumber + '位')
                                _.renderPage(json.familflist)
                            } else {
                                if (json.data == 1500) {
                                    $('body').html([
                                        '<div class="no_result"><img src="/wechat/images/no_member.png" alt="您还没有添加家庭成员哦" /></div>',
                                        '<div class="no_result_p">您还没有添加家庭成员哦</div>',
                                        '<section class="but_div2">',
                                        '<input type="button" value="添加家庭成员" data-role="addBtn"/>',
                                        '</section>'
                                    ].join(''))
                                }

                            }
                        } else {
                            promptUtil.alert({
                                'content': json.message,
                                'type': 'alert'
                            });
                        }

                    }
                })
            }
        }
        return {
            init: function() {
                _.fetchPage();
                this.bindEve();
            },
            bindEve: function() {
                $('[data-role="familyListUl"]').on('click', '[data-role="PatientPLlist"]', function() {
                    location.href = "/wechat/html/family/edit/info/?patientId=" + $(this).attr('data-info');
                })

                $('body').on('click', '[data-role="addBtn"]', function() {
                    location.href = "/wechat/html/family/add/";
                })
            }
        }
    }

    familyList().init();
})()
