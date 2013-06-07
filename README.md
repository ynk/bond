#bond

Deeplinking library with html5 pushState support and hash/iframe fallback designed for both flash and javascript.
**The only prerequisite is to set a `<base>` tag pointing to the root path of your application**

####Demos
- [Javascript version](http://dev.martian-arts.org/bond/javascript/) : left/right arrow and left/right buttons to switch through a set of color. type into the input and press enter to set a custom url by yourself.

- [Flash (html5 support disabled)](http://dev.martian-arts.org/bond/flash/) : go left/right to browse quotes from [andiquote](http://andiquote.com/) or click to load a random quote.

---

#Getting started
##Javascript
Load bond with a single `<script>` tag.
when dom is ready, use `bond.initialize` method to activate it with an optional configuration object

```
bond.initialize({
	html5: <boolean> (default: guess mode. set to false to force the use of the location.hash fallback),
	
	onready: <function> (event handler),
	oninternalchange: <function> (event handler),
	onexternalchange: <function> (event handler)
});
```
After that, all you need to do is tell your application what to do when those handlers are called.

---
##Flash
Load bond with a single `<script>` tag **AFTER** the swfobject tag.

A simple routine will automatically find the first swf and setup everything on the javascript side.

In your AS3 code, you only need to declare an `ExternalInterface` callback pointing to a specific function, and then execute a single `ExternalInterface` call :

```
import flash.external.ExternalInterface;

ExternalInterface.addCallback('bond', handle);
ExternalInterface.call('bond.initialize');
function handle(eventType:String, value:String, queryString:Object = null)
{
	trace(eventType, value);
}
```
 You only have to use a set of `ExternalInterface.call` to get access to bond's method.

---

##Data
bond will expose 3 getters and 1 setter to help you parse the current url.

`bond.value()` will return the full url as string (including the querystring)

`bond.value(str, obj = null)` will set the url, and an optional object can be set as querystring

`bond.path()` will return the full url as an array

`bond.parameters()` will return the querystring as an object

##Events
bond is going to use history.pushState or location.hash to deeplink your application.

It will trigger one `onready` event at start, and then `oninternalchange` when the url has been updated **by code** and `onexternalchange` when the url has been updated by **user action** (back button, etc...)

##Misc
`bond.url(str, obj = null)` will set the url, and an optional object can be set as querystring without triggering any change event

`bond.simulate(str, obj = null)` will set the url, and an optional object can be set as querystring and will trigger an `onexternalchange` event