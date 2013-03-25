// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Scene.Image = function() {
	return {
		url: null,
		name: null,
		id: null,
		size: 'contain'
		// onSelected: function(viewModel, changeEvent) {
		// 	var file = changeEvent.target.files[0];
		// 	if ( file ) {
		// 		this.load(file);
		// 	};
		// },
		// load: function(file) {
		// 	var objectURL = window.URL.createObjectURL(file);
		// 	var id = objectURL.replace(/^blob:/, '');
			
		// 	var scene = this;
		// 	var fileName = file.name; // This is to make sure the file object isn't removed.
		// 	var onSaved = function() {
		// 		scene.name = fileName;
		// 		scene.url = objectURL;
		// 		scene.id = id;
		// 	};
			
		// 	app.media.save(id, file, onSaved);
		// },
		// unload: function() {
		// 	this.url = '';
		// 	this.name = '';
		// 	this.id = '';
		// }
	};
}