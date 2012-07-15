Ambience.Image = function(node) {
	function play(audiovisual) {
		if ( audiovisual.hasImage ) {
			node.style.backgroundImage = 'url("' + audiovisual.imagePath + '")';
		}
		
		for ( var property in audiovisual.imageStyle ) {
			var cssValue = audiovisual.imageStyle[property];
			var cssProperty = 'background-' + property;
			node.style[cssProperty] = cssValue;
		}
	}
	
	function reset(audiovisual) {
		node.style.backgroundImage = '';
		
		if ( audiovisual && 'imageStyle' in audiovisual ) {
			for ( var property in audiovisual.imageStyle ) {
				var cssProperty = 'background-' + property;
				node.style[cssProperty] = '';
			}
		}
	}
	
	return {
		play: play,
		reset: reset
	};
};