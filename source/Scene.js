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
			var files = this.sound.tracks.map(function(track) { return track; });
			if ( this.image.file ) {
				files.push(this.image.file);
			}
			return files;
		}
	};
};