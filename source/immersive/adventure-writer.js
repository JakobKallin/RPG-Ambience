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
	
	var writeToBrowser = function(json) {
		localStorage.adventure = json;
	};
	
	var writeToFile = function(json) {
		var base64 = window.btoa(json);
		app.adventureString(base64);
	};
	
	self.write = function(adventure) {
		var state = adventureState(adventure);
		var json = JSON.stringify(state);
		writeToBrowser(json);
		writeToFile(json);
	};
};