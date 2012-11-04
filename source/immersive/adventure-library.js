var AdventureLibrary = function(app) {
	this.load = function() {
		var state = JSON.parse(localStorage.getItem('adventure'));
		if ( state ) {
			var adventure = new AdventureViewModel(app);
			app.adventure = adventure; // Needs to be called before select(), for some unknown reason.
			
			state.scenes.forEach(function(sceneState) {
				var scene = adventure.newScene();
				Object.overlay(scene, sceneState);
				adventure.scenes.push(scene);
			});
			
			if ( adventure.scenes.length > 0 ) {
				adventure.select(adventure.scenes[0]);
			}
			
			return true;
		} else {
			return false;
		}
	};
	
	this.save = function(adventure) {
		var state = {
			scenes: adventure.scenes.map(function(scene) {
				return scene.copyState();
			})
		};
		localStorage.setItem('adventure', JSON.stringify(state));
	};
};