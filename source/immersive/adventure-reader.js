var AdventureReader = function(editor) {
	var self = this;
	
	self.read = function(file) {
		editor.adventureFileName(file.name);
		
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(loadEvent) {
			var config = JSON.parse(loadEvent.target.result);
			load(config);
		};
	};
	
	var load = function(config) {
		var adventure = new AdventureViewModel(editor);
		editor.adventure(adventure);
		
		adventure.scenes.splice(0);
		var newScenes = config.scenes;
		newScenes.map(function(sceneConfig) {
			var newScene = adventure.newScene();
			Object.overlay(newScene, sceneConfig);
			
			if ( sceneConfig.image.dataURL ) {
				// Only properties already in the base are overlaid, so explicitly add the data URL.
				newScene.image.dataURL = sceneConfig.image.dataURL;
				newScene.image.path = objectURLFromDataURL(newScene.image.dataURL);
			}
			
			newScene.sound.files.map(function(file) {
				file.path = objectURLFromDataURL(file.dataURL);
			});
			
			adventure.scenes.push(newScene);
		});
		
		if ( adventure.scenes.length > 0 ) {
			adventure.select(adventure.scenes[0]);
		}
	};
};