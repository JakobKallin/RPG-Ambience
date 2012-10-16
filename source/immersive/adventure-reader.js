var AdventureReader = function(editor) {
	var self = this;
	
	self.readFromFile = function(file) {
		editor.adventureFileName(file.name);
		
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(loadEvent) {
			var config = JSON.parse(loadEvent.target.result);
			load(config);
		};
	};
	
	self.readFromBrowser = function() {
		if ( localStorage.adventure ) {
			var config = JSON.parse(localStorage.adventure);
			load(config);
		}
	};
	
	Object.defineProperty(self, 'browserHasAdventure', {
		get: function() {
			return (
				'localStorage' in window &&
				'adventure' in window.localStorage
			);
		}
	});
	
	var load = function(config) {
		var adventure = new AdventureViewModel(editor);
		editor.adventure(adventure);
		
		adventure.scenes.splice(0);
		var newScenes = config.scenes;
		newScenes.map(function(sceneConfig) {
			var newScene = adventure.newScene();
			Object.overlay(newScene, sceneConfig);
			adventure.scenes.push(newScene);
		});
		
		if ( adventure.scenes.length > 0 ) {
			adventure.select(adventure.scenes[0]);
		}
	};
};