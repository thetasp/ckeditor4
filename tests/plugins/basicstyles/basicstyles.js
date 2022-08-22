/* bender-tags: editor */
/* bender-ckeditor-plugins: basicstyles,toolbar */

bender.editor = {
	config: {
		autoParagraph: false
	}
};

var isNotGeckoOrIe = !CKEDITOR.env.gecko && !CKEDITOR.env.ie;

bender.test( {
	'test apply range style across input element': function() {
		var bot = this.editorBot;
		bot.editor.filter.allow( 'input[type]' );
		bot.setHtmlWithSelection( 'te[xt<input type="button" />te]xt' );
		bot.execCommand( 'bold' );
		assert.areSame( 'te<strong>xt<input type="button" />te</strong>xt', bot.getData( false, true ) );
	},

	// (#2294)
	'test apply bold to content with HTML comments': function() {
		var bot = this.editorBot;
		bender.tools.testInputOut( 'html-comments-bold', function( inputHtml, expectedHtml ) {
			bot.setHtmlWithSelection( inputHtml );
			bot.execCommand( 'bold' );

			assert.beautified.html( expectedHtml, bot.editor.getData() );
		} );
	},

	// (#5215)
	'test toggle subscript and superscript on selected text': function() {
		bender.editorBot.create( {
			name: 'editor-subsup1',
			config: {
				coreStyles_disallowSubscriptSuperscript: true
			}
		}, function( bot ) {
			var editor = bot.editor;

			bot.setHtmlWithSelection( '<p>[foo] bar</p>' );
			editor.execCommand( 'subscript' );
			assert.areSame(
				'<p><sub>foo</sub> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no added subscript element' );

			editor.execCommand( 'superscript' );
			assert.areSame(
				'<p><sup>foo</sup> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There both subscript and superscript elements' );
		} );
	},

	// (#5215)
	'test properly toggle subscript and superscript on selected text with other basic styles': function() {
		bender.editorBot.create( {
			name: 'editor-subsup2',
			config: {
				coreStyles_disallowSubscriptSuperscript: true
			}
		}, function( bot ) {
			var editor = bot.editor;

			bot.setHtmlWithSelection( '<p>[foo] bar</p>' );
			editor.execCommand( 'bold' );
			editor.execCommand( 'subscript' );
			assert.areSame(
				'<p><sub><strong>foo</strong></sub> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no added subscript element' );

			editor.execCommand( 'superscript' );
			assert.areSame(
				'<p><sup><strong>foo</strong></sup> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There both subscript and superscript elements' );
		} );
	},

	// (#5215)
	'test toggle subscript and superscript on selected text create proper undo and redo step': function() {
		bender.editorBot.create( {
			name: 'editor-subsup3',
			config: {
				extraPlugins: 'undo',
				coreStyles_disallowSubscriptSuperscript: true
			}
		}, function( bot ) {
			var editor = bot.editor;

			bot.setHtmlWithSelection( '<p>[foo] bar</p>' );
			editor.execCommand( 'subscript' );
			assert.areSame(
				'<p><sub>foo</sub> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no added subscript element' );

			editor.execCommand( 'superscript' );
			assert.areSame(
				'<p><sup>foo</sup> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There both subscript and superscript elements' );

			editor.execCommand( 'undo' );
			assert.areSame(
				'<p><sub>foo</sub> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'Undo step is incorrect' );

			editor.execCommand( 'redo' );
			assert.areSame(
				'<p><sup>foo</sup> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'Redo step is incorrect' );

		} );
	},

	// (#5215)
	'test toggle subscript and superscript not disappear selection': function() {
		bender.editorBot.create( {
			name: 'editor-subsup4',
			config: {
				coreStyles_disallowSubscriptSuperscript: true
			}
		}, function( bot ) {
			var editor = bot.editor;

			bot.setHtmlWithSelection( '<p>[foo] bar</p>' );
			editor.execCommand( 'subscript' );
			assert.areSame(
				'<p><sub>foo</sub> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no added subscript element' );

			editor.execCommand( 'superscript' );
			assert.areSame(
				'<p><sup>foo</sup> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There both subscript and superscript elements' );

			var selection = editor.getSelection(),
				range = selection.getRanges()[ 0 ],
				selectedContent = range.extractContents();

			assert.areSame( 'foo', selectedContent.getHtml(), 'Selected content is incorrect' );
		} );
	},

	// (#5215)
	'test toggle subscript and superscript contain only one active UI button': function() {
		bender.editorBot.create( {
			name: 'editor-subsup5',
			config: {
				coreStyles_disallowSubscriptSuperscript: true
			}
		}, function( bot ) {
			var editor = bot.editor;

			bot.setHtmlWithSelection( '<p>[foo] bar</p>' );
			editor.execCommand( 'subscript' );
			assert.areSame(
				'<p><sub>foo</sub> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no added subscript element' );


			editor.execCommand( 'superscript' );
			assert.areSame(
				'<p><sup>foo</sup> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There both subscript and superscript elements' );

			var	subscriptButtonState = editor.ui.get( 'Subscript' ).getState(),
				superscriptButtonState = editor.ui.get( 'Superscript' ).getState();

			assert.areSame( subscriptButtonState, CKEDITOR.TRISTATE_OFF, 'Subscript button is not active' );
			assert.areSame( superscriptButtonState, CKEDITOR.TRISTATE_ON, 'Superscript button is active' );
		} );
	},

	'test allow add subscript and superscript at the same time in the default editor config': function() {
		bender.editorBot.create( {
			name: 'editor-subsup6'
		}, function( bot ) {
			var editor = bot.editor;

			bot.setHtmlWithSelection( '<p>[foo] bar</p>' );
			editor.execCommand( 'subscript' );
			assert.areSame(
				'<p><sub>foo</sub> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no added subscript element' );

			editor.execCommand( 'superscript' );
			assert.areSame(
				'<p><sup><sub>foo</sub></sup> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no subscript and superscript element' );
		} );
	},

	'test allow add subscript and superscript at the same time when coreStyles_disallowSubscriptSuperscript: false': function() {
		bender.editorBot.create( {
			name: 'editor-subsup7',
			config: {
				coreStyles_disallowSubscriptSuperscript: false
			}
		}, function( bot ) {
			var editor = bot.editor;

			bot.setHtmlWithSelection( '<p>[foo] bar</p>' );
			editor.execCommand( 'subscript' );
			assert.areSame(
				'<p><sub>foo</sub> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no added subscript element' );

			editor.execCommand( 'superscript' );
			assert.areSame(
				'<p><sup><sub>foo</sub></sup> bar</p>',
				editor.editable().getData( isNotGeckoOrIe ),
				'There is no subscript and superscript element' );
		} );
	}
} );
