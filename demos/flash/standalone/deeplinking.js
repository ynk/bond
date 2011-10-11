var deeplinking = {};

(function()
{
	//scope definition
	var that = this;

	//internal stuff
	that.debug = typeof (console) != 'undefined';
	that.log = that.debug ? console.log : function() {};

	that.html5 = (window.history.pushState != undefined);
	that.IE = (typeof(window.ActiveXObject) != 'undefined') && (typeof(document.documentMode) != 'undefined') && (document.documentMode < 8);
	
	that.timer;

	that.onready = function() {};
	that.oninternalchange = function() {};
	that.onexternalchange = function() {};

	that.hash = function()
	{
		if (!activated) { return null; }
		
		var index = location.href.indexOf('#');
		return (index == -1 ? '' : location.href.substr(index + 1));
	}
	
	var host = undefined;
		that.host = function()
		{
			if (!activated) { return null; }
			
			if (arguments.length == 0) { return gethost(); }
			else { sethost(arguments[0]); }
		};

		var gethost = function () { return host; };
		var sethost = function (s)
		{
			var init = (host == undefined);

			if (s.indexOf('http') == -1) { host = window.location.protocol + '//' + s + '/'; }
			else { host = s; }

			if (init)
			{
				var from = {}; from.html4 = (that.hash().length != 0);

				if (from.html4 && that.html5)
				{
					window.history.pushState({}, '', that.hash().substr(2));
					window.location.hash = '';
				}

				value = !that.html5 ? that.hash() : window.location.href.replace(that.host(), '');

				if (!that.html5)
				{
					if (that.hash() == '')
					{
						var uri = window.location.toString(),
							pms = uri.split(host).join('');

						window.location.replace(host + (pms.charAt(0) == '/' ? '#' : '#/') + pms.replace(/#/g, ''));
					}
				}
			}
		};

	var value = undefined;
		that.value = function()
		{
			if (!activated) { return null; }
		
			if (arguments.length == 0) { return getvalue(); }
			else { setvalue(arguments[0]); }
		};

		var getvalue = function() { return !that.html5 ? value.substr(1) : value; };
		var setvalue = function(s)
		{
			if (value == s) { return; }
			if (that.debug) { that.log('internal change'); }
						
			if (!that.html5)
			{
				value = '/' + s;
				
				if (that.IE)
				{
					if (that.debug) { log('using iframe'); }
					
					if (that.iframe == undefined)
					{
						that.iframe = document.createElement('iframe');
							that.iframe.src = 'javascript:void(0)';
							that.iframe.style.display = 'none';
							that.iframe.tabindex = -1;
					
						document.appendChild(that.iframe);
					}
					
					var iframe_document = that.iframe.contentWindow.document;
						iframe_document.open();
						iframe_document.write('<html><body>' + value + '</body></html>');
						iframe_document.close();
						
					that.iframe.contentWindow.document.location.hash = value;
				}
				
				window.location.hash = value;
				that.oninternalchange.call(null, 'internal', value);
			}
			else
			{
				value = s;
				
				window.history.pushState({}, '', value);
				that.oninternalchange.call(null, 'internal', value);
			}
		};

		that.url = function(v)
		{
			if (!activated) { return null; }
			!that.html5 ? window.location.hash = '/' + v : window.history.pushState({}, '', v);
		};

	var cron = function(e)
	{
		if (!that.html5)
		{
			if (that.hash() == '') { value = ''; window.location.hash = '/'; }
			
			if (value != that.hash())
			{
				if (that.debug) { that.log('external change'); }

				value = that.hash();
				if (that.IE && that.iframe != undefined) { that.iframe.contentWindow.document.location.hash = value; }
				
				that.onexternalchange.call(null, 'external', value);
			}
			else if ((that.iframe != undefined) && (that.iframe.contentWindow.document.location.hash.substr(1) != that.hash()))
			{
				value = that.iframe.contentWindow.document.location.hash.substr(1);
				window.location.hash = value;
				
				that.onexternalchange.call(null, 'external', value);
			}
		}
		else
		{
			if (value != window.location.href.replace(that.host(), ''))
			{
				if (that.debug) { that.log('external change'); }
				
				value = window.location.href.replace(that.host(), '');
				that.onexternalchange.call(null, 'external', value);
			}
		}
	};

	var activated = false;
	
	//activate/deactivate
	that.activate = function()
	{
		if (!activated)
		{
			if (!that.html5 && 'onhashchange' in window && 'addEventListener' in window) { window.addEventListener('hashchange', cron, false); }
			else { that.timer = setInterval(cron, 50); }
			
			activated = true;
		}
	};

	that.deactivate = function()
	{
		if (activated)
		{
			if (!that.html5 && 'onhashchange' in window && 'addEventListener' in window) { window.removeEventListener('hashchange', cron, false); }
			else { clearInterval(that.timer); that.timer = null; }
			
			activated = false;
		}
	};

	that.initialize = function()
	{
		var base = document.getElementsByTagName('base');
			if (base == null || base.length == 0) { throw new Error('undefined <base> tag'); }
		    
		base = base[0];

		that.activate();
		that.host(base.href);
		
		if (that.swfid != undefined)
		{
			that.onready = function(type) { document.getElementById(that.swfid).deeplink('ready'); };

			that.oninternalchange = function(type) { document.getElementById(that.swfid).deeplink('internal'); };
			that.onexternalchange = function(type) { document.getElementById(that.swfid).deeplink('external'); };
		}
		
		that.onready('ready');
	};
		
	//swfobject integration	
	if (typeof(swfobject) != 'undefined')
	{
		var method = swfobject.embedSWF;
		
		swfobject.embedSWF = function()
		{
			var args = new Array();
			for (var i = 0; i < 10; i++) { args.push(arguments[i]); }
			
			that.swfid = args[1];
