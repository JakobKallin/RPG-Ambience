Ambience.Background = function(node) {
	var audiovisual;
	
	function play(newAudiovisual) {
		audiovisual = newAudiovisual;
	}
	
	function reset() {
		audiovisual = null;
	}
	
	return {
		play: play,
		reset: reset
	};
};