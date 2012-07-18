Ambience.Preloader = function() {
	var node = document.createElement('div');
	node.style.display = 'none';
	document.body.appendChild(node);
	
	function clear() {
		while ( node.firstChild ) {
			node.removeChild(node.firstChild);
		}
	}
	
	function preloadMedia(adventure) {
		clear();
		adventure.audiovisuals.map(function(audiovisual) { preloadImage(audiovisual); });
		adventure.audiovisuals.map(function(audiovisual) { preloadSound(audiovisual); });
	}
	
	function preloadImage(audiovisual) {
		if ( audiovisual.hasImage ) {
			var img = document.createElement('img');
			img.src = audiovisual.imagePath;
			node.appendChild(img);
		}
	}
	
	function preloadSound(audiovisual) {
		if ( audiovisual.hasSound ) {
			audiovisual.soundPaths.map(function(path) {
				var audio = document.createElement('audio');
				audio.src = path;
				audio.volume = 0;
				node.appendChild(audio);
				audio.play();
				audio.pause();
			});
		}
	}
	
	return {
		preloadMedia: preloadMedia
	};
};