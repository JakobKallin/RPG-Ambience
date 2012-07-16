Ambience.Text = function(node) {
	var audiovisual;
	
	function play(newAudiovisual) {
		
	}
	
	function reset() {
		node.textContent = '';
		
		if ( audiovisual && audiovisual.hasTextStyle ) {
			for ( var cssProperty in audiovisual.textStyle ) {
				node.style[cssProperty] = '';
			}
		}
	}
	
	return {
		play: play,
		reset: reset
	};
};