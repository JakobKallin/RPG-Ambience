var AdventureWriter = function(app) {
	var self = this;
	
	var adventureState = function(adventure) {
		var state = {
			scenes: adventure.scenes.map(function(scene) {
				return scene.copyState();
			})
		};
		
		return state;
	};
	
	var writeToBrowser = function(linkedJSON) {
		localStorage.adventure = linkedJSON;
	};
	
	var writeToFile = function(state) {
		// We cannot use IndexedDB IDs in files; we include all the media data instead.
		state.scenes.map(function(scene) {
			// Change the temporary object URL into a permanent data URL.
			scene.image.path = app.library.dataURLs[scene.image.path];
			delete scene.image.id; // Do not save the ID, because it's not useful outside the current browser.
			
			// Same process for every track.
			scene.sound.tracks.map(function(track) {
				track.path = app.library.dataURLs[track.path];
				delete track.id;
			});
		});
		
		var json = JSON.stringify(state);
		var blob = new Blob([json], { type: 'application/json' });
		var objectURL = window.URL.createObjectURL(blob);
		app.adventureUrl(objectURL);
	};
	
	var previousLinkedJSON;
	self.write = function(adventure) {
		var state = adventureState(adventure);
		var linkedJSON = JSON.stringify(state);
		
		// If the generated JSON is the same as last time, we don't need to do anything more.
		if ( linkedJSON !== previousLinkedJSON ) {
			writeToBrowser(linkedJSON);
			writeToFile(state);
			previousLinkedJSON = linkedJSON;
		}
	};
};