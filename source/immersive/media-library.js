// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

var MediaLibrary = function(db) {
	var self = this;
	
	var loadWorker = new Worker('source/immersive/media-loader.js');
	var loadListeners = {};
	
	self.load = function(id, onSuccess) {
		db.transaction('media', 'readonly')
		.objectStore('media')
		.get(id)
		.onsuccess = function(successEvent) {
			var dataURL = successEvent.target.result;
			
			var base64 = dataURL.substring(dataURL.indexOf(',') + 1);
			var byteString = atob(base64);
			var mimeType = dataURL.substring(dataURL.indexOf(':') + 1, dataURL.indexOf(';'));
			
			var buffer = new ArrayBuffer(byteString.length);
			var integers = new Uint8Array(buffer);
			for ( var i = 0; i < byteString.length; ++i ) {
				integers[i] = byteString.charCodeAt(i);
			}
			var blob = new Blob([integers], { type: mimeType });
			var objectURL = window.URL.createObjectURL(blob);
			
			onSuccess(objectURL, mimeType);
		};
		
		console.log('Loading media: ' + id);
	};
	
	loadWorker.onmessage = function(messageEvent) {
		var message = messageEvent.data;
		var id = message.id;
		var blob = message.blob;
		var objectURL = window.URL.createObjectURL(blob);
		
		loadListeners[id](objectURL);
		delete loadListeners[id];
	};
	
	var saveWorker = new Worker('source/immersive/media-saver.js');
	self.save = function(id, file) {
		saveWorker.postMessage({
			id: id,
			file: file
		});
		
		console.log('Saving media: ' + id);
	};
	
	saveWorker.onmessage = function(messageEvent) {
		var message = messageEvent.data;
		var id = message.id;
		var dataURL = message.dataURL;
		
		db.transaction('media', 'readwrite')
		.objectStore('media')
		.put(dataURL, id);
	};
	
	self.removeUnusedMedia = function(usedIds) {
		var store = db.transaction('media', 'readwrite').objectStore('media');
		var mediaCount = 0;
		var removedCount = 0;
		
		store.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if ( cursor ) {
				++mediaCount;
				var id = cursor.key;
				if ( !usedIds.contains(id) ) {
					console.log('Removing media: ' + id);
					store.delete(id);
					++removedCount;
				} else {
					console.log('Retaining media: ' + id);
				}
				cursor.continue();
			} else {
				console.log('Removed ' + removedCount + ' of ' + mediaCount + ' media');
			}
		};
	};
};