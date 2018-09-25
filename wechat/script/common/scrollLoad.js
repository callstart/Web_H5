/**
 * 列表分页加载 by Bowen
 * @param {Object}
 * {
 *      fetchDataFunc: 接口获取数据方法 - 必填
 *      buildDataFunc: 拼接html方法 - 必填
 *      wrapper: 列表填入Html的父层 - 必填
 *      scroller: 滚动区域 - 选填时为整页滚动
 *      pageSize: 单次加载条数 - 选填时为20
 *      currPage: 当前页面 - 选填时为1
 *  }
 */


(function (global) {
    function ScrollLoad() {}

    ScrollLoad.prototype = {
        init: function (obj) {
            if (!obj || !obj.wrapper || !obj.fetchDataFunc || !obj.buildDataFunc) {
                throw new Error('Not enough params!');
                return false;
            }

            this.fetchDataFunc = obj.fetchDataFunc;
            this.buildDataFunc = obj.buildDataFunc;

            this.scroller = obj.scroller || document;
            this.wrapper = obj.wrapper;
            this.pageSize = obj.pageSize || 20;
            this.currPage = obj.currPage || 0;

            this.scrollerParent = this.scroller === document ? document.body : $(this.scroller).get(0);

            this.scrollAreaHeight = this.scroller === document ? document.documentElement.clientHeight : this.scroller.get(0).clientHeight;
            this.lock = false;
            this.end = false;

            this.evtBind();

            this.scrollLoader();
        },
        evtBind: function () {
            $(this.scroller).off('scroll').on('scroll', this.scrollLoader.bind(this));
        },
        scrollLoader: function () {
            if (this.end) {
                return false;
            }

            this.scrollAreaHeight = this.scroller === document ? document.documentElement.clientHeight : this.scroller.get(0).clientHeight;

            if ((this.scrollerParent.scrollHeight - this.scrollerParent.scrollTop - this.scrollAreaHeight) < (this.scrollAreaHeight / 2)) {
                if (this.lock) {
                    return false;
                }

                this.lock = true;

                this.asyncLoad();
            }
        },
        asyncLoad: function () {
            this.fetchDataFunc(this.currPage, function (list) {

                list = list || [];

                this.appendList(list, this.currPage);

                this.lock = false;

                if (list.length < this.pageSize) {

                    this.end = true;

                    return false;
                }

                this.currPage++;

            }.bind(this));
        },
        appendList: function (list, page) {
            $(this.wrapper).append(this.buildDataFunc(list, page))
        }
    }

    function scrollLoad() {
        var l = new ScrollLoad();
        l.constructor = ScrollLoad;
        return l.init.apply(l, arguments);
    }

    if (typeof window.taoguKit != 'object') {
        window.taoguKit = {};
    }

    window.taoguKit.scrollLoad = scrollLoad;

})(window)
