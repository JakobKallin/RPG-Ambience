Ambience.Image = function(node) {
	var audiovisual;
	
	function play(newAudiovisual) {
		audiovisual = newAudiovisual;
		
		if ( audiovisual.hasImage ) {
			node.style.backgroundImage = 'url("' + audiovisual.imagePath + '")';
		}
		
		for ( var property in audiovisual.imageStyle ) {
			var cssValue = audiovisual.imageStyle[property];
			var cssProperty = 'background-' + property;
			node.style[cssProperty] = cssValue;
		}
	}
	
	function reset() {
		node.style.backgroundImage = '';
		
		if ( audiovisual && 'imageStyle' in audiovisual ) {
			for ( var property in audiovisual.imageStyle ) {
				var cssProperty = 'background-' + property;
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