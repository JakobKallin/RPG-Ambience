// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.LocalLibrary = function() {
	var self = this;
	
	self.adventures = [];
	self.adventures.load = function(onAllAdventuresLoaded) {
		var exampleJSON = Ambience.App.Adventure.exampleJSON;
		var exampleAdventureConfig = JSON.parse(exampleJSON);
		var exampleAdventure = Ambience.App.Adventure.fromConfig(exampleAdventureConfig);
		self.adventures.push(exampleAdventure);
		onAllAdventuresLoaded(self.adventures);
	};
	
	self.adventures.save = function() {};
	
	self.media = new Ambience.App.LocalLibrary.MediaLibrary();
};

Ambience.App.LocalLibrary.prototype = {
	onExit: function() {},
	name: 'This computer'
};

Ambience.App.LocalLibrary.MediaLibrary = function() {};
Ambience.App.LocalLibrary.MediaLibrary.prototype = (function() {
	var mediaURLs = {
		'example:city': 'example/ishtar_rooftop.jpg',
		'example:dragon-image': 'example/sintel-wallpaper-dragon.jpg',
		'example:dragon-sound': 'example/dragon.ogg',
		'example:music': 'example/9-Trailer_Music.ogg'
	};
	
	function load(id, onMediaLoaded) {
		if ( mediaURLs[id] ) {
			window.setTimeout(function() {
				onMediaLoaded({
					id: id,
					url: mediaURLs[id]
				});
			});
		}
	}
	
	function selectImage(onImageLoaded) {
		selectFiles(onImageLoaded, false, 'image/*');
	}
	selectImage.label = 'Select Image';
	
	function selectTracks(onTrackLoaded) {
		selectFiles(onTrackLoaded, true, 'audio/*');
	}
	selectTracks.label = 'Add Tracks';
	
	function selectFiles(onMediaLoaded, multiple, mimeType) {
		// We create a new file input on every click because we want a change event even if we select the same file.
		var input = document.createElement('input');
		input.type = 'file';
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
			Array.prototype.forEach.call(files, function(file) {
				var objectURL = window.URL.createObjectURL(file)
				var id = objectURL.replace(/^blob:/, '');
				var media = {
					id: id,
					url: objectURL,
					name: file.name,
					type: file.mimeType
				};
				onMediaLoaded(media)
			});
			
			// Make sure that the input is only removed after all files have been used.
			// If it's removed earlier, needed file references may disappear.
			document.body.removeChild(input);
		}
	}
	
	return {
		load: load,
		selectImage: selectImage,
		selectTracks: selectTracks,
		loadAdventure: function() {}
	};
})();