// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

self.onmessage = function(messageEvent) {
	var message = messageEvent.data;
	var id = message.id;
	var dataURL = message.dataURL;
	
	var base64 = dataURL.substring(dataURL.indexOf(',') + 1);
	var byteString = atob(base64);
	var mimeType = dataURL.substring(dataURL.indexOf(':') + 1, dataURL.indexOf(';'));
	
	var buffer = new ArrayBuffer(byteString.length);
	var integers = new Uint8Array(buffer);
	for ( var i = 0; i < byteString.length; ++i ) {
		integers[i] = byteString.charCodeAt(i);
	}
	var blob = new Blob([integers], { type: mimeType });
	
	self.postMessage({
		id: id,
		blob: blob
	});
};