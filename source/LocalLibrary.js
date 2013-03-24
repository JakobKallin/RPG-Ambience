Ambience.App.LocalLibrary = function() {
	var self = this;
	
	self.adventures = [];
	self.adventures.haveLoaded = false;
	self.adventures.load = function(onLoad) {
		if ( self.adventures.haveLoaded ) {
			return;
		}
		
		for ( var i = 0; i < localStorage.length; ++i ) {
			var config = JSON.parse(localStorage.getItem(i));
			var adventure = Ambience.App.Adventure.fromConfig(config);
			this.push(adventure);
			onLoad(adventure);
		}
		
		self.adventures.haveLoaded = true;
	};
};

Ambience.App.LocalLibrary.prototype.selectImage = function(onLoad) {
	this.selectFiles(onFilesLoad, 'image/*');
	
	function onFilesLoad(files) {
		var file = files[0];
		var objectURL = window.URL.createObjectURL(file);
		var id = objectURL.replace(/^blob:/, '');
		
		onLoad({
			name: file.name,
			url: objectURL,
			id: id
		});
	}
};

Ambience.App.LocalLibrary.prototype.selectTracks = function(onLoad) {
	this.selectFiles(onFilesLoad, 'audio/*');
	
	function onFilesLoad(files) {
		Array.prototype.forEach.call(files, function(file) {
			var objectURL = window.URL.createObjectURL(file)
			var id = objectURL.replace(/^blob:/, '');
			
			onLoad({
				name: file.name,
				url: objectURL,
				id: id,
				mimeType: file.type
			});
		});
	}
};

Ambience.App.LocalLibrary.prototype.selectFiles = function(onLoad, mimeType) {
	// We create a new file input on every click because we want a change event even if we select the same file.
	var input = document.createElement('input');
	input.type = 'file';
	input.multiple = true;
	if ( mimeType ) {
		input.accept = mimeType;
	}
	
	// We need to actually insert the node for IE10 to accept the click() call below.
	input.style.display = 'none';
	document.body.appendChild(input);
	
	// This should be before the call to click.
	// It makes more sense semantically, and IE10 seems to require it.
	input.addEventListener('change', function(event) {
		onLoad(event.target.files);
	});
	
	input.click();
	document.body.removeChild(input);
};