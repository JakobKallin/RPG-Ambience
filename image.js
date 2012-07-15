Ambience.Image = function(imageNode) {
	function play(audiovisual) {
		if ( audiovisual.hasImage ) {
			imageNode.style.backgroundImage = 'url("' + audiovisual.imagePath + '")';
		}
		
		for ( var property in audiovisual.imageStyle ) {
			var cssValue = audiovisual.imageStyle[property];
			var cssProperty = 'background-' + property;
			imageNode.style[cssProperty] = cssValue;
		}
	}
	
	function reset(audiovisual) {
		imageNode.style.backgroundImage = '';
		
		if ( audiovisual && 'imageStyle' in audiovisual ) {
			for ( var property in audiovisual.imageStyle ) {
				var cssProperty = 'background-' + property;
				imageNode.style[cssProperty] = '';
			}
		}
	}
	
	return {
		play: play,
		reset: reset
	};
};