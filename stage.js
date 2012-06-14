Ambience.Stage = function(node, speaker, sign) {
	var audiovisual = null;
	var soundIndex = null;
	var isFadingIn = false;
	var isFadingOut = false;
	
	var defaultBackground = document.body.style.backgroundColor;
	
	speaker.addEventListener('ended', playNextSound);
	
	function playAudiovisual(newAudiovisual) {
		audiovisual = newAudiovisual;
		
		if ( audiovisual.hasImage ) {
			node.style.backgroundImage = 'url(' + audiovisual.imagePath + ')';
		}
		
		// Locks up scene audio when effect both fades in and has audio for some reason.
		if ( audiovisual.isAudial ) {
			// -1 because the index is either incremented or randomized in the playNextSound method.
			soundIndex = -1;
			playNextSound();
		}
		
		if ( audiovisual.hasBackgroundColor ) {
			node.style.backgroundColor = audiovisual.backgroundColor;
		}
		
		if ( audiovisual.isVisual ) {
			node.style.display = 'table';
			isFadingIn = true;
			$(node).animate({opacity: 1}, audiovisual.fadeDuration, onFadeInEnded);
		}
		
		if ( audiovisual.hasText ) {
			sign.textContent = audiovisual.text;
			for ( var cssProperty in audiovisual.textStyle ) {
				var cssValue = audiovisual.textStyle[cssProperty];
				sign.style[cssProperty] = cssValue;
			}
		}
	}
	
	function onFadeInEnded() {
		isFadingIn = false;
	}
	
	function stopAudiovisual() {
		$(node).stop(true, true); // Complete all animations, then stop them.
		node.style.display = 'none';
		node.style.backgroundColor = defaultBackground;
		node.style.backgroundImage = '';
		node.style.opacity = 0;
		
		if ( hasAudiovisual() && audiovisual.hasText ) {
			resetText();
		}
		
		stopSpeaker();
		
		audiovisual = null;
		soundIndex = null;
		isFadingOut = false;
	}
	
	function resetText() {
		sign.textContent = '';
		for ( var cssProperty in audiovisual.text ) {
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
	
	function stopSpeaker() {
		if ( !speaker.ended ) {
			try {
				speaker.currentTime = 0;
			} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
			speaker.pause();
		}
		speaker.removeAttribute('src');
	}
	
	function fadeOutAudiovisual() {
		if ( isFadingOut ) {
			stopAudiovisual();
		} else {
			$(node).stop(true); // Stop all animations, because it might be fading in.
			$(node).animate({opacity: 0}, audiovisual.fadeDuration, stopAudiovisual);
			isFadingOut = true;
		}
	}
	
	function hasAudiovisual() {
		return audiovisual !== null;
	}
	
	function pause() {
		// Pausing is currently disallowed during fading because we first need to find out the time remaining for the animation when it's resumed.
		if ( isFadingIn || isFadingOut ) {
			return;
		} else if ( hasAudiovisual() && audiovisual.isAudial ) {
			speaker.pause();
		}
	}
	
	function resume() {
		if ( hasAudiovisual() && audiovisual.isAudial ) {
			speaker.play();
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