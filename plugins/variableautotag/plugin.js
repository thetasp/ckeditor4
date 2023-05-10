/**
 * Copyright (c) 2014-2018, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 *
 * @fileOverview The "variableautotag" plugin. A customized plugin built by theta.
 * Refer to: https://docs.ckeditor.com/ckeditor4/docs/#!/guide/dev_autocomplete.html tutorial.
 */

'use strict';

(function () {

	// Register the plugin in the editor.
	CKEDITOR.plugins.add('variableautotag', {
		requires: 'autocomplete,textmatch,variable',

		init: function (editor) {
			editor.on('instanceReady', function () {
				var config = {};
				// The itemsArray variable is the example "database".
				var itemsArrayInited = false;
				var itemsArray = initItemArray();


				// Called when the user types in the editor or moves the caret.
				// The range represents the caret position.
				function textTestCallback(range) {
					// You do not want to autocomplete a non-empty selection.
					if (!range.collapsed) {
						return null;
					}

					// Use the text match plugin which does the tricky job of performing
					// a text search in the DOM. The "matchCallback" function should return
					// a matching fragment of the text.
					return CKEDITOR.plugins.textMatch.match(range, matchCallback);
				}

				// Returns the position of the matching text.
				// It matches a word starting from the '$' character
				// up to the caret position.
				function matchCallback(text, offset) {
					// Get the text before the caret.
					var left = text.slice(0, offset),
						// Will look for a '#' character followed by a ticket number.
						match = left.match(/\$[\w.\[\]]*$/);

					if (!match) {
						return null;
					}
					return {
						start: match.index,
						end: offset
					};
				}

				config.textTestCallback = textTestCallback;

				function initItemArray() {
					var varMap = editor.config.varMap;
					var _itemsArray = [];
					if (varMap) {
						add2ItemArray(_itemsArray, varMap, '', '')
						//sort by id (case insensitive)
						_itemsArray.sort(function (a, b) {
							var _a = a.id.toLowerCase();
							var _b = b.id.toLowerCase();
							if (_a < _b) {
								return -1;
							}
							if (_a > _b) {
								return 1;
							}
							return 0;
						});
						itemsArrayInited = true;
					}
					return _itemsArray;
				}

				function add2ItemArray(itemsArray, value, pntKey, key) {
					if (Array.isArray(value)) {
						if (key) {
							pntKey = pntKey ? pntKey + key : key
						}
						for (var i = 0; i < value.length; i++) {
							var k = '[' + i + ']';
							var item = value[1];
							add2ItemArray(itemsArray, item, pntKey, k);
						}
					}
					else if (value instanceof Object) {
						if (key) {
							pntKey = pntKey ? pntKey + key + "." : key + ".";
						}
						var objectKey = Object.keys(value);
						for (var i = 0; i < objectKey.length; i++) {
							var k = objectKey[i];
							let v = value[k];
							add2ItemArray(itemsArray, v, pntKey, k)
						}
					} else {
						let fullKey = pntKey + key;
						itemsArray.push({
							id: fullKey,
							name: value ? value : '-'
						})
					}
				}

				// Returns (through its callback) the suggestions for the current query.
				function dataCallback(matchInfo, callback) {
					if (!itemsArrayInited) {
						itemsArray = initItemArray();
					}
					// Remove the '#' tag.
					var query = matchInfo.query.substring(1);

					// Simple search.
					// Filter the entire items array so only the items that start
					// with the query remain.
					var MAX = 5; //return only the first 10 items which match
					var i = 0;
					var suggestions = itemsArray.filter(function (item) {
						if (String(item.id).toLowerCase().indexOf(query.toLowerCase()) == 0 && i < MAX) {
							i++;
							return true;
						}
						return false;
					});
					// Note: The callback function can also be executed asynchronously
					// so dataCallback can do an XHR request or use any other asynchronous API.
					callback(suggestions);
				}

				config.dataCallback = dataCallback;

				// Define the templates of the autocomplete suggestions dropdown and output text.
				config.itemTemplate = '<li data-id="{id}"><span class="variable">{id}</span>: {name}</li>';
				config.outputTemplate = '<span class="variable" data-cke-survive=1>{id}</span>';

				// Attach autocomplete to the editor.
				new CKEDITOR.plugins.autocomplete(editor, config);
			});
		}
	});
})();
