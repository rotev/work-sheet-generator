var Editor = function(settings) {

	var dom = function(key, value) { return app.dom('editor_' + key, value); },
		_container,
		_form,
		_title,
		_song,
		_songs,
		_fields,
		_newSong,
		_back,
		_generate,
		_selectedSong = null,

		_defaults = { 'songs': [] },
		_config;

	this.init = function() {

		_config = $.extend(_defaults, settings);

		app.init();

		_form = _container = settings.container;
		_title = dom('title', '#title');
		_song = dom('song', '#song');
		_songs = dom('songs', '#songs');
		_fields = dom('fields', _container.find('.fields'));
		_newSong = dom('newSong', '#new_song');
		_back = dom('back', '#back');
		_generate = dom('generate', '#generate');

		_back.click(showList);

		_newSong.click(function() {
			deselectSong();
			emptyFields();
			showFields();
		});

		// create existing songs buttons.
		for (var i = 0; i < _config.songs.length; i++) {
			var song = _config.songs[i],
				btn = $('<button></button>')
					.html(song.title)
					.attr('data-song', song.key)
					.click(onSongClicked);
			_songs.append(btn);
		}

		_form.submit(function(e) { e.preventDefault(); });
		_generate.click(onSubmit);
		_title.change(onChange);
		_song.change(onChange);
	};

	function onSongClicked(e) {

		e.preventDefault();

		app.unload();

		var songKey = $(this).data('song');

		_gaq.push(["_trackEvent", "SongEditor", "SongClicked", "songKey=" + songKey]);

		// get json data.		
		$.getJSON('songs/' + songKey + '.json', function(song) {
			_title.val(song.title);
			_song.val(song.song);

			$('body').removeClass('song-dir-ltr')
				.removeClass('song-dir-rtl')
				.addClass('song-dir-' + song.direction);

			selectSong(song);
			showFields();
		})
		.success(function() {  })
		.error(function() {  })
		.complete(function() {  });

	}

	function deselectSong() {

		_selectedSong = null;
		_songs.find('.active').removeClass('active');
	}

	function selectSong(song) {

		var active = _songs.find('.active');
		active.removeClass('active');

		_selectedSong = song;
		_songs.find('button[data-song=' + song.key + ']').addClass('active');
	}

	function emptyFields() {

		_title.val('');
		_song.val('');
	}

	function showFields() {

		app.unload();

		_songs.hide();
		_fields.show();
		_back.show();
		_generate.show();
	}

	function showList() {

		app.unload();

		_fields.hide();
		_songs.show();
		_back.hide();
		_generate.hide();
	}

	function onChange(e) {

		deselectSong();
	}

	function onSubmit(e) {

		e.preventDefault();

		if (_selectedSong && _selectedSong.dictionary) {
			_gaq.push(["_trackEvent", "SongEditor", "FormSubmitted", "title=" + encodeURIComponent(_selectedSong.title)]);

			app.load({
				'title': _selectedSong.title,
				'source': _selectedSong.song,
				'dictionary': _selectedSong.dictionary,
				'direction': _selectedSong.direction,
				'editDictionary': true
			});
		} else {
			var title = _title.val(),
				song = _song.val(),
				dictionary;

			_gaq.push(["_trackEvent", "SongEditor", "FormSubmitted", "title=" + encodeURIComponent(title)]);

			if (!title && !song) {
				alert('יש להזין את כותרת ואת מילות השיר');
				return;
			}

			if (!title) {
				alert('יש להזין כותרת');
				return;
			}

			if (!song) {
				alert('יש להזין את מילות השיר');
				return;
			}

			app.generateDictionary({
				'title': title,
				'song': song, 
				'cb': function(dic) {
					dictionary = dic;

					app.load({
						'title': title,
						'source': song,
						'dictionary': dictionary,
						'dictionaryGenerated': true,
						'editDictionary': true
					});
				}
			});
		}
	}

	this.init();
};