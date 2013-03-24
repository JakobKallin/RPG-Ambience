Ambience.App.GoogleDriveLibrary = function() {
	var self = this;
	
	self.adventures = [];
	self.adventures.haveLoaded = false;
	self.adventures.load = function(onLoad) {
		if ( self.adventures.haveLoaded ) {
			return;
		}
		
		console.log('Loading adventures from Google Drive.');
		
		self.adventures.haveLoaded = true;
	};
};