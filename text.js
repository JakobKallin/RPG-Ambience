Ambience.Text = function(node) {
	var audiovisual;
	
	function play(newAudiovisual) {
		audiovisual = newAudiovisual;
		
		if ( audiovisual.hasText ) {
			node.textContent = audiovisual.text;
			for ( var cssProperty in audiovisual.textStyle ) {
				var cssValue = audiovisual.textStyle[cssProperty];
				node.style[cssProperty] = cssValue;
			}
		}
	}
	
	function reset() {
		node.textContent = '';
		
		if ( audiovisual && audiovisual.hasTextStyle ) {
			for ( var cssProperty in audiovisual.textStyle ) {
				node.style[cssProperty] = '';
			}
		}
		
		audiovisual = null;
	}
	
	return {
		play: play,
		reset: reset
	};
};