Ambience.SoundList = function(node, stopScene) {
	var scene;
	var trackIndex;
	var sounds = [];
	
	function play(newScene) {
		scene = newScene;
		trackIndex = -1; // -1 because the index is either incremented or randomized in the playNextTrack method.
		playNextTrack();
	}
	
	function playNextTrack() {
		if ( scene.soundOrder === 'random' ) {
			trackIndex = scene.soundPaths.randomIndex();
		} else {
			trackIndex = (trackIndex + 1) % scene.soundPaths.length;
		}
		
		var trackPath = scene.soundPaths[trackIndex];
		var sound = new Ambience.Sound(trackPath, scene.volume);
		sound.play(0, playNextTrack);
		sounds.push(sound);
	}
	
	function stop() {
		sounds.map(function(sound) { sound.abort(); });
	}
	
	return {
		play: play,
		stop: stop
	};
};