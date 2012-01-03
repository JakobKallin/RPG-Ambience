$(window).load(function() {
	var scenes = [
		{ key: 'F1', image: 'fates.jpg', sound: 'fates.mp3' },
		{ key: 'F2', image: 'clone.jpg' },
		{ key: 'F3', image: 'jedi.jpg', sound: 'saber.wav' }
	];
	
	var keyStrings = {
		13: 'Enter',
		112: 'F1',
		113: 'F2',
		114: 'F3',
		115: 'F4',
		116: 'F5',
		117: 'F6',
		118: 'F7',
		119: 'F8',
		120: 'F9',
		121: 'F10',
		122: 'F11',
		123: 'F12'
	};
	
	var stage = document.getElementById('stage');
	var sceneSound = document.getElementById('scene-sound');
	if ( typeof sceneSound.loop !== 'boolean' ) {
		sceneSound.addEventListener('ended', function() { this.currentTime = 0; }, false);
	}
	
	function keyStringFromKeyCode(keyCode) {
		if ( keyCode in keyStrings ) {
			return keyStrings[keyCode];
		} else {
			return null;
		}
	}
	
	function keyedScene(keyString) {
		for ( var i = 0; i < scenes.length; i++ ) {
			var scene = scenes[i];
			if ( scene.key === keyString ) {
				return scene;
			}
		}
		return null;
	}
	
	function playScene(scene) {
		stopScene();
		
		if ( scene.image ) {
			$(stage).css('background-image', 'url(' + scene.image + ')');
		}
		
		if ( scene.sound ) {
			sceneSound.setAttribute('src', scene.sound);
			//sceneSound.load(); // Doesn't seem to be necessary.
			sceneSound.play();
		}
	}
	
	function stopScene() {
		$(stage).css('background-image', '');
		if ( sceneSound ) {
			sceneSound.pause();
			sceneSound.removeAttribute('src');
		}
	}
	
	$(document).keydown(function(event) {
		var keyString = keyStringFromKeyCode(event.which);
		if ( keyString === 'Enter' ) {
			event.preventDefault();
			stopScene();
		} else if ( keyString !== null ) {
			var scene = keyedScene(keyString);
			if ( scene !== null ) {
				event.preventDefault();
				playScene(scene);
			}
		}
	});
});