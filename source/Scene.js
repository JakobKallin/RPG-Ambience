// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Scene = function() {
	return {
		name: '',
		key: '',
		layer: 'background',
		mixin: false,
		fade: {
			duration: 0,
			direction: 'in out'
		},
		get isForeground() {
			return this.layer === 'foreground'
		},
		
		background: new Ambience.App.Scene.Background(),
		image: new Ambience.App.Scene.Image(),
		sound: new Ambience.App.Scene.Sound(),
		text: new Ambience.App.Scene.Text(),
		
		get media() {
			// We use this convoluted code because concat does not work as expected on array-like objects.
			var tracks = this.sound.tracks.map(function(track) { return track; });
			if ( this.image.id || this.image.url ) {
				tracks.push(this.image);
			}
			return tracks;
		},
		
		// State
		get isSelected() {
			return this === self.current;
		},
		
		onFilesDropped: function(viewModel, dropEvent) {
			dropEvent.preventDefault();
			
			var files = dropEvent.dataTransfer.files;
			for ( var i = 0; i < files.length; ++i ) {
				this.load(files[i]);
			}
		},
		
		onDrag: function(viewModel, dragEvent) {
			dragEvent.preventDefault();
			dragEvent.dataTransfer.dropEffect = 'copy';
		},
		
		load: function(file) {
			if ( file.name.match(/\.(wav|mp3|ogg|webm|aac)$/i) ) {
				this.sound.load(file);
			} else if ( file.name.match(/\.(jpg|jpeg|gif|png|bmp|svg)$/i) ) {
				this.image.load(file);
			}
		}
	};
};