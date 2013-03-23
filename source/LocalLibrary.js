Ambience.App.LocalLibrary = function() {
	var adventures = [];
	adventures.haveLoaded = false;
	adventures.load = function(onLoad) {
		if ( adventures.haveLoaded ) {
			return;
		}
		
		for ( var i = 0; i < localStorage.length; ++i ) {
			var config = JSON.parse(localStorage.getItem(i));
			var adventure = Ambience.App.Adventure.fromConfig(config);
			this.push(adventure);
			onLoad(adventure);
		}
		
		adventures.haveLoaded = true;
	};
	
	return {
		adventures: adventures
	};
};