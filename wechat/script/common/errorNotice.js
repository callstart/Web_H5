module.exports = function(notice, ifGoBack) {
    $('body').empty();
    $('body').html('<div class="icon"></div><div class="words-outer"><div class="words-inner">' + (notice ? notice : "哎呀，页面走丢了，我们正在努力寻找，您可以") + '</div></div><div class="button-outer"><a class="button goBack' + (ifGoBack ? 'none' : '') + '" href="javascript:history.go(-1)">返回</a><a class="button" href="javascript:window.reload">重新加载</a></div>');
};
