Ambience.Stage = function(node, imageNode, speaker, sign, videoNode) {
	var audiovisual = null;
	var soundIndex = null;
	var videoIndex = null;
	var isFadingIn = false;
	var isFadingOut = false;
	var fadeAnimation = new Animation(node.style, 'opacity');
	
	var defaultBackground = document.body.style.backgroundColor;
	
	speaker.addEventListener('ended', playNextSound);
	videoNode.addEventListener('ended', playNextVideo);
	
	function playAudiovisual(newAudiovisual) {
		audiovisual = newAudiovisual;
		playImage();
		playSound();
		playBackgroundColor();
		playFadeIn();
		playText();
		playVideo();
	}
	
	function playImage() {
		if ( audiovisual.hasImage ) {
			imageNode.style.backgroundImage = 'url(' + audiovisual.imagePath + ')';
		}
	}
	
	function playSound() {
		// Locks up scene audio when effect both fades in and has audio for some reason.
		if ( audiovisual.hasSound ) {
			// -1 because the index is either incremented or randomized in the playNextSound method.
			soundIndex = -1;
			playNextSound();
		}
	}
	
	function playBackgroundColor() {
		if ( audiovisual.hasBackgroundColor ) {
			node.style.backgroundColor = audiovisual.backgroundColor;
		}
	}
	
	function playFadeIn() {
		if ( audiovisual.isVisual ) {
			node.style.visibility = 'visible';
			isFadingIn = true;
			fadeAnimation.start(1, audiovisual.fadeDuration, onFadeInEnded);
		}
	}
	
	function playText() {
		if ( audiovisual.hasText ) {
			sign.textContent = audiovisual.text;
			for ( var cssProperty in audiovisual.textStyle ) {
				var cssValue = audiovisual.textStyle[cssProperty];
				sign.style[cssProperty] = cssValue;
			}
		}
	}
	
	function playVideo() {
		if ( audiovisual.hasVideo ) {
			videoNode.style.visibility = 'visible';
			videoIndex = -1;
			playNextVideo();
		}
	}
	
	function onFadeInEnded() {
		isFadingIn = false;
	}
	
	function stopAudiovisual() {
		$(node).stop(true, true); // Complete all animations, then stop them.
		node.style.visibility = 'hidden';
		node.style.backgroundColor = defaultBackground;
		imageNode.style.backgroundImage = '';
		node.style.opacity = 0;
		
		if ( hasAudiovisual() && audiovisual.hasText ) {
			resetText();
		}
		
		stopSpeaker();
		stopVideo();
		fadeAnimation.stop();
		
		audiovisual = null;
		soundIndex = null;
		isFadingOut = false;
	}
	
	function resetText() {
		sign.textContent = '';
		for ( var cssProperty in audiovisual.textStyle ) {
			sign.style[cssProperty] = '';
		}
	}
	
	function playNextSound() {
		if ( hasAudiovisual() ) {
			// We need this so that we stop audio-only effects after they have actually played once.
			var audioHasPlayedBefore = soundIndex !== -1;
			
			if ( audiovisual.soundOrder === 'random' ) {
				soundIndex = audiovisual.soundPaths.randomIndex();
			} else {
				soundIndex = (soundIndex + 1) % audiovisual.soundPaths.length;
			}
			
			var allSoundsHavePlayed = audioHasPlayedBefore && soundIndex === 0;
			var oneShotAudioOnly = !audiovisual.loops && !audiovisual.isVisual;
			if ( oneShotAudioOnly && allSoundsHavePlayed ) {
				stopAudiovisual();
			} else if ( audiovisual.loops || !allSoundsHavePlayed ) {
				speaker.src = audiovisual.soundPaths[soundIndex];
				speaker.play();
			}
		}
	}
	
	function playNextVideo() {
		if ( hasAudiovisual() ) {
			// We need this so that we stop audio-only effects after they have actually played once.
			var videoHasPlayedBefore = videoIndex !== -1;
			
			if ( audiovisual.videoOrder === 'random' ) {
				videoIndex = audiovisual.videoPaths.randomIndex();
			} else {
				videoIndex = (videoIndex + 1) % audiovisual.videoPaths.length;
			}
			
			var allVideosHavePlayed = videoHasPlayedBefore && videoIndex === 0;
			if ( allVideosHavePlayed ) {
				stopAudiovisual();
			} else if ( audiovisual.loops || !allVideosHavePlayed ) {
				videoNode.src = audiovisual.videoPaths[videoIndex];
				videoNode.play();
			}
		}
	}
	
	function stopSpeaker() {
		if ( !speaker.ended ) {
			try {
				speaker.currentTime = 0;
			} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
			speaker.pause();
		}
		speaker.removeAttribute('src');
	}
	
	function stopVideo() {
		if ( !videoNode.ended ) {
			try {
				videoNode.currentTime = 0;
			} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
			videoNode.pause();
		}
		videoNode.removeAttribute('src');
		videoNode.style.visibility = 'hidden';
	}
	
	function fadeOutAudiovisual() {
		if ( isFadingOut ) {
			stopAudiovisual();
		} else {
			if ( isFadingIn ) {
				fadeAnimation.stop();
			}
			isFadingOut = true;
			fadeAnimation.start(0, audiovisual.fadeDuration, stopAudiovisual);
		}
	}
	
	function hasAudiovisual() {
		return audiovisual !== null;
	}
	
	function pause() {
		if ( hasAudiovisual() ) {
			if ( audiovisual.hasSound ) {
				speaker.pause();
			}
			if ( audiovisual.hasVideo ) {
				videoNode.pause();
			}
			if ( isFadingIn || isFadingOut ) {
				fadeAnimation.pause();
			}
		}
	}
	
	function resume() {
		if ( hasAudiovisual() ) {
			if ( audiovisual.hasSound ) {
				speaker.play();
			}
			if ( audiovisual.hasVideo ) {
				videoNode.play();
			}
			if ( isFadingIn || isFadingOut ) {
				fadeAnimation.resume();
			}
		}
	}
	
	return {
		playAudiovisual: playAudiovisual,
		stopAudiovisual: stopAudiovisual,
		fadeOutAudiovisual: fadeOutAudiovisual,
		playNextSound: playNextSound,
		pause: pause,
		resume: resume,
		get hasAudiovisual() {
			return hasAudiovisual();
		}
	};
};