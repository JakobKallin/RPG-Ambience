Ambience.Adventure.prototype.upgrade = function() {
	Ambience.Adventure.upgraders[this.version].call(this);
};

Object.defineProperty(Ambience.Adventure.prototype, 'isObsolete', {
	get: function() {
		return this.version < Ambience.Adventure.version;
	}
});

Ambience.Adventure.upgraders = {
	1: function() {
		delete this.media;
		
		this.scenes.forEach(function(scene) {
			scene.background = { color: scene.background };
			
			scene.fade = {
				in: scene.fadeDirection.contains('in') ? scene.fade : 0,
				out: scene.fadeDirection.contains('out') ? scene.fade : 0
			};
			delete scene.fadeDirection;
			
			delete scene.media;
			
			scene.sound.tracks.forEach(function(track) {
				delete track.isPlayable;
			});
		});
	}
};

for ( var version in Ambience.Adventure.upgraders ) {
	var upgrader = Ambience.Adventure.upgraders[version];
	Ambience.Adventure.upgraders[version] = function() {
		upgrader.call(this, arguments);
		this.version = Number(version) + 1;
	};
}