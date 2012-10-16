var AdventureWriter = function(editor) {
	var self = this;
	
	var adventureState = function(adventure) {
		var state = {
			scenes: adventure.scenes.map(function(scene) {
				return scene.copyState();
			})
		};
		
		state.scenes.map(function(scene) {
			// Object URLs are only valid for the session, so do not serialize them.
			// Data URLs are still serialized, so we use them later when deserializing.
			delete scene.image.path;
			scene.sound.files.map(function(file) {
				delete file.path;
			});
		});
		
		return state;
	};
	
	self.write = function(adventure) {
		var state = adventureState(adventure);
		var json = JSON.stringify(state);
		var base64 = window.btoa(json);
		editor.adventureString(base64);
	};
};