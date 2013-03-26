// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.GoogleDriveLibrary = function() {
	var self = this;
	
	self.adventures = [];
	self.adventures.load = function(onLoad) {
		console.log('Loading adventures from Google Drive.');
	};
	
	self.media = new Ambience.App.GoogleDriveLibrary.MediaLibrary();
};

Ambience.App.GoogleDriveLibrary.prototype.onExit = function() {
	return 'Google Drive library received the exit signal';
};

Ambience.App.GoogleDriveLibrary.MediaLibrary = function() {
	var self = this;
	
	self.loadAdventure = function(adventure, onMediaLoad) {
		console.log('Loading media for adventure ' + adventure.title + ' from Google Drive');
	};
	
	self.loadScene = function(scene, onMediaLoad) {
		console.log('Loading media for scene ' + scene.name + ' from Google Drive');
	};
	
	self.loadMedia = function(id, onSuccess) {
		console.log('Loading media ' + id + ' from Google Drive');
	};
	
	self.saveMedia = function(id, file, onSave) {
		console.log('Saving media ' + id + ' to Google Drive');
	};
};



Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectImage = function(onLoad) {
	console.log('Selecting image from Google Drive');
};

Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectTracks = function(onLoad) {
	console.log('Selecting tracks from Google Drive');
};

Ambience.App.GoogleDriveLibrary.MediaLibrary.prototype.selectFiles = function(onLoad, multiple, mimeType) {
};