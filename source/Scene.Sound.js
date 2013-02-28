// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Scene.Sound = function() {
	return {
		tracks: [],
		loop: true,
		shuffle: false,
		volume: 100,
		overlap: 0,
		onSelected: function(viewModel, selectEvent) {
			var newFiles = selectEvent.target.files;
			for ( var i = 0; i < newFiles.length; ++i ) {
				this.load(newFiles[i]);
			}
		},
		load: function(file) {
			var objectURL = window.URL.createObjectURL(file)
			var id = objectURL.replace(/^blob:/, '');
			
			var sound = this;
			// This is to make sure the file object isn't removed.
			var fileName = file.name;
			var fileType = file.type;
			
			var onSaved = function() {
				sound.tracks.push({
					name: fileName,
					path: objectURL,
					id: id,
					isPlayable: Boolean(
						document.createElement('audio').canPlayType(fileType)
					)
				});
			};
			
			app.media.save(id, file, onSaved);
		},
		unload: function(track) {
			this.tracks.remove(track);
		}
	};
}