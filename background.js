Ambience.Background = function(node) {
	var audiovisual;
	var defaultBackground = document.body.style.backgroundColor;
	
	function play(newAudiovisual) {
		audiovisual = newAudiovisual;
		
		if ( audiovisual.hasBackgroundColor ) {
			node.style.backgroundColor = audiovisual.backgroundColor;
		}
	}
	
	function reset() {
		node.style.backgroundColor = defaultBackground;
		
		audiovisual = null;
	}
	
	return {
		play: play,
		reset: reset
	};
};