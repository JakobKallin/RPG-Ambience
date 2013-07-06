// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.LocalBackend = function() {
	
};

Ambience.LocalBackend.prototype = {
	name: 'Local',
	imageLimit: Infinity,
	soundLimit: Infinity,
	login: function() {
		return when(Infinity);
	},
	loginAgain: function() {
		return when(Infinity);
	},
	downloadAdventures: function() {
		return when([Ambience.ExampleAdventure.json]);
	},
	// Media files, whose contents will not be used directly but rather through URLs.
	downloadMediaFile: function(id) {
		var exampleMedia = {
			'example:city': { name: 'ishtar_rooftop', type: 'image' },
			'example:dragon-image': { name: 'sintel-wallpaper-dragon', type: 'image' },
			'example:dragon-sound': { name: 'dragon', type: 'audio' },
			'example:music': { name: '9-Trailer_Music', type: 'audio' }
		};
		
		if ( exampleMedia[id] ) {
			var name = exampleMedia[id].name;
			var type = exampleMedia[id].type;
			if ( type === 'audio' && window.audioCanPlayType('audio/ogg') ) {
				var mimeType = 'audio/ogg';
				var extension = 'ogg';
			} else if ( type === 'audio' ) {
				var mimeType = 'audio/mpeg';
				var extension = 'mp3';
			} else {
				var mimeType = 'image/jpeg';
				var extension = 'jpg';
			}
			var url = 'example/' + name + '.' + extension;
			
			return when({
				id: id,
				url: url,
				name: name + '.' + extension,
				mimeType: mimeType
			});
		} else {
			throw new Error('Attempting to load a non-existing example media file.')
		}
	},
	uploadFile: function(file) {
		return when(null);
	},
	selectImageFile: function() {
		return this.selectFiles(false, 'image/*');
	},
	selectImageFileLabel: 'Select Image',
	selectSoundFiles: function() {
		return this.selectFiles(true, 'audio/*');
	},
	selectSoundFilesLabel: 'Add Tracks',
	selectFiles: function(multiple, mimeType) {
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
		
		var deferred = when.defer();
		return deferred.promise;
		
		function onFilesSelected(domFiles) {
			var files = Array.prototype.map.call(domFiles, function(domFile) {
				var objectURL = window.URL.createObjectURL(domFile)
				var id = objectURL.replace(/^blob:/, '');
				return {
					id: id,
					url: objectURL,
					name: domFile.name,
					mimeType: domFile.type
				};
			});
			
			if ( multiple ) {
				var promise = deferred.resolve(files);
			} else {
				var promise = deferred.resolve(files[0]);
			}
			
			promise.ensure(function() {
				// Make sure that the input is only removed after all files have been used.
				// If it's removed earlier, needed file references may disappear.
				document.body.removeChild(input);
			});
		}
	}
};