// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

AmbienceStage.Scene = function(media) {
	var self = this;

	self.fade = {
		in: 0,
		out: 0
	};

	media = media || [];
	media.forEach(function(name) {
		self[name.toLowerCase()] = new AmbienceStage.Scene[name]();
	});
};


AmbienceStage.Scene.prototype = {
	// This is needed to hide the scene from showing when it has neither image
	// nor text. If we didn't do this, all scenes (which have a black background
	// by default) would cover elements below the stage in the DOM tree (such as
	// other stages).
	get isVisual() {
		return Boolean(
			this.image ||
			this.text
		);
	},
	// This is needed to be able to automatically end audio-only scenes (such as
	// sound effects) once the sound has stopped playing. If this isn't done,
	// users would have to issue a "stop" command in order to stop a scene that
	// is no longer visible or audible (and thus for all practical purposes does
	// not exist).
	get hasOnlySound() {
		return Boolean(
			this.sound &&
			!this.isVisual
		);
	}
};

AmbienceStage.Scene.Sound = function() {
	// Shouldn't there be an empty "tracks" array created here?
};
AmbienceStage.Scene.Sound.prototype = {
	overlap: 0,
	shuffle: false,
	loop: true,
	volume: 1,
	get overlapMillis() {
		return this.overlap * 1000;
	}
};

AmbienceStage.Scene.Image = function() {};
AmbienceStage.Scene.Image.prototype = {
	url: null
};
AmbienceStage.Scene.Text = function() {};
AmbienceStage.Scene.Text.prototype = {
	string: null
};

AmbienceStage.Scene.Background = function() {};
AmbienceStage.Scene.Background.prototype = {
	color: 'black'
};
