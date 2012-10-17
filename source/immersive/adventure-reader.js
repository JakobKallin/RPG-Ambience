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
			loadMedia(newScene);
			adventure.scenes.push(newScene);
		});
		
		if ( adventure.scenes.length > 0 ) {
			adventure.select(adventure.scenes[0]);
		}
		
		removeUnusedMedia(adventure);
	};
	
	var loadMedia = function(scene) {
		loadImage(scene);
		loadSounds(scene);
	};
	
	var loadImage = function(scene) {
		var id = scene.image.id;
		if ( id.length > 0 ) {
			scene.image.path = ''; // We don't want to load an old object URL; a new one will be added from IndexedDB.
			
			editor.database
			.transaction('media', 'readonly')
			.objectStore('media')
			.get(id).onsuccess = function(event) {
				var dataURL = event.target.result;
				scene.image.path = objectURLFromDataURL(dataURL);
			};
		}
	};
	
	var loadSounds = function(scene) {
		scene.sound.tracks.map(function(track) {
			var id = track.id;
			track.path = ''; // We don't want to load an old object URL; a new one will be added from IndexedDB.
			
			editor.database
			.transaction('media', 'readonly')
			.objectStore('media')
			.get(id).onsuccess = function(event) {
				var dataURL = event.target.result;
				track.path = objectURLFromDataURL(dataURL);
			};
		});
	};
	
	var removeUnusedMedia = function(adventure) {
		editor.database
		.transaction('media', 'readonly')
		.objectStore('media')
		.openCursor()
		.onsuccess = function(event) {
			var cursor = event.target.result;
			if ( cursor ) {
				var id = cursor.key;
				if ( !adventureContainsMedia(adventure, id) ) {
					editor.removeMedia(id);
				}
				cursor.continue();
			}
		};
	};
	
	var adventureContainsMedia = function(adventure, targetID) {
		return adventure.scenes.some(function(scene) {
			return sceneContainsMedia(scene, targetID);
		});
	};
	
	var sceneContainsMedia = function(scene, targetID) {
		return (
			scene.image.id === targetID ||
			scene.sound.tracks.some(function(track) {
				return track.id === targetID
			})
		);
	};
};