Ambience.App.Adventure.upgradeConfig = function(config) {
	config.version = Number(config.version);
	while ( config.version < Ambience.App.Adventure.version ) {
		Ambience.App.Adventure.upgraders[config.version](config);
		config.version += + 1;
	}
};

Ambience.App.Adventure.upgraders = {
	1: function(config) {
		delete config.media;
		
		config.scenes.forEach(function(scene) {
			scene.background = { color: scene.background };
			
			scene.fade = {
				direction: scene.fadeDirection,
				duration: scene.fade
			};
			delete scene.fadeDirection;
			
			delete scene.media;
			
			scene.image.file = {
				id: scene.image.id,
				name: scene.image.name
			};
			delete scene.image.id;
			delete scene.image.name;
			delete scene.image.path;
			
			scene.sound.tracks.forEach(function(track) {
				delete track.isPlayable;
				delete track.path;
			});
		});
	}
};