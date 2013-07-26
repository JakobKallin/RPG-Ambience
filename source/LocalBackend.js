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
		var file = new Ambience.BackendFile();
		file.id = 'example';
		file.name = 'Example adventure.ambience';
		file.mimeType = 'application/json';
		file.contents = Ambience.ExampleAdventure.json;
		return when([file]);
	},
	// Media files, whose contents will not be used directly but rather through URLs.
	downloadMediaFile: function(file) {
		throw new Error('Attempting to load non-example file from local backend');
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
		
		// This should be before the call to `click`.
		// It makes more sense semantically, and IE10 seems to require it.
		var deferred = when.defer();
		input.addEventListener('change', function(event) {
			onFilesSelected(event.target.files);
		});
		
		input.click();
		
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