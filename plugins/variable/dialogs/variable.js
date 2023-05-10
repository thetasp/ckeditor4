
/**
 * @fileOverview Definition for variable plugin dialog.
 *
 */

'use strict';

CKEDITOR.dialog.add('variable', function (editor) {
	var lang = editor.lang.variable,
		generalLabel = editor.lang.common.generalTab;
	//validNameRegex = /^[^\[\]<>]+$/;

	return {
		title: lang.title,
		minWidth: 300,
		minHeight: 80,
		contents: [
			{
				id: 'info',
				label: generalLabel,
				title: generalLabel,
				elements: [
					// Dialog window UI elements.
					{
						id: 'varCode',
						type: 'text',
						style: 'width: 100%;',
						label: lang.varCode,
						'default': '',
						required: true,
						//validate: CKEDITOR.dialog.validate.regex( validNameRegex, lang.invalidName ),
						setup: function (widget) {
							this.setValue(widget.data.varCode);
						},
						commit: function (widget) {
							widget.setData('varCode', this.getValue());
						}
					}, {
						id: 'varMap',
						type: 'html',
						label: lang.varMapTree,
						html: '<div id="varMapTree"></div>',
						setup: function (widget) {
							var div = document.getElementById('varMapTree');
							if (widget.data.varMap) {
								var varCodes = [];
								div.innerHTML = '<p><label>' + lang.varMapTree + '</label></p><div class="varMapContent">'
									+ this.createTreeHtml(varCodes, widget.data.varMap, '', '') + '</div>';
								varCodes.forEach(function(code) {
									document.getElementById(code).onclick = function (e) {
										var dialog = CKEDITOR.dialog.getCurrent();
										dialog.getContentElement('info', 'varCode').setValue(code);
										dialog.getButton('ok').click();
									};
								})
							}
						},
						createTreeHtml: function (varCodes, value, pntKey, key) {
							var html = '';
							if (Array.isArray(value)) {
								if (key) {
									pntKey = pntKey ? pntKey + key : key
								}
								html += '<li class="variable-group">';
								html += key
								html += ': ';
								html += '<ul class="varMap">';
								var i = 0;
								value.forEach(function(item) {
									var k = '[' + i + ']';
									html += this.createTreeHtml(varCodes, item, pntKey, k);
									i++;
								})
								html += '</ul>';
								html += '</li>';
							}
							else if (value instanceof Object) {
								if (key) {
									html += '<li class="variable-group">';
									html += key
									html += ': ';
									pntKey = pntKey ? pntKey + key + "." : key + ".";
								}
								html += '<ul class="varMap">';
								var keys = Object.keys(value);
								keys.sort(function(a, b) {
									var _a = a.toLowerCase();
									var _b = b.toLowerCase();
									if (_a < _b) {
										return -1;
									}
									if (_a > _b) {
										return 1;
									}
									return 0;
								});
								keys.forEach(function(k) {
									var v = value[k];
									html += this.createTreeHtml(varCodes, v, pntKey, k)
								});
								html += '</ul>';
								if (key) {
									html += '</li>';
								}
							} else {
								var fullKey = pntKey + key;
								varCodes.push(fullKey);
								html += '<li class="variable-item">';
								html += '<a><span id="' + fullKey + '" class="variable">' + key + '</span></a>'
								html += ': ';
								html += value ? value : '-';
								html += '</li>';
							}
							return html;
						}
					}
				]
			}
		]
	};
});
