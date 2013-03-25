// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

self.onmessage = function(event) {
	var message = event.data;
	var reader = new FileReaderSync();
	var url = reader.readAsDataURL(message.file);
	self.postMessage({
		id: message.id,
		url: url
	});
};