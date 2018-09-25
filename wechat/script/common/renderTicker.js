/**
 * renderTicker
 * Base ES5+
 * Author: liubowen@91taogu.com
 * Date: 2015-06-29
 * Version: 0.0.1
 */
(function () {
    var RenderTicker = function () {
        // 父节点对象 origin dom object
        this.tarDom = null;

        // 列表数据
        this.data = [];

        // 格式化返回模板字符串
        this.formatFn = function (json) {
            return '';
        }

        // 每次加载条目
        this.step = 10;

        // 每次加载间隙
        this.intervalStep = 200; // unit: ms

        // 起始节点
        this.startIndex = 0;

        // 循环对象
        this.interval = null;
    }

    RenderTicker.prototype.init = function (tarDom, data, formatFn, step, intervalStep) {
        this.initSet.apply(this, Array.prototype.slice.call(arguments, 0));
        this.go();
    };

    RenderTicker.prototype.initSet = function (tarDom, data, formatFn, step, intervalStep) {
        this.tarDom = tarDom || null;
        this.data = data || [];
        this.formatFn = formatFn || this.formatFn;
        this.step = step || this.step;
        this.intervalStep = intervalStep || this.intervalStep;

        this.startIndex = 0;
    };

    RenderTicker.prototype.go = function () {
        this.interval = setInterval(function () {
            if (this.startIndex > this.data.length) {
                clearInterval(this.interval);
                return false;
            } else {
                this.tarDom.innerHTML += this.eachTemplate(this.formatFn, this.selectRenderData());
                this.startIndex += this.step;
            }
        }.bind(this), this.intervalStep);
    };

    RenderTicker.prototype.eachTemplate = function (formatFn, dataList) {
        var tplString = '';
        dataList.forEach(function (idx, i) {
            tplString += formatFn(idx);
        });

        return tplString;
    }

    RenderTicker.prototype.selectRenderData = function () {
        return this.data.slice(this.startIndex, this.startIndex + this.step);
    }

    window.RenderTicker = function () {
        var rt = new RenderTicker();
        rt.init.apply(rt, arguments);
        return rt;
    };
})();
