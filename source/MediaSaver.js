// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

self.onmessage = function(messageEvent) {
	var message = messageEvent.data;
	var id = message.id;
	var file = message.file;
	
	var reader = new FileReaderSync();
	var dataURL = reader.readAsDataURL(file);
	self.postMessage({
		id: id,
		dataURL: dataURL
	});
};