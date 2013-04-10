var smarty = new function() {

	var _me = this,
		_bingAccessToken = null,
		_googleApiKey = "AIzaSyCg_c8nHre64kC-KAWlFaH2fZ6pyRoahMU",
		_translator = 'google',
		_apps = [];

	this.init = function() {

		$(document).ready(this.ready);
	};

	this.ready = function() {

		if (_translator == 'bing') {
			getBingAccessToken();
		}

		for (var i = 0; i < _apps.length; i++) {
			if (_apps[i].ready) {
				_apps[i].ready();
			}
		}
	};

	this.createApp = function(func) {

		var app = new func(scope());
		_apps.push(app);
		return app;
	};

	// app utility methods
	
	this.translate = function(options) {

		return this['translateVia' + capitalize(_translator)](options);
	};

	this.translateViaGoogle = function(options) {

		var url = "https://www.googleapis.com/language/translate/v2?key=" +
				  encodeURIComponent(_googleApiKey) + "&source=" + options.sourceLanguage +
				  "&target=" + options.targetLanguage + "&q=" + options.wordsList +
				  "&callback=?";

		$.getJSON(url, function(result) {
			if (result.data) {
				var trans = result.data.translations;
				if (trans.length > 0) {
					options.cb && options.cb(trans[0].translatedText);
				}
			}
		})
		.success(function() {  })
		.error(function() { alert("error"); })
		.complete(function() {  });
	};

	this.translateViaBing = function(options) {

		window.mycallback = function(data) {
			options.cb && options.cb(data);
		};

        var s = document.createElement("script");
        s.src = "http://api.microsofttranslator.com/V2/Ajax.svc/Translate" +
            "?appId=Bearer " + encodeURIComponent(_bingAccessToken) +
            "&from=" + encodeURIComponent(options.sourceLanguage) +
            "&to=" + encodeURIComponent(options.targetLanguage) +
            "&text=" + encodeURIComponent(options.wordsList) +
            "&oncomplete=mycallback";
        document.body.appendChild(s);
	};

	// private methods
	
	function scope() {
		return _me;
	}

	function getBingAccessToken() { 

		// obtain bing translate access token.
		$.getJSON('gettoken.php?callback=?', function(data) {
			_bingAccessToken = data;
		})
		.success(function() {  })
		.error(function() { alert("error"); })
		.complete(function() {  });
	}

}();

smarty.init();