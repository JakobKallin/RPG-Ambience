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
	get isVisual() {
		return Boolean(
			this.image ||
			this.text
		);
	},
	get hasOnlySound() {
		return Boolean(
			this.sound &&
			!this.isVisual
		);
	}
};

AmbienceStage.Scene.Sound = function() {};
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
