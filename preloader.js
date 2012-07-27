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
		adventure.scenes.map(function(scene) { preloadImage(scene); });
		adventure.scenes.map(function(scene) { preloadSound(scene); });
	}
	
	function preloadImage(scene) {
		if ( scene.image ) {
			var img = document.createElement('img');
			img.src = scene.image;
			node.appendChild(img);
		}
	}
	
	function preloadSound(scene) {
		if ( scene.sounds ) {
			scene.sounds.map(function(path) {
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