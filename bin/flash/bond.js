;(function(w, d)
{
	"use strict";

// helpers
	function ndfnd(o, t) { return (typeof o === (t || "undefined")); }
	function trmhst(q)
	{
		var h = _.l.href.replace(_.h, "").substr(1),
			i = h.indexOf("?");
		
		return q || (i == -1) ? h : h.substr(0, i);
	}
	function qrystr(o, pf)
	{
	    var s = [];

	    for(var p in o)
	    {
	        var k = pf ? pf + "[" + p + "]" : p, v = o[p];
	        	k = ndfnd(v, "object") 	? qrystr(v, k)
	        							: encodeURIComponent(k) + "=" + encodeURIComponent(v);
	        s.push(k);
	    }

	    return s.join("&");
	}

// namespaces
	var B = this,
		_ = {};

// public
	B.debug = w.console && w.console.firebug;
	B.log = B.debug ? console.log : function() {};

	B.html5 = (!ndfnd(w.history.pushState));
	B.IE = (!ndfnd(w.ActiveXObject) && !ndfnd(d.documentMode) && d.documentMode <= 8);
	
	B.onready = function() {};
	B.oninternalchange = function() {};
	B.onexternalchange = function() {};

// private
	_.l = w.location;
	_.p = w.history;

	_.s = false; //status
	_.t = null;	//timer

	_.h = ""; //host
	_.v = ""; //value
	_.q = "null"; //querystring

// hash getter
	B.hash = function(q)
	{
		var h = _.l.href,
			i = h.indexOf("#");

		if (i != -1)
		{
			h = h.substr(i + 1);
			i = h.indexOf("?");

			return q || (i == -1) ? h : h.substr(0, i);
		}
		else { return ""; }
	};

// host public interface & private getter/setter
	B.host = function()
	{
		if (arguments.length == 0) { return _.gh(); }
		else { _.sh(arguments[0]); }
	};

	_.gh = function() { return _.h; };
	_.sh = function(s)
	{
		_.h = s.indexOf("http") != -1 ? s : _.l.protocol + "//" + s;
		if (_.h.charAt(_.h.length -1) == "/") { _.h = _.h.substr(0, _.h.length - 1); }
	};

// adaptive html4/html5 logic
	_.r = function()
	{
		if ((B.hash().length != 0) && B.html5)
		{
			_.p.pushState({}, "", B.hash());
			_.l.hash = "";
		}

		_.v = !B.html5 ? B.hash() : trmhst();
		_.q = B.parameters(true);
	}

// value public interface & private getter/setter
	B.value = function()
	{
		if (arguments.length == 0) { return _.gv(); }
		else { _.sv(arguments[0], arguments[1] || null); }
	};

	_.gv = function() { return _.v; };
	_.sv = function(s, q)
	{
		if (_.v == s && _.q == q) { return; }
		if (B.debug) { B.log("internal change", _.v, "=>", s); }

		_.v = s;
		_.q = JSON.stringify(q);

		var y = q != null ? _.v + "?" + qrystr(q) : _.v;

		if (B.html5) { _.p.pushState({}, "", y); }
		else
		{
			if (B.IE)
			{
				if (B.debug) { log("using iframe"); }
				
				if (ndfnd(_.i))
				{
					_.i = d.createElement("iframe");
						_.i.src = "javascript:void(0)";
						_.i.style.display = "none";
						_.i.tabindex = -1;
						_.i.title = d.getElementsByTagName("title")[0].innerHTML;

					d.appendChild(_.i);

					_.icd = _.i.contentWindow.d;
				}
				
				_.icd.open();
				_.icd.write(("<html><body>%v</body></html>").replace("%v", y));
				_.icd.close();
					
				_.icd.location.hash = y;
			}
			
			_.l.hash = y;
		}

		B.oninternalchange("internal", _.v, JSON.parse(_.q));
	};

// url setter (simulate external changes)
	B.url = function(s)
	{
		if (!_.s) { return null; }
		!B.html5 ? _.l.hash = s : _.p.pushState({}, "", s);
	};

// path array getter
	B.path = function()
	{
		var i = _.v.indexOf("?"),
			v = i != -1 ? _.v.substr(0, i) : _.v;

		return v.split("/");
	};
	
// querystring getter
	B.parameters = function(j)
	{
		var v = B.html5 ? trmhst(true) : B.hash(true),
			i = v.indexOf("?"),
		
		v = i != -1 ? v.substr(i + 1) : "";

		if (v.length == 0) { return j ? "null" : null; }

		var p = v.split("&"), obj = {};
			for (var i = 0, l = p.length, o; i < l; i++)
			{
				o = p[i].split("=");
				obj[o[0]] = !ndfnd(o[1]) ? o[1] : null;
			}	
			
		return j ? JSON.stringify(obj) : obj;
	};

// cron url checker
	_.c = function(e)
	{
		var u = false, o = _.v, n = "", m = B.parameters(true);

		if (!B.html5)
		{
			n = B.hash();
			
			if (u = (_.v != n || _.q != m))
			{
				_.v = n;
				_.q = m;

				if (!ndfnd(_.i)) { _.icd.location.hash = n; }
			}
			else if (u = (!ndfnd(_.i) && (_.icd.location.hash.substr(1) != n)))
			{
				n = _.icd.location.hash.substr(1);
				_.v =_.l.hash = n;
				_.q = m;
			}
		}
		else
		{
			n = trmhst();

			if (u = (_.v != n || _.q != m))
			{
				_.v = trmhst();
				_.q = m;
			}
		}

		if (u)
		{
			if (B.debug) { B.log("external change", "'" + o + "'", "=>", "'" + n + "'"); }
			B.onexternalchange("external", _.v, JSON.parse(_.q));
		}
	};

// activate/deactivate statements
	B.activate = function()
	{
		if (!_.s)
		{
			if ((_.z = (!B.html5 && "onhashchange" in w && "addEventListener" in w)))
				{ w.addEventListener("hashchange", _.c, false); }
			else { _.t = setInterval(_.c, 25); }
			
			_.s = true;
		}
	};

	B.deactivate = function()
	{
		if (_.s)
		{
			if (_.z) { w.removeEventListener("hashchange", _.c, false); }
			else { clearInterval(_.t); }
			
			_.s = false;
		}
	};

// constructor
	B.initialize = function(c)
	{
		c = c || {};
		var p = ["debug", "log", "html5", "IE", "onready", "oninternalchange", "onexternalchange"];

		for (var i = 0, l = p.length; i < l; i++)
			{ if (p[i] in c) { B[p[i]] = c[p[i]]; } }

		var b = d.getElementsByTagName("base");
			if (b == null || b.length == 0) { throw new Error("undefined <base> tag"); }
					
		if (B.swf)
		{
			_.swf = d.getElementById(B.swf);
			
			B.onready = B.oninternalchange = B.onexternalchange =
				function(e, v, q) { _.swf.bond(e, v, q); };
		}

		B.host(b[0].href);
		_.r();

		if (B.debug) { B.log("bond ready", "'" + _.v + "'"); }
			B.onready("ready", _.v, JSON.parse(_.q));

		B.activate();
		_.c();
	};

// swfobject integration	
	if (!ndfnd(w.swfobject))
	{
		var method = swfobject.embedSWF;
		
		swfobject.embedSWF = function()
		{
			var args = [].slice.call(arguments);
			
			B.swf = args[1];
			
			if (ndfnd(args[8])) 	{ args[8] 		= {}; }
			if (ndfnd(args[8].id)) 	{ args[8].id 	= args[1]; }
			
			method.apply(this, args);
		};
	}

//	
}).call(window.bond = {}, window, document);