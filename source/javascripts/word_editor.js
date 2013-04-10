var wordEditor = function() {

	var _onWordChanged,
		_onWordRemoved;

	function onEditorClick(e) {

		var editor = $(e.target);
		if (!editor.hasClass('edit')) {
			editor = $(editor.parents('.edit')[0]);
		}

		// Word editor is already visible.
		if (editor.hasClass('edit-word')) {
			return;
		}

		var input = editor.find('input'),
			word = editor.children('table');

		if (input.length == 0) {
			input = $('<input />');
			editor.find('tr td:last-child').append(input);
			
			input.bind('blur', function(e) {
				onBlur();
			});
			input.keypress(function(e){
				if (e.which == 13) {
					onBlur();
				}
			});
		}

		editor.addClass('edit-word');
		input.val(editor.find('tr td:last-child').text());
		input.focus();

		function onBlur() {

			editor.removeClass('edit-word');
			var val = input.val(),
				wordKey = editor.find('tr td:first-child').text();
			editor.find('tr td:last-child').html(val);
			_onWordChanged && _onWordChanged(wordKey, val);

			if (!word.data('hover')) {
				hideEditor(word);
			}
		}
	}

	function hideEditor(word) {

		// word's parent should be an editor. Otherwise, there's nothing to hide.
		var editor = word.parent();

		if (editor.hasClass('edit') && !editor.hasClass('edit-word')) {
			editor.find('input').remove();
			editor.find('.remove').remove();
			word.unwrap();
		}

	}

	return {

		show: function(settings) {

			var e = settings.event,
				onWordChanged = settings.onWordChanged,
				onWordRemoved = settings.onWordRemoved;

			_onWordChanged = onWordChanged;
			_onWordRemoved = onWordRemoved;

			var word, editor, remove;

			if (e.target.nodeName.toLowerCase() == 'table') {
				word = $(e.target);
			} else {
				word = $($(e.target).parents('table')[0]);
			}

			word.data('hover', true);

			if (word.parent().hasClass('edit')) {
				return;
			}

			word.wrap('<div class="edit"></div>');
			editor = word.parent();

			// create remove button.
			var remove = $('<span class="remove"></span>')
				.click(function(e){
					e.stopPropagation();

					var wordKey = word.find('tr td:first-child').text();

					hideEditor(word);
					word.remove();

					_onWordRemoved && _onWordRemoved(wordKey);
				});
			word.find('tr td:first-child').append(remove);
			//console.log('mouseover, editor class=' + editor[0].classList[0]);

			editor.bind('dblclick click', onEditorClick);

			editor.bind('mouseleave', function(e) {
				word.data('hover', false);
				hideEditor(word);
			});
		}

		// hide: function(e) {

		// 	var word;

		// 	if (e.target.nodeName.toLowerCase() == 'table') {
		// 		word = $(e.target);
		// 	} else {
		// 		word = $($(e.target).parents('table')[0]);
		// 	}

		// 	word.data('hover', false);

		// 	hideEditor(word);

		// }
	}

}();