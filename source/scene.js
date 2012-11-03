Ambience.Scene = function() {
	return Object.create(Ambience.Scene.base);
};

Ambience.Scene.base = {
	layer: 'background',
	fadeDuration: 0,
	fadesIn: true,
	fadesOut: true,
	crossoverDuration: 0,
	soundOrder: 'linear',
	loops: true,
	backgroundColor: 'black',
	volume: 1,
	get isVisual() {
		return (
			this.image ||
			this.text
		);
	},
	get hasOnlySound() {
		return this.sounds && !this.isVisual;
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