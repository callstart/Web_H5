(function () {
	var pullLoading = function (callback) {
		var scroller = document.querySelector('[data-pulldown="scroller"]');
		var showLoad = false;

		var x = 0,
			y = 0,
			new_x = 0,
			new_y = 0,
			goFresh = false;

		scroller.addEventListener('touchstart', function (e) {
			if (e.touches.length == 1) {
				x = e.touches[0].screenX;
				y = e.touches[0].screenY;
			}
		}, false);


		scroller.addEventListener('touchmove', function (e) {
			if (e.touches.length == 1) {

				new_x = e.touches[0].screenX;
				new_y = e.touches[0].screenY;

				if (scroller.scrollTop == 0 && (new_y - y >= 0)) {
					e.preventDefault();
					var pullDown = document.querySelector('#pullDown');
					if (new_y - y > 100) {
						goFresh = true;
						// 切换成菊花状态
						pullDown.innerHTML = '<span class="pullDownLoding"></span> <span> 正在加载 </span>';
						pullDown.style.lineHeight = '10px';
					} else {
						// 展示下拉刷新
						pullDown.style.display = 'block';
						pullDown.innerHTML = '<span class="pullDownIcon"></span> <span> 下拉刷新 </span>'
					}
				}
			}
		}, false);

		scroller.addEventListener('touchend', function (e) {
			if ((e.changedTouches.length == 1) && !goFresh) {
				// 暂停下拉，回归列表
				pullDown.style.display = 'none';
				pullDown.innerHTML = '';
			} else {
				setTimeout(function () {
					callback();
					pullDown.style.display = 'none';
					pullDown.innerHTML = '';
					goFresh = false;
				}, 1500)
			}
		}, false);
	}

	window.pullLoading = pullLoading;
})();
