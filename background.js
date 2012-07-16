Ambience.Background = function(node) {
	var audiovisual;
	
	function play(newAudiovisual) {
		audiovisual = newAudiovisual;
		
		if ( audiovisual.hasBackgroundColor ) {
			node.style.backgroundColor = audiovisual.backgroundColor;
		}
	}
	
	function reset() {
		audiovisual = null;
	}
	
	return {
		play: play,
		reset: reset
	};
};