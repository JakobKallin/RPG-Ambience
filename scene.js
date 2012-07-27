Ambience.scene = {};

Ambience.scene.base = {
	layer: 'background',
	fadeDuration: 0,
	fadesIn: true,
	fadesOut: true,
	crossoverDuration: 0,
	crossfades: false,
	soundOrder: 'linear',
	loops: true,
	backgroundColor: 'black',
	volume: 1,
	imageDelay: 0,
	get hasKey() {
		return this.key !== undefined;
	},
	get isScene() {
		return this.type === 'scene';
	},
	get isVisual() {
		// backgroundColor should be in this, but it makes sound-only effects block the scene. Should be fixed.
		return (
			this.image ||
			this.videoPath !== undefined ||
			this.text !== undefined
		);
	},
	get hasVideo() {
		return this.videoPath !== undefined;
	},
	get hasOnlyVideo() {
		return (
			!this.image &&
			!this.sounds &&
			!this.hasText
		);
	},
	get hasOnlySound() {
		return (
			!this.image &&
			!this.hasVideo &&
			!this.hasText
		);
	},
	get hasText() {
		return this.text !== undefined;
	},
	get hasTextStyle() {
		return this.textStyle !== undefined;
	},
	get fadeInDuration() {
		if ( this.fadesIn ) {
			return this.fadeDuration;
		} else {
			return 0;
		}
	},
	get fadeOutDuration() {
		if ( this.fadesOut ) {
			return this.fadeDuration;
		} else {
			return 0;
		}
	},
	get crossoverDurationMillis() {
		return this.crossoverDuration * 1000;
	}
};

Ambience.scene.fromConfig = function(config, templateList, basePath) {
	var scene;
	var template;
	var templateName = config.template;
	
	if ( !basePath ) {
		basePath = '';
	}
	
	if ( templateName === undefined ) {
		template = Ambience.scene.base;
	} else if ( templateName in templateList ) {
		template = templateList[templateName];
	} else {
		throw new Error('There is no template named ' + templateName + '.');
	}
	
	var effectivePath = function(path) {
		return basePath + path;
	};
	
	scene = Object.create(template);
	var read = {
		'layer': function(value) {
			if ( value !== 'foreground' ) {
				value = 'background';
			}
			scene.layer = value;
		},
		'key': function(value) {
			scene.key = String(value);
		},
		'name': function(value) {
			scene.name = String(value);
		},
		'image': function(value) {
			scene.image = encodeURI(effectivePath(value));
		},
		'image-style': function(value) {
			if ( template.imageStyle ) {
				scene.imageStyle = Object.create(template.imageStyle);
			} else {
				scene.imageStyle = {};
			}
			
			for ( var property in value ) {
				scene.imageStyle[property] = value[property];
			}
		},
		'sound': function(value) {
			if ( !(value instanceof Array) ) {
				value = [value];
			}
			scene.sounds = value.map(effectivePath).map(encodeURI);
		},
		'sound-order': function(value) {
			scene.soundOrder = value;
		},
		'loop': function(value) {
			// The difference between "loop" and "loops" is intentional.
			scene.loops = value;
		},
		'background': function(value) {
			scene.backgroundColor = value;
		},
		'text': function(value) {
			scene.text = value;
		},
		'text-style': function(value) {
			if ( template.hasTextStyle ) {
				scene.textStyle = Object.create(template.textStyle);
			} else {
				scene.textStyle = {};
			}
			
			for ( var property in value ) {
				scene.textStyle[property] = value[property];
			}
		},
		'video': function(value) {
			scene.videoPath = encodeURI(effectivePath(value));
		},
		'fade': function(value) {
			scene.fadeDuration = value * 1000;
		},
		'fade-in': function(value) {
			scene.fadesIn = value;
		},
		'fade-out': function(value) {
			scene.fadesOut = value;
		},
		'volume': function(value) {
			scene.volume = value;
		},
		'image-delay': function(value) {
			scene.imageDelay = value * 1000;
		},
		'crossover': function(value) {
			scene.crossoverDuration = value;
		},
		// The difference between "crossfade" and "crossfades" is intentional.
		'crossfade': function(value) {
			scene.crossfades = value;
		}
	};
	
	// Because names and keys are used to select scenes, we don't want to inherit them from templates. They are simply set to undefined, and might be redefined in the loop below.
	scene.name = undefined;
	scene.key = undefined;
	
	for ( var property in read ) {
		var value = config[property];
		
		if ( value !== undefined ) {
			var callback = read[property];
			callback(value);
		}
	}
	
	return scene;
}