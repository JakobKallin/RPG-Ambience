// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Scene.Image = function() {
	return {
		file: null,
		size: 'contain'
	};
};

Ambience.App.Scene.Image.fromConfig = function(config) {
	var image = new Ambience.App.Scene.Image();
	Object.overlay(image, config);
	if ( config.file ) {
		image.file = Ambience.MediaFile.fromConfig(config.file);
	}
	return image;
};