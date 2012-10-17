var MediaLibrary = function(app) {
	var self = this;
	
	self.dataURLs = {};
	
	self.addDataURL = function(id, dataURL) {
		self.dataURLs[id] = dataURL;
		app.database
			.transaction('media', 'readwrite')
			.objectStore('media')
			.put(dataURL, id);
	};
	
	self.addFile = function(id, file) {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function() {
			var dataURL = reader.result;
			self.addDataURL(id, dataURL);
		};
	};
	
	self.remove = function(id) {
		delete self.dataURLs[id];
		app.database
			.transaction('media', 'readwrite')
			.objectStore('media')
			.delete(id);
	};
};