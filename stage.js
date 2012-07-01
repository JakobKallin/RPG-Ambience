Ambience.Stage = function(node, imageNode, speaker, sign, videoNode) {
	var audiovisual;
	var soundIndex;
	var videoIndex;
	
	var isPaused;
	var soundHasEnded;
	var videoHasEnded;
	var isFadingIn;
	var isFadingOut;
	
	var fadeAnimation = new Animation(node.style, 'opacity');
	var soundFade = new Animation(speaker, 'volume');
	
	var defaultBackground = document.body.style.backgroundColor;
	
	var imageDelayTimer;
	
	speaker.addEventListener('ended', playNextSound);
	videoNode.addEventListener('ended', playNextVideo);
	
	reset();
	
	function reset() {
		node.style.visibility = 'hidden';
		node.style.backgroundColor = defaultBackground;
		imageNode.style.backgroundImage = '';
		node.style.opacity = 0;
		
		resetText();
		stopSound();
		stopVideo();
		stopFadeIn();
		
		audiovisual = null;
		soundIndex = null;
		videoIndex = null;
		
		window.clearTimeout(imageDelayTimer);
		
		isPaused = false;
		soundHasEnded = false;
		videoHasEnded = false;
		isFadingIn = false;
		isFadingOut = false;
	}
	
	function playAudiovisual(newAudiovisual) {
		audiovisual = newAudiovisual;
		imageDelayTimer = window.setTimeout(playImage, audiovisual.imageDelay);
		playSound();
		playBackgroundColor();
		playFadeIn();
		playText();
		playVideo();
	}
	
	function playImage() {
		if ( audiovisual.hasImage ) {
			imageNode.style.backgroundImage = 'url("' + audiovisual.imagePath + '")';
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
		}
		
		isFadingIn = true;
		fadeAnimation.start(1, audiovisual.fadeInDuration, {ended: onFadeInEnded});
		
		if ( audiovisual.hasSound ) {
			soundFade.start(audiovisual.volume, audiovisual.fadeInDuration);
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
	
	function resetText() {
		sign.textContent = '';
		
		if ( hasAudiovisual() && audiovisual.hasTextStyle ) {
			for ( var cssProperty in audiovisual.textStyle ) {
				sign.style[cssProperty] = '';
			}
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
				reset();
			} else if ( allSoundsHavePlayed && !audiovisual.loops  ) {
				soundHasEnded = true;
			} else {
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
			if ( allVideosHavePlayed && !audiovisual.loops ) {
				videoHasEnded = true;
			} else {
				videoNode.src = audiovisual.videoPaths[videoIndex];
				videoNode.play();
			}
		}
	}
	
	function stopSound() {
		if ( !speaker.ended ) {
			try {
				speaker.currentTime = 0;
			} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
			speaker.pause();
		}
		speaker.removeAttribute('src');
		speaker.volume = 0; // We will fade this in later.
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
	
	function stopFadeIn() {
		fadeAnimation.stop();
		soundFade.complete();
	}
	
	function fadeOutAudiovisual() {
		if ( hasAudiovisual() ) {
			// This should work even if the stage is currently paused, so we have to unpause it to prevent incorrect state.
			if ( isPaused ) {
				isPaused = false;
			}
			
			if ( isFadingOut ) {
				reset();
			} else {
				isFadingOut = true;
				
				// Must be above the stage fade, because that might complete immediately and set audiovisual to null.
				if ( audiovisual.hasSound ) {
					// The current volume compared to the audiovisual's defined volume, if it has been halfway faded in.
					var volumePercentage = speaker.volume / audiovisual.volume;
					var soundFadeDuration = audiovisual.fadeOutDuration * volumePercentage;
					soundFade.start(0, soundFadeDuration);
				}
				
				// The current opacity compared to 1, if the audiovisual has been halfway faded in.
				var opacityPercentage = node.style.opacity / 1;
				var fadeDuration = audiovisual.fadeOutDuration * opacityPercentage;
				fadeAnimation.start(0, fadeDuration, {completed: reset});
			}
		}
	}
	
	function hasAudiovisual() {
		return (
			audiovisual !== null &&
			audiovisual !== undefined // It's undefined when the stage has just been created.
		);
	}
	
	function pause() {
		if ( hasAudiovisual() && !isPaused ) {
			if ( audiovisual.hasSound && !soundHasEnded ) {
				speaker.pause();
			}
			if ( audiovisual.hasVideo && !videoHasEnded ) {
				videoNode.pause();
			}
			if ( isFadingIn || isFadingOut ) {
				fadeAnimation.pause();
				soundFade.pause();
			}
			isPaused = true;
		}
	}
	
	function resume() {
		if ( hasAudiovisual() && isPaused ) {
			if ( audiovisual.hasSound && !soundHasEnded ) {
				speaker.play();
			}
			if ( audiovisual.hasVideo && !videoHasEnded ) {
				videoNode.play();
			}
			if ( isFadingIn || isFadingOut ) {
				fadeAnimation.resume();
				soundFade.resume();
			}
			isPaused = false;
		}
	}
	
	function togglePlayback() {
		if ( isPaused ) {
			resume();
		} else {
			pause();
		}
	}
	
	return {
		playAudiovisual: playAudiovisual,
		stopAudiovisual: reset,
		fadeOutAudiovisual: fadeOutAudiovisual,
		togglePlayback: togglePlayback,
		get hasAudiovisual() {
			return hasAudiovisual();
		}
	};
};