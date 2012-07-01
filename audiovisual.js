Ambience.audiovisual = {};

Ambience.audiovisual.scene = {
	type: 'scene',
	fadeDuration: 0,
	fadesIn: true,
	fadesOut: true,
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
	get hasSound() {
		return this.soundPaths !== undefined;
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
	}
};

Ambience.audiovisual.effect = Object.create(Ambience.audiovisual.scene);
Ambience.audiovisual.effect.type = 'effect';
Ambience.audiovisual.effect.loops = false;

Ambience.audiovisual.fromConfig = function(config, templateList, basePath) {
	var audiovisual;
	var template;
	var templateName = config.template;
	
	if ( !basePath ) {
		basePath = '';
	}
	
	if ( templateName === undefined ) {
		if ( config.type === 'effect' ) {
			template = Ambience.audiovisual.effect;
		} else {
			template = Ambience.audiovisual.scene;
		}
	} else if ( templateName in templateList ) {
		template = templateList[templateName];
	} else {
		throw new Error('There is no template named ' + templateName + '.');
	}
	
	var effectivePath = function(path) {
		return basePath + path;
	};
	
	audiovisual = Object.create(template);
	var read = {
		'type': function(value) {
			if ( value !== 'effect' ) {
				value = 'scene';
			}
			audiovisual.type = value;
		},
		'key': function(value) {
			audiovisual.key = String(value);
		},
		'name': function(value) {
			audiovisual.name = String(value);
		},
		'image': function(value) {
			audiovisual.imagePath = encodeURI(effectivePath(value));
		},
		'sound': function(value) {
			if ( !(value instanceof Array) ) {
				value = [value];
			}
			audiovisual.soundPaths = value.map(effectivePath).map(encodeURI);
		},
		'sound-order': function(value) {
			audiovisual.soundOrder = value;
		},
		'loop': function(value) {
			// The difference between "loop" and "loops" is intentional.
			audiovisual.loops = value;
		},
		'background': function(value) {
			audiovisual.backgroundColor = value;
		},
		'text': function(value) {
			audiovisual.text = value;
		},
		'text-style': function(value) {
			if ( template.hasTextStyle ) {
				audiovisual.textStyle = Object.create(template.textStyle);
			} else {
				audiovisual.textStyle = {};
			}
			
			for ( var property in value ) {
				audiovisual.textStyle[property] = value[property];
			}
		},
		'video': function(value) {
			if ( !(value instanceof Array) ) {
				value = [value];
			}
			audiovisual.videoPaths = value.map(effectivePath).map(encodeURI);
		},
		'video-order': function(value) {
			audiovisual.videoOrder = value;
		},
		'fade': function(value) {
			audiovisual.fadeDuration = value * 1000;
		},
		'fade-in': function(value) {
			audiovisual.fadesIn = value;
		},
		'fade-out': function(value) {
			audiovisual.fadesOut = value;
		},
		'volume': function(value) {
			audiovisual.volume = value;
		},
		'image-delay': function(value) {
			audiovisual.imageDelay = value * 1000;
		}
	};
	
	// Because names and keys are used to select audiovisuals, we don't want to inherit them from templates. They are simply set to undefined, and might be redefined in the loop below.
	audiovisual.name = undefined;
	audiovisual.key = undefined;
	
	for ( var property in read ) {
		var value = config[property];
		
		if ( value !== undefined ) {
			var callback = read[property];
			callback(value);
		}
	}
	
	return audiovisual;
}