var app = smarty.createApp(function(scope) {

	var _me = this,
		_config,
		_defaults = {
			dictionary: [],
			dictionaryGenerated: false, // when true, specific markup should be applied
			source: "",
			translation: "",
			title: "ללא כותרת",
			verseSplitChar: '\n\n',
			lineSplitChar: '\n',
			printGeneralDictionary: false,
			debug: false
		},
		_dom = {},
		_globalDic = {},
		_indexDic = {},
		_blacklistedWords = ['and', 'be', 'is', 'are', 'of', 'to', 'a', 'an', 'at', 'in', 'on'];

	this.init = function(settings) {
		_me = this;

		_config = $.extend(_defaults, settings);

		dom('el', '#container');
		dom('editor', '#editor');

		return _me;
	};

	this.load = function(settings) {

		_config = $.extend(_defaults, settings);

		for (var word in config('dictionary')) {
			_indexDic[getDictionaryKey(word)] = config('dictionary')[word];
		}

		dom('el').html('');

		buildTitle();
		buildTranslationTable();

		if (config('printGeneralDictionary')) {
			buildDictionary();			
		}
		//buildInfo();
		//buildPDF();
		
		if (config('editDictionary')) {
			buildDictionaryEditor();
		}
	};

	this.unload = function() {

		dom('el').html('');
	};

	this.reload = function() {
		me.load(_config);
	};

	this.config = function(key) { return _config[key]; }
	this.dom = function(key, value) { 
		if (typeof value == 'undefined') { return _dom[key]; }
		else { _dom[key] = $(value); return _dom[key]; }
	}

	this.generateDictionary = function(options) { debugger;

		var words = listUniqueWords(options.song),
			wordsList = words.join(' | ');

		scope.translate({
			'sourceLanguage': 'en',
			'targetLanguage': 'he',
			'wordsList': wordsList,
			'cb': function(data) {
				if (data) {
					var trans = data.split('|'),
						w, t, dic = {};

					for (var i = 0; i < words.length; i++) {
						w = words[i];
						t = $.trim(trans[i]).replace(/  /gi, '');

						if (w !== t) {
							dic[w] = t;
						}
					}

					options.cb && options.cb(dic);
				} else {
					alert('no data received');
				}
			}
		});

	};

	// private methods

	function listUniqueWords(str) {

		var words = str.toLowerCase()
						.replace(/'s '/gi, ' ')
						.replace(/[()]/gi, '')
						.replace(/"/gi, '')
						.replace(/&quot;/gi, '')
						.replace(/[\n\-]/gi, ' ')
						.replace(/[\.,;!?]{1,}/gi, '')
						.replace(/  /gi, ' ')
						.split(' '),

			dic = {}, res = [];

		for (var i = 0; i < words.length; i++) {
			dic[words[i]] = true;
		}

		for (var w in dic) {
			if (w && $.inArray(w, _blacklistedWords) == -1) {
				res.push(w);
			}
		}

		return res;
	}
	
	function buildTitle() {

		dom('title', $('<h1></h1>'))
			.appendTo(dom('el'))
			.html(config('title'))
			.append('<span class="name">שם: <i></i></span>');
	}

	function buildTranslationTable() {

		var source = config('source').split(config('verseSplitChar')),
			//translation = config('translation').split(config('verseSplitChar')),
			html = "<table>";

		_globalDic = {};

		for (var i = 0; i < source.length; i++) {
			if (!$.trim(source[i])) continue;
			//if (!translation[i]) continue;

			var translation = "";//translation[i] ? translation[i].replace(/\n/g, '<br>') : '';

			html += "<tr>"
				 + "<td>" + source[i].replace(/\n/g, '<br>') + "</td>"
				 + "<td>" + getDictionaryString(source[i]) + "</td>"
				 + "<td>" + getLinesString(source[i]) + "</td></tr>";
		}

		html += "</table>";

		dom('el').append($(html));
	}

	function buildDictionary() {

		var dic = config('dictionary');

		dom('dic', $('<section id="dictionary"></section>'))
			.appendTo(dom('el'));

		dom('dic').append('<h1>מילון</h1>');

		for (var word in dic) {
			// using tables to make sure the dictionary looks as expected on print.
			dom('dic').append('<table><tr><td>' + word + '</td><td>' + dic[word] + '</td></tr></table>');
			//dom('dic').append('<article><label>' + word + '</label> <strong>' + dic[word] + '</strong></article> ');
		}
	}

	function getDictionaryString(wordsString) {

		var html = "",
			words = removeDoubles(wordsString.toLowerCase()
						.replace(/[\.,\:()]/g, '')
						.replace(/[\n\-]/g, ' ')
						.split(' '));

		for (var i = 0; i < words.length; i++) {
			var key = getDictionaryKey(words[i]);

			if (!_globalDic[key] && words[i] && (config('debug') || dictionary(words[i]))) {
				
				// using tables to make sure the dictionary looks as expected on print.
				if (config('dictionaryGenerated')) {
					html += '<table><tr><td>' + words[i] + '</td><td><span lang="he-x-mtfrom-en">' + dictionary(words[i]) + '</span></td></tr></table>';
				} else {
					html += '<table><tr><td>' + words[i] + '</td><td>' + dictionary(words[i]) + '</td></tr></table>';
				}

				//html += '<article><label>' + words[i] + '</label> <strong>' + dictionary(words[i]) + '</strong></article> ';
				
				_globalDic[key] = true;
			}
		}

		return html;
	}

	function getDictionaryKey(word) {
		return word.replace(/[ְֱֲֳִֵֶַָֹֻּּׁׂ]/g, '');
	}
	function dictionary(word) {
		return _indexDic[getDictionaryKey(word)];
	}

	function removeDoubles(arr) {

		var dic = {},
			newArr = [];

		for (var i = 0; i < arr.length; i++) {
			dic[arr[i]] = true;
		}

		for (var word in dic) { 
			newArr.push(word);
		}

		return newArr;
	}

	function getLinesString(str) {

		var count = Math.min(str.length / 45, 7),
			html = "";

		for (var i = 0; i < count; i++) {
			html += "<span></span>";
		}

		return html;
	}

	function buildDictionaryEditor() {

		var words = dom('el').find('tr td:nth-child(2) table');

		words.on('mouseenter', function(e) {

			wordEditor.show({
				'event': e, 
				'onWordChanged': function(word, newVal) {
					_config.dictionary[word] = newVal;
				},
				'onWordRemoved': function(word) {
					delete _config.dictionary[word];
				}
			});

		});

		$('#container h1').click(function() {
			console.log(_config.dictionary);
		});
	}

	function buildPDF() {

		Downloadify.create('downloadify',{
			filename: 'Example.pdf',
			data: function(){ 		
				var doc = new jsPDF();

				// We'll make our own renderer to skip this editor
				var specialElementHandlers = {
					'#container': function(element, renderer){
						return true;
					}
				};

				// All units are in the set measurement for the document
				// This can be changed to "pt" (points), "mm" (Default), "cm", "in"
				doc.fromHTML($('body').get(0), 15, 15, {
					'width': 170, 
					'elementHandlers': specialElementHandlers
				});
				return doc.output();
			},

			onComplete: function(){ alert('Your File Has Been Saved!'); },
			onCancel: function(){ alert('You have cancelled the saving of this file.'); },
			onError: function(){ alert('You must put something in the File Contents or there will be nothing to save!'); },
			swf: 'libs/downloadify/media/downloadify.swf',
			downloadImage: 'libs/downloadify/images/download.png',
			width: 100,
			height: 30,
			transparent: false,
			append: true
		});
	}


	// shortcuts
	var config = this.config,
		dom = this.dom;

});