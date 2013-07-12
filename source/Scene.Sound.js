// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Scene.Sound = function() {
	var tracks = [];
	
	return {
		tracks: tracks,
		loop: true,
		shuffle: false,
		volume: 100,
		overlap: 0
	};
}

Ambience.App.Scene.Sound.fromConfig = function(config) {
	var sound = new Ambience.App.Scene.Sound();
	Object.overlay(sound, config);
	sound.tracks = config.tracks.map(function(trackConfig) {
		return new Ambience.MediaFile.fromConfig(trackConfig);
	});
	return sound;
};