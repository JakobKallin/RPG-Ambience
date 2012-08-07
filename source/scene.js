Ambience.Scene = function() {
	return Object.create(Ambience.Scene.base);
};

Ambience.Scene.base = {
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
	get isVisual() {
		// backgroundColor should be in this, but it makes sound-only effects block the scene. Should be fixed.
		return (
			this.image ||
			this.video ||
			this.text
		);
	},
	get hasOnlySound() {
		return (
			!this.image &&
			!this.video &&
			!this.text
		);
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