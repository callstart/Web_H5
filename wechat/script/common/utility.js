(function (host, undefined) {
	var UNDEFINED = typeof undefined;
	var emptyFunction = function () {},
		reloadFunction = function () {
			location.reload(true);
		};

	host['Namespace'] = {
		'register': function (namespace, value) {
			if (!namespace || !namespace.length)
				return null;
			if (typeof value == UNDEFINED)
				value = {};
			var parent = host,
				levels = namespace.split(".");
			for (var i = (levels[0] == "window") ? 1 : 0, count = levels.length, limit = count - 1, key; i < levels.length; ++i) {
				key = levels[i];
				parent = (parent[key] = parent[key] || (i == limit ? value : {}));
			}
			if (typeof value != 'undefined')
				parent = value;
			return parent;
		}
	};
	Namespace.register('TaoGu.APP.Utility', {
		'OOP': {
			'create': function (identifier, init, proto) {
				init.prototype = proto;
				init.prototype.constructor = init;
				if (identifier)
					return host[identifier] = init;
				else
					return init;
			}
		},
		'Language': {
			'isArray': function (source) {
				return '[object Array]' == Object.prototype.toString.call(source);
			},

			'isString': function (source) {
				return '[object String]' == Object.prototype.toString.call(source);
			},

			'bind': function (func, scope) {
				var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
				return function () {
					var fn = TaoGu.APP.Utility.Language.isString(func) ? scope[func] : func,
						args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
					return fn.apply(scope || fn, args);
				};
			}
		},
		'Bridge': {
			'device': (function () {
				var ua = /(iPhone|iPad|Android)/gi.test(navigator.userAgent);
				switch (RegExp.$1.toString().toLowerCase()) {
				case 'iphone':
				case 'ipad':
					return 'IOS';
				case 'android':
					return 'Android';
				default:
					return 'PC';
				}
			})()
		},
		'String': {
			'stringFormat': function () {
				if (arguments.length == 0)
					return null;
				var value = arguments[0];
				for (var i = 1, count = arguments.length; i < count; i++) {
					var pattern = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
					value = value.replace(pattern, arguments[i]);
				}
				return value;
			},

			'trim': function (source) {
				return source.replace(/^\s+|\s+$/gi, '');
			},

			'getByteLength': function (source) {
				return String(source).replace(/[^\x00-\xff]/g, "ci").length;
			},

			'subByte': function (source, length, tail) {
				source = String(source);
				tail = tail || '';
				if (length < 0 || this.getByteLength(source) <= length) {
					return source;
				}
				source = source.substr(0, length).replace(/([^\x00-\xff])/g, "\x241 ")
					.substr(0, length)
					.replace(/[^\x00-\xff]$/, "")
					.replace(/([^\x00-\xff]) /g, "\x241");
				return source + tail;
			},
			"xssProtect": function (source) {
				var replaceChar = {
					"<": "&lt;",
					">": "&gt;",
					"&": "&amp;",
					"\'": "&apos;",
					"\"": "&quot;"
				}

				return source.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/\'/g, '&apos;')
					.replace(/\"/g, '&quot;');
			}
		},
		'DateTime': {
			'showtime': function (source) {
				var month = source.getMonth() + 1
				return source.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (source.getDate() < 10 ? '0' + source.getDate() : source.getDate());
			}
		},
		'Network': {
			'searchStr': location.href.split('#')[0],
			'queryString': function (key) {
				this.searchStr = this.searchStr ? this.searchStr : location.href.split('#')[0];
				var result = this.searchStr.match(new RegExp("[\?\&]" + key + "=([^\&]+)", "i"));
				if (result == null || result.length < 1)
					return "";
				return decodeURIComponent(result[1]);
			},
			'relocate': function (url) {
				if (!url) {
					return false;
				}

				setTimeout(function () {
					location.href = url;
				}, 300)
			}
		},
		'Image': {
			'preload': function (src, callback) {
				var temp = new Image;
				temp.setAttribute('src', src);
				var handler = function () {
					var data = {
						'src': src,
						'width': temp.width,
						'height': temp.height
					};
					if (callback)
						callback(data);
				};
				temp.onerror = function () {}; //todo
				if (temp.getAttribute('complete'))
					handler();
				else
					$(temp).one('load', handler);
				//Common.eventBind(temp, 'load', handler);
			},

			'resize': function (size, limit) {
				var result = {
					'width': size.width,
					'height': size.height
				}
				if (size.width > limit.width)
					result = {
						'width': limit.width,
						'height': Math.ceil(limit.width / size.width * size.height)
					};
				return result;
			}
		},
		'Storage': {
			hname: location.hostname ? location.hostname : 'localStatus',
			isLocalStorage: window.localStorage ? true : false,
			dataDom: null,

			initDom: function () { //初始化userData
				if (!this.dataDom) {
					try {
						this.dataDom = document.createElement_x('input'); //这里使用hidden的input元素
						this.dataDom.type = 'hidden';
						this.dataDom.style.display = "none";
						this.dataDom.addBehavior('#default#userData'); //这是userData的语法
						document.body.appendChild(this.dataDom);
						var exDate = new Date();
						exDate = exDate.getDate() + 30;
						this.dataDom.expires = exDate.toUTCString(); //设定过期时间
					} catch (ex) {
						return false;
					}
				}
				return true;
			},
			set: function (key, value) {
				if (this.isLocalStorage) {
					window.localStorage.setItem(key, value);
				} else {
					if (this.initDom()) {
						this.dataDom.load(this.hname);
						this.dataDom.setAttribute(key, value);
						this.dataDom.save(this.hname)
					}
				}
			},
			get: function (key) {
				if (this.isLocalStorage) {
					return window.localStorage.getItem(key);
				} else {
					if (this.initDom()) {
						this.dataDom.load(this.hname);
						return this.dataDom.getAttribute(key);
					}
				}
			},
			remove: function (key) {
				if (this.isLocalStorage) {
					localStorage.removeItem(key);
				} else {
					if (this.initDom()) {
						this.dataDom.load(this.hname);
						this.dataDom.removeAttribute(key);
						this.dataDom.save(this.hname)
					}
				}
			}
		}
	});

})(window, undefined);
