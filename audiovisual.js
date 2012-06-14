Ambience.audiovisual = {};

Ambience.audiovisual.base = {
	type: 'scene',
	fadeDuration: 0,
	soundOrder: 'linear',
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

Ambience.audiovisual.fromConfig = function(config, templateList) {
	var audiovisual;
	var template;
	var templateName = config.template;
	
	if ( templateName === undefined ) {
		template = Ambience.audiovisual.base;
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