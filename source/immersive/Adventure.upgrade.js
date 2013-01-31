Adventure.prototype.upgrade = function() {
	Adventure.upgraders[this.version].call(this);
};

Adventure.upgraders = {
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

for ( var version in Adventure.upgraders ) {
	var upgrader = Adventure.upgraders[version];
	Adventure.upgraders[version] = function() {
		upgrader.call(this, arguments);
		this.version = Number(version) + 1;
	};
}