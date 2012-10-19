var AdventureReader = function(app) {
	var self = this;
	
	self.read = function(file) {
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(event) {
			var config = JSON.parse(reader.result);
			load(config);
		};
	};
	
	var load = function(config) {
		var adventure = new AdventureViewModel(app);
		app.adventure(adventure);

		adventure.scenes.splice(0);
		var newScenes = config.scenes;
		newScenes.map(function(sceneConfig) {
			var newScene = adventure.newScene();
			Object.overlay(newScene, sceneConfig);
			loadMedia(newScene);
			adventure.scenes.push(newScene);
		});

		if ( adventure.scenes.length > 0 ) {
			adventure.select(adventure.scenes[0]);
		}
	};
	
	var loadMedia = function(scene) {
		if ( scene.image.path.length > 0 ) {
			scene.image.path = objectURLFromDataURL(scene.image.path);
		}
	};
};