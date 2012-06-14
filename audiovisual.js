Ambience.audiovisual = {};

Ambience.audiovisual.scene = {
	type: 'scene',
	fadeDuration: 0,
	soundOrder: 'linear',
	loops: true,
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
		return (
			this.imagePath !== undefined ||
			this.backgroundColor !== undefined ||
			this.text !== undefined
		);
	},
	get isAudial() {
		return this.soundPaths !== undefined;
	},
	get hasImage() {
		return this.imagePath !== undefined;
	},
	get hasBackgroundColor() {
		return this.backgroundColor !== undefined;
	},
	get hasText() {
		return this.text !== undefined;
	},
	get hasTextStyle() {
		return this.textStyle !== undefined;
	}
};

Ambience.audiovisual.effect = Object.create(Ambience.audiovisual.scene);
Ambience.audiovisual.effect.type = 'effect';
Ambience.audiovisual.effect.loops = false;

Ambience.audiovisual.fromConfig = function(config, templateList) {
	var audiovisual;
	var template;
	var templateName = config.template;
	
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
	
	audiovisual = Object.create(template);
	var read = {
		'type': function(value) {
			if ( value !== 'effect' ) {
				value = 'scene';
			}
			audiovisual.type = value;
		},
		'key': function(value) {
			audiovisual.key = value;
		},
		'name': function(value) {
			audiovisual.name = value;
		},
		'image': function(value) {
			audiovisual.imagePath = encodeURI(value);
		},
		'sound': function(value) {
			if ( !(value instanceof Array) ) {
				value = [value];
			}
			audiovisual.soundPaths = value.map(encodeURI);
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
		'fade': function(value) {
			audiovisual.fadeDuration = value * 1000;
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