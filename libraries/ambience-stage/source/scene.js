// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Scene = function(media) {
	var self = this;

	self.fade = {
		in: 0,
		out: 0
	};

	media = media || [];
	media.forEach(function(name) {
		self[name.toLowerCase()] = new Ambience.Scene[name]();
	});
};


Ambience.Scene.prototype = {
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

Ambience.Scene.Sound = function() {};
Ambience.Scene.Sound.prototype = {
	overlap: 0,
	shuffle: false,
	loop: true,
	volume: 1,
	get overlapMillis() {
		return this.overlap * 1000;
	}
};

Ambience.Scene.Image = function() {};
Ambience.Scene.Image.prototype = {
	url: null
};
Ambience.Scene.Text = function() {};
Ambience.Scene.Text.prototype = {
	string: null
};

Ambience.Scene.Background = function() {};
Ambience.Scene.Background.prototype = {
	color: 'black'
};
