/**
 * @fileOverview The "variable" plugin. Modified from placeholder plugin
 *
 */

'use strict';

( function() {
	CKEDITOR.plugins.add( 'variable', {
		requires: 'widget,dialog',
		lang: 'en', // %REMOVE_LINE_CORE%
		icons: 'variable', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		onLoad: function() {
			// Register styles for variable widget frame.
			var css = '.variable {font: inherit; color: green;}'
			+ ' ul.varMap { list-style: none; }'
			+ ' li.variable-group:before { content: "-"; margin-right: 4px; }'
			+ ' li.variable-item:before { content: "\\00a0"; margin-right: 4px; }'
			+ ' li.variable-item > a > span.variable {cursor: pointer}'
			+ ' li.variable-group > ul { margin-left: 10px; margin-bottom: 4px; }'
			+ ' div.varMapContent { padding: 10px; border: solid 1px #cccccc; margin-top: 4px; overflow-y: scroll; height: 300px;}';
			CKEDITOR.addCss(css);

		},
		init: function( editor ) {
			var cls = 'variable';
			var lang = editor.lang.variable;

			// Register dialog.
			CKEDITOR.dialog.add( 'variable', this.path + 'dialogs/variable.js' );

			// Put ur init code here.
			editor.widgets.add( 'variable', {
				// Widget code.
				dialog: 'variable',
				pathName: lang.pathName,
				// We need to have wrapping element, otherwise there are issues in
				// add dialog.
				template: '<span class="' + cls + '" style="display:inline-block" data-cke-survive=1></span>',

				downcast: function(el) {
                    //return new CKEDITOR.htmlParser.text( this.data.varCode );
                    el.setHtml(this.data.varCode);
                    // Remove style display:inline-block.
					var attrs = el.attributes;
					attrs.style = attrs.style.replace( /display:\s?inline-block;?\s?/, '' );
					if ( attrs.style === '' )
						delete attrs.style;

					return el;
                },

                upcast: function( el ) {
					if ( !( el.name == 'span' && el.hasClass( cls ) ) )
						return;

					// Add style display:inline-block to have proper height of widget wrapper and mask.
					var attrs = el.attributes;

					if ( attrs.style )
						attrs.style += ';display:inline-block';
					else
						attrs.style = 'display:inline-block';

					// Add attribute to prevent deleting empty span in data processing.
					attrs[ 'data-cke-survive' ] = 1;


					return el;
				},

				init: function() {
					this.setData( 'varCode', this.element.getText());
					this.setData( 'varMap', editor.config['varMap']);
				},

				data: function() {
					this.element.setText( this.data.varCode );
				},

				getLabel: function() {
					return this.editor.lang.widget.label.replace( /%1/, this.data.varCode + ' ' + this.pathName );
				}
			} );

			editor.ui.addButton && editor.ui.addButton( 'InsertVariable', {
				label: lang.toolbar,
				command: 'variable',
				toolbar: 'insert',
				icon: 'variable'
			} );
		},

		afterInit: function( editor ) {
			var placeholderReplaceRegex = /\[\[([^\[\]])+\]\]/g;

			editor.dataProcessor.dataFilter.addRules( {
				text: function( text, node ) {
					var dtd = node.parent && CKEDITOR.dtd[ node.parent.name ];

					// Skip the case when placeholder is in elements like <title> or <textarea>
					// but upcast placeholder in custom elements (no DTD).
					if ( dtd && !dtd.span )
						return;

					return text.replace( placeholderReplaceRegex, function( match ) {
						// Creating widget code.
						var widgetWrapper = null,
							innerElement = new CKEDITOR.htmlParser.element( 'span', {
								'class': 'variable'
							} );

						// Adds placeholder identifier as innertext.
						innerElement.add( new CKEDITOR.htmlParser.text( match ) );
						widgetWrapper = editor.widgets.wrapElement( innerElement, 'variable' );

						// Return outerhtml of widget wrapper so it will be placed
						// as replacement.
						return widgetWrapper.getOuterHtml();
					} );
				}
			} );
		}
	} );

} )();

