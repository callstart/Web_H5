(function() {
    var utility = TaoGu.APP.Utility;
    var page = function() {
        $.ajax({
            url: '/hospital/queryRegRule.htm',
            data: {
                hospId: utility.Network.queryString('hospId')
            },
            type: 'POST',
            success: function(data) {
                if (data.code) {
                    promptUtil.alert({
                        'content': json.message,
                        'type': 'alert'
                    })
                } else {
                    $('[data-rol="rule"]').html(data.regtRuleDesc);
                }
            }

        })
    }
    page();
})()
