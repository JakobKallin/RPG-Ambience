// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.MediaFile = function() {
	this.id = null;
	this.url = null;
	this.previewUrl = null;
	this.name = null;
	this.mimeType = null;
	
	this.progress = 0;
	
	// This property is used to know which files can be removed from the media queue (those that haven't begun loading at all).
	this.hasBegunLoading = false;
};

Ambience.MediaFile.fromConfig = function(config) {
	var file = new Ambience.MediaFile();
	Object.overlay(file, config);
	return config;
};