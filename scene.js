Ambience.scene = {};

Ambience.scene.scene = {
	type: 'scene',
	fadeDuration: 0,
	fadesIn: true,
	fadesOut: true,
	crossfadeDuration: 0,
	soundOrder: 'linear',
	loops: true,
	backgroundColor: 'black',
	volume: 1,
	imageDelay: 0,
	get hasName() {
		return this.name !== undefined;
	},
	get hasKey() {
		return this.key !== undefined;
	},
	get isScene() {
		return this.type === 'scene';
	},
	get isEffect() {
		return this.type === 'effect';
	},
	get isVisual() {
		// backgroundColor should be in this, but it makes sound-only effects block the scene. Will be fixed.
		return (
			this.imagePath !== undefined ||
			this.videoPaths !== undefined ||
			this.text !== undefined
		);
	},
	get isAudial() {
		return this.soundPaths !== undefined;
	},
	get hasImage() {
		return this.imagePath !== undefined;
	},
	get hasVideo() {
		return this.videoPaths !== undefined;
	},
	get hasOnlyVideo() {
		return (
			!this.hasImage &&
			!this.hasSound &&
			!this.hasText
		);
	},
	get hasSound() {
		return this.soundPaths !== undefined;
	},
	get hasOnlySound() {
		return (
			!this.hasImage &&
			!this.hasVideo &&
			!this.hasText
		);
	},
	get hasBackgroundColor() {
		return this.backgroundColor !== undefined;
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
	get crossfadeDurationMillis() {
		return this.crossfadeDuration * 1000;
	}
};

Ambience.scene.effect = Object.create(Ambience.scene.scene);
Ambience.scene.effect.type = 'effect';
Ambience.scene.effect.loops = false;

Ambience.scene.fromConfig = function(config, templateList, basePath) {
	var scene;
	var template;
	var templateName = config.template;
	
	if ( !basePath ) {
		basePath = '';
	}
	
	if ( templateName === undefined ) {
		if ( config.type === 'effect' ) {
			template = Ambience.scene.effect;
		} else {
			template = Ambience.scene.scene;
		}
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
		'type': function(value) {
			if ( value !== 'effect' ) {
				value = 'scene';
			}
			scene.type = value;
		},
		'key': function(value) {
			scene.key = String(value);
		},
		'name': function(value) {
			scene.name = String(value);
		},
		'image': function(value) {
			scene.imagePath = encodeURI(effectivePath(value));
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
			scene.soundPaths = value.map(effectivePath).map(encodeURI);
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
			if ( !(value instanceof Array) ) {
				value = [value];
			}
			scene.videoPaths = value.map(effectivePath).map(encodeURI);
		},
		'video-order': function(value) {
			scene.videoOrder = value;
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
		'crossfade': function(value) {
			scene.crossfadeDuration = value;
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