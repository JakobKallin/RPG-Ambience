// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.LocalLibrary = function() {
	var self = this;
	
	self.adventures = [];
	self.adventures.load = function(onAllAdventuresLoaded) {
		var adventures = [];
		for ( var i = 0; i < localStorage.length; ++i ) {
			var config = JSON.parse(localStorage.getItem(i));
			var adventure = Ambience.App.Adventure.fromConfig(config);
			adventures.push(adventure);
		}
		
		// Simply calling forEach on self.adventures.push gives this error: "Array.prototype.push called on null or undefined".
		adventures.forEach(function(adventure) {
			self.adventures.push(adventure);
		});
		onAllAdventuresLoaded(self.adventures);
		
		var usedMedia = this.map(get('media')).flatten();
		var usedIds = usedMedia.map(get('id'));
		self.media.init(usedIds);
	};
	
	self.adventures.save = function() {
		console.log('Saving adventures to local storage');
		
		// Save old JSON if something goes wrong when saving new JSON.
		var oldJSON = new Array(localStorage.length);
		for ( var i = 0; i < localStorage.length; ++i ) {
			oldJSON[i] = localStorage.getItem(i);
		}
		
		try {
			localStorage.clear();
			this.forEach(function(adventure, index) {
				var config = adventure.toConfig();
				var json = angular.toJson(config);
				localStorage.setItem(index, json);
			});
		} catch(error) {
			// Restore old JSON, since something went wrong.
			localStorage.clear();
			for ( var i = 0; i < oldJSON.length; ++i ) {
				localStorage.setItem(i, oldJSON[i]);
			}
			
			throw error;
		}
	};
	
	self.media = new Ambience.App.LocalLibrary.MediaLibrary();
};

Ambience.App.LocalLibrary.prototype.onExit = function() {
	try {
		this.adventures.save();
	} catch(error) {
		return 'There was an error saving your adventure:\n\n' + error.message;
	}
	
	if ( this.media.isSaving ) {
		return 'There are currently media files being saved. If you exit now, you risk losing data.';
	}
};

Ambience.App.LocalLibrary.MediaLibrary = function() {
	var self = this;
	
	self.db = null;
	
	self.init = function(usedIds) {
		var request = indexedDB.open('media');
		
		request.onupgradeneeded = function(event) {
			var db = event.target.result;
			if ( !db.objectStoreNames.contains('media') ) {
				db.createObjectStore('media');
			}
		};
		
		request.onsuccess = function(event) {
			console.log('IndexedDB has loaded');
			
			self.db = event.target.result;
			adventuresToLoad.forEach(function(descriptor) {
				self.loadAdventure(descriptor.adventure, descriptor.onMediaLoad);
			});
			adventuresToLoad.length = 0;
			
			self.removeUnusedMedia(usedIds);
		};
	};
	
	var adventuresToLoad = [];
	var loadedAdventures = [];
	self.loadAdventure = function(adventure, onMediaLoad) {
		if ( loadedAdventures.contains(adventure) ) {
			console.log(
				'Not loading media for adventure "' +
				adventure.title +
				'"; it has already been loaded'
			);
			return;
		}
		
		if ( self.db ) {
			console.log('Loading media for adventure "' + adventure.title + '"');
			adventure.scenes.forEach(function(scene) {
				self.loadScene(scene, onMediaLoad);
			});
			loadedAdventures.push(adventure);
		} else {
			console.log('Delaying load of adventure "' + adventure.title + '" until IndexedDB has loaded')
			adventuresToLoad.push({
				adventure: adventure,
				onMediaLoad: onMediaLoad
			});
		}
	};
	
	self.loadScene = function(scene, onMediaLoad) {
		scene.media.forEach(function(media) {
			self.loadMedia(media.id, function(objectURL) {
				media.url = objectURL;
				media.thumbnail = objectURL;
				onMediaLoad(media);
			});
		});
	};
	
	self.loadMedia = function(id, onSuccess) {
		console.log('Loading media: ' + id);
		
		self.db.transaction('media', 'readonly')
		.objectStore('media')
		.get(id)
		.onsuccess = function(event) {
			var dataURL = event.target.result;
			var objectURL = self.objectURLFromDataURL(dataURL);
			var mimeType = self.mimeTypeFromDataURL(dataURL);
			
			onSuccess(objectURL, mimeType);
			
			console.log('Done loading media: ' + id);
		};
	};
	
	var readWorker = new Worker('source/MediaReader.js');
	var mediaBeingSaved = {};
	var saveListeners = {};
	
	self.saveMedia = function(id, file, onSave) {
		console.log('Saving media: ' + id);
		
		mediaBeingSaved[id] = {
			id: id,
			name: file.name,
			mimeType: file.type
		};
		saveListeners[id] = onSave;
		
		readWorker.postMessage({
			id: id,
			file: file
		});
	};
	
	readWorker.onmessage = function(event) {
		var message = event.data;
		var id = message.id;
		var dataURL = message.url;
		
		self.db.transaction('media', 'readwrite')
		.objectStore('media')
		.put(dataURL, id)
		.onsuccess = function() {
			console.log('Done saving media: ' + id);
			
			var media = mediaBeingSaved[id];
			var objectURL = objectURLFromDataURL(dataURL);
			media.url = objectURL;
			media.thumbnail = objectURL;
			
			var listener = saveListeners[id];
			listener(media);
			
			delete mediaBeingSaved[id];
			delete saveListeners[id];
		};
	};
	
	self.objectURLFromDataURL = function(dataURL) {
		var base64 = dataURL.substring(dataURL.indexOf(',') + 1);
		var byteString = atob(base64);
		
		var buffer = new ArrayBuffer(byteString.length);
		var integers = new Uint8Array(buffer);
		for ( var i = 0; i < byteString.length; ++i ) {
			integers[i] = byteString.charCodeAt(i);
		}
		
		var mimeType = self.mimeTypeFromDataURL(dataURL);
		var blob = new Blob([integers], { type: mimeType });
		var objectURL = window.URL.createObjectURL(blob);
		
		return objectURL;
	};
	
	self.mimeTypeFromDataURL = function(dataURL) {
		return dataURL.substring(dataURL.indexOf(':') + 1, dataURL.indexOf(';'));
	};
	
	Object.defineProperty(self, 'isSaving', {
		get: function() {
			var isSaving = false;
			for ( var id in mediaBeingSaved ) {
				isSaving = true;
			}
			
			return isSaving;
		}
	});
	
	self.removeUnusedMedia = function(usedIds) {
		console.log('Starting to remove unused media from IndexedDB...')
		
		var store = self.db.transaction('media', 'readwrite').objectStore('media');
		var mediaCount = 0;
		var removedCount = 0;
		
		store.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if ( cursor ) {
				mediaCount += 1;
				var id = cursor.key;
				if ( !usedIds.contains(id) ) {
					console.log('Removing media: ' + id);
					store.delete(id);
					removedCount += 1;
				} else {
					console.log('Retaining media: ' + id);
				}
				cursor.continue();
			} else {
				console.log('Removed ' + removedCount + ' of ' + mediaCount + ' media from IndexedDB');
			}
		};
	};
};

Ambience.App.LocalLibrary.MediaLibrary.prototype.selectImage = function(onLoad) {
	this.selectFiles(onLoad, false, 'image/*');
};
Ambience.App.LocalLibrary.MediaLibrary.prototype.selectImage.label = 'Select Image';

Ambience.App.LocalLibrary.MediaLibrary.prototype.selectTracks = function(onLoad) {
	this.selectFiles(onLoad, true, 'audio/*');
};
Ambience.App.LocalLibrary.MediaLibrary.prototype.selectTracks.label = 'Select Tracks';

Ambience.App.LocalLibrary.MediaLibrary.prototype.selectFiles = function(onLoad, multiple, mimeType) {
	var self = this;
	
	// We create a new file input on every click because we want a change event even if we select the same file.
	var input = document.createElement('input');
	input.type = 'file';
	// If the argument is undefined, the value should be true.
	input.multiple = multiple;
	input.accept = mimeType;
	
	// We need to actually insert the node for IE10 to accept the click() call below.
	input.style.display = 'none';
	document.body.appendChild(input);
	
	// This should be before the call to click.
	// It makes more sense semantically, and IE10 seems to require it.
	input.addEventListener('change', function(event) {
		onFilesSelected(event.target.files);
	});
	
	input.click();
	
	function onFilesSelected(files) {
		// Make sure that the input is only removed after all files have been used.
		// If it's removed earlier, needed file references may disappear.
		var remaining = files.length;
		var modifiedOnLoad = function(media) {
			onLoad(media);
			remaining -= 1;
			
			if ( remaining === 0 ) {
				console.log('Saved ' + files.length + ' media; removing file input');
				document.body.removeChild(input);
			}
		}
		
		Array.prototype.forEach.call(files, function(file) {
			var objectURL = window.URL.createObjectURL(file)
			var id = objectURL.replace(/^blob:/, '');
			
			self.saveMedia(id, file, modifiedOnLoad);
		});
	}
};