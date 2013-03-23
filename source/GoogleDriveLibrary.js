Ambience.App.GoogleDriveLibrary = function() {
	var adventures = [];
	adventures.haveLoaded = false;
	adventures.load = function(onLoad) {
		if ( adventures.haveLoaded ) {
			return;
		}
		
		console.log('Loading adventures from Google Drive.');
		
		adventures.haveLoaded = true;
	};
	
	return {
		adventures: adventures
	};
};