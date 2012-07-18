Ambience.Adventure = function() {
	return {
		scenes: [],
		templates: []
	};
};

Ambience.Adventure.loadFromFile = function(file, callbacks) {
	try {
		var reader = new FileReader();
		reader.onload = function() {
			try {
				callbacks.onFileRead(this.result);
				var adventure = Ambience.Adventure.fromString(this.result);
				callbacks.onAdventureLoaded(adventure);
			} catch (error) {
				callbacks.onError(error);
			}
		};
		reader.readAsText(file);
	} catch (error) {
		alert(error.message);
	}
};

Ambience.Adventure.fromString = function(string) {
	var config = jsyaml.load(string);
	return Ambience.Adventure.fromConfig(config);
};

Ambience.Adventure.fromConfig = function(config) {
	var adventure = new Ambience.Adventure();
	var basePath = config['base-path'];
	
	for ( var templateName in config.templates ) {
		var templateConfig = config.templates[templateName];
		adventure.templates[templateName] = Ambience.scene.fromConfig(templateConfig, adventure.templates, basePath);
	}
	
	if ( config.scenes !== undefined ) {
		adventure.scenes = config.scenes.map(function(sceneConfig) {
			return Ambience.scene.fromConfig(sceneConfig, adventure.templates, basePath);
		});
	}
	
	return adventure;
};