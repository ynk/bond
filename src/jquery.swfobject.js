// jQuery SWFObject v1.1.1 MIT/GPL @jon_neal
// http://jquery.thewikies.com/swfobject

(function($, flash, Plugin) {
	var OBJECT = 'object',
		ENCODE = true;

	function _compareArrayIntegers(a, b) {
		var x = (a[0] || 0) - (b[0] || 0);

		return x > 0 || (
			!x &&
			a.length > 0 &&
			_compareArrayIntegers(a.slice(1), b.slice(1))
		);
	}

	function _objectToArguments(obj) {
		if (typeof obj != OBJECT) {
			return obj;
		}

		var arr = [],
			str = '';

		for (var i in obj) {
			if (typeof obj[i] == OBJECT) {
				str = _objectToArguments(obj[i]);
			}
			else {
				str = [i, (ENCODE) ? encodeURI(obj[i]) : obj[i]].join('=');
			}

			arr.push(str);
		}

		return arr.join('&');
	}

	function _objectFromObject(obj) {
		var arr = [];

		for (var i in obj) {
			if (obj[i]) {
				arr.push([i, '="', obj[i], '"'].join(''));
			}
		}

		return arr.join(' ');
	}

	function _paramsFromObject(obj) {
		var arr = [];

		for (var i in obj) {
			arr.push([
				'<param name="', i,
				'" value="', _objectToArguments(obj[i]), '" />'
			].join(''));
		}

		return arr.join('');
	}

	try {
		var flashVersion = Plugin.description || (function () {
			return (
				new Plugin('ShockwaveFlash.ShockwaveFlash')
			).GetVariable('$version');
		}())
	}
	catch (e) {
		flashVersion = 'Unavailable';
	}

	var flashVersionMatchVersionNumbers = flashVersion.match(/\d+/g) || [0];

	$[flash] = {
		available: flashVersionMatchVersionNumbers[0] > 0,

		activeX: Plugin && !Plugin.name,

		version: {
			original: flashVersion,
			array: flashVersionMatchVersionNumbers,
			string: flashVersionMatchVersionNumbers.join('.'),
			major: parseInt(flashVersionMatchVersionNumbers[0], 10) || 0,
			minor: parseInt(flashVersionMatchVersionNumbers[1], 10) || 0,
			release: parseInt(flashVersionMatchVersionNumbers[2], 10) || 0
		},

		hasVersion: function (version) {
			var versionArray = (/string|number/.test(typeof version))
				? version.toString().split('.')
				: (/object/.test(typeof version))
					? [version.major, version.minor]
					: version || [0, 0];

			return _compareArrayIntegers(
				flashVersionMatchVersionNumbers,
				versionArray
			);
		},

		encodeParams: true,

		expressInstall: 'expressInstall.swf',
		expressInstallIsActive: false,

		create: function (obj) {
			var instance = this;

			if (
				!obj.swf ||
				instance.expressInstallIsActive ||
				(!instance.available && !obj.hasVersionFail)
			) {
				return false;
			}

			if (!instance.hasVersion(obj.hasVersion || 1)) {
				instance.expressInstallIsActive = true;

				if (typeof obj.hasVersionFail == 'function') {
					if (!obj.hasVersionFail.apply(obj)) {
						return false;
					}
				}

				obj = {
					swf: obj.expressInstall || instance.expressIns