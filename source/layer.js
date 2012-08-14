Ambience.Layer = function(node) {
	var isFadingIn;
	var isFadingOut;
	var fadeOutDuration;
	
	var fadeAnimation = new Animation(node.style, 'opacity');
	var stopTimer;
	
	var mediaPlayers = {
		'backgroundColor': new Ambience.Background(node),
		'image': new Ambience.Image(node),
		'sounds': new Ambience.SoundList(node, stopScene),
		'text': new Ambience.Text(node),
		'video': new Ambience.Video(node)
	};
	
	var playingMedia = [];
	for ( var mediaType in mediaPlayers ) {
		wrapStop(mediaPlayers[mediaType], mediaType, playingMedia);
		wrapPlay(mediaPlayers[mediaType], mediaType, playingMedia);
	}
	
	stopScene();
	
	function wrapStop(player, mediaType, playingMedia) {
		var oldStop = player.stop;
		player.stop = function() {
			if ( playingMedia.contains(mediaType) ) {
				oldStop.apply(player, arguments);
				playingMedia.remove(mediaType);
			}
		};
	}
	
	function wrapPlay(player, mediaType, playingMedia) {
		var oldPlay = player.play;
		player.play = function() {
			oldPlay.apply(player, arguments);
			playingMedia.push(mediaType);
		};
	}
	
	function stopScene() {
		node.style.visibility = 'hidden';
		node.style.opacity = 0;
		
		for ( var mediaType in mediaPlayers ) {
			mediaPlayers[mediaType].stop();
		}
		
		stopFadeIn();
		isFadingIn = false;
		isFadingOut = false;
		
		window.clearTimeout(stopTimer);
		stopTimer = null;
	}
	
	function stopRedefinedMedia(newScene) {
		for ( var mediaType in mediaPlayers ) {
			if ( playingMedia.contains(mediaType) && newScene[mediaType] ) {
				mediaPlayers[mediaType].stop();
			}
		}
	}
	
	function playScene(newScene) {
		var alreadyPlaying = playingMedia.length > 0;
		if ( alreadyPlaying && newScene.isMixin ) {
			stopRedefinedMedia(newScene);
		} else if ( alreadyPlaying && !newScene.isMixin ) {
			stopScene();
		}
		
		fadeOutDuration = newScene.fadeOutDuration;
		
		playFadeIn(newScene);
		
		for ( var mediaType in mediaPlayers ) {
			if ( newScene[mediaType] ) {
				mediaPlayers[mediaType].play(newScene);
			}
		}
	}
	
	function playFadeIn(newScene) {
		if ( newScene.isVisual ) {
			node.style.visibility = 'visible';
		}
		
		isFadingIn = true;
		fadeAnimation.start(1, newScene.fadeInDuration, {onEnded: onFadeInEnded});		
	}
	
	function onFadeInEnded() {
		isFadingIn = false;
	}
	
	function stopFadeIn() {
		fadeAnimation.stop();
	}
	
	function fadeOutScene() {
		if ( playingMedia.length > 0 ) {
			if ( isFadingOut ) {
				stopScene();
			} else {
				isFadingOut = true;
				
				if ( playingMedia.contains('sounds') ) { mediaPlayers.sounds.fadeOut(); }
				if ( playingMedia.contains('video') ) { mediaPlayers.video.fadeOut(); }
				
				// The current opacity compared to 1, if the scene has been halfway faded in.
				var opacityPercentage = node.style.opacity / 1;
				var fadeDuration = fadeOutDuration * opacityPercentage;
				fadeAnimation.start(0, fadeDuration);
				
				stopTimer = window.setTimeout(stopScene, fadeDuration);
			}
		}
	}
	
	return {
		playScene: playScene,
		stopScene: stopScene,
		fadeOutScene: fadeOutScene,
		get isPlaying() {
			return playingMedia.length > 0;
		}
	};
};