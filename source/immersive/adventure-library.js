var AdventureLibrary = function(app) {
	this.load = function() {
		var state = JSON.parse(localStorage.getItem('adventure'));
		if ( state ) {
			var adventure = app.adventure;
			adventure.scenes.clear();
			
			state.scenes.forEach(function(sceneState) {
				var scene = adventure.newScene();
				Object.overlay(scene, sceneState);
				adventure.scenes.push(scene);
				
				if ( scene.image.id ) {
					app.media.load(scene.image.id, function(url) {
						scene.image.path = url;
					});
				}
				
				scene.sound.tracks.forEach(function(track) {
					if ( track.id ) {
						app.media.load(track.id, function(url) {
							track.path = url;
						});
					}
				});
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
		
		// Keep temporary object URLs from being saved.
		state.scenes.forEach(function(scene) {
			if ( scene.image.id ) {
				scene.image.path = '';
			}
			
			scene.sound.tracks.forEach(function(track) {
				if ( track.id ) {
					track.path = '';
				}
			});
		});
		
		localStorage.setItem('adventure', JSON.stringify(state));
	};
};