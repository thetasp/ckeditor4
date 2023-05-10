/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* exported CKBUILDER_CONFIG */

var CKBUILDER_CONFIG = {
	skin: 'moono-lisa',
	ignore: [
		'bender.js',
		'bender.ci.js',
		'.bender',
		'bender-err.log',
		'bender-out.log',
		'.travis.yml',
		'dev',
		'docs',
		'.DS_Store',
		'.editorconfig',
		'.gitignore',
		'.gitattributes',
		'.github',
		'gruntfile.js',
		'.idea',
		'.jscsrc',
		'.jshintignore',
		'.jshintrc',
		'less',
		'.mailmap',
		'.nvmrc',
		'node_modules',
		'package.json',
		'README.md',
		'tests'
	],
	plugins: {
		a11yhelp: 1, // need
		about: 1, // need
		basicstyles: 1, // need
		bidi: 1,
		blockquote: 1, // need
		clipboard: 1, // need
		colorbutton: 1,
		colordialog: 1,
		copyformatting: 1,
		contextmenu: 1, // need
		dialogadvtab: 1,
		div: 1,
		elementspath: 1, // need
		enterkey: 1, // need
		entities: 1, // need
		filebrowser: 1, // need
		find: 1,
		flash: 1,
		floatingspace: 1, // need
		font: 1,
		format: 1, // need
		forms: 1,
		horizontalrule: 1, // need
		htmlwriter: 1, // need
		iframe: 1,
		image: 1, // need
		indentlist: 1, // need
		indentblock: 1,
		justify: 1,
		language: 1,
		link: 1, // need
		list: 1, // need
		liststyle: 1,
		magicline: 1, // need
		maximize: 1, // need
		newpage: 1,
		pagebreak: 1,
		pastefromlibreoffice: 1,
		pastefromword: 1, // need
		pastetext: 1, // need
		editorplaceholder: 1,
		preview: 1,
		print: 1,
		removeformat: 1, // need
		resize: 1, // need
		save: 1,
		selectall: 1,
		showblocks: 1,
		showborders: 1, // need
		smiley: 1,
		sourcearea: 1, // need
		specialchar: 1, // need
		stylescombo: 1, // need
		tab: 1, // need
		table: 1, // need
		tableselection: 1, // need
		tabletools: 1, // need
		templates: 1,
		toolbar: 1, // need
		undo: 1, // need
		uploadimage: 1, // need
		wordcount: 1, // need
		wysiwygarea: 1, // need

		// to check
		// wsc : 1, // missing, EOL at 2021
		// scayt : 1, // missing, already builtin
	}
};
