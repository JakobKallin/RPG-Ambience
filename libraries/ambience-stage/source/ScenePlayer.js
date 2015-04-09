// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

// The scene player appends a scene node to the provided stage node, plays a scene, and then removes the scene node on completion.
// Note that `stageNode.ownerDocument` (`doc`) is used to create elements. This is because IE10 does not allow adding elements from a different document (which they otherwise can be, since the script can be run from a different window).
AmbienceStage.ScenePlayer = function(stageNode) {
	var doc = stageNode.ownerDocument;
	var sceneNode = null;
	var fade = null;
	var isFadingOut = false;
	var scene = null;
	
	var hasStarted = false;
	var hasStopped = false;
	var deferred = when.defer();
	
	var includeInFade = function(object, property, startValue, endValue) {
		if ( isFadingOut ) {
			fade.track(object, property, endValue, startValue);			
		} else {
			fade.track(object, property, startValue, endValue);			
		}
	};
	
	var removeFromFade = function(object) {
		var matchingTarget = fade.targets.first(function(target) {
			return target.object === object;
		});
		fade.targets.remove(matchingTarget);
	};
	
	var mediaPlayers = {};
	
	function stop() {
		if ( hasStopped || !hasStarted ) {
			return;
		}

		for ( var mediaType in mediaPlayers ) {
			if ( mediaType in scene ) {
				mediaPlayers[mediaType].stop();
			}
		}
		
		if ( fade ) {
			fade.cancel();
			fade = null;
		}
		isFadingOut = false;
		
		stageNode.removeChild(sceneNode);
		
		scene = null;
		hasStopped = true;
		
		deferred.resolve();
	}
	
	function stopSceneIfSoundOnly() {
		if ( scene.hasOnlySound ) {
			stop();
		}
	}
	
	function play(newScene) {
		if ( hasStarted ) {
			return;
		}
		
		sceneNode = doc.createElement('div');
		sceneNode.className = 'scene';
		stageNode.appendChild(sceneNode);
		
		mediaPlayers.background = new AmbienceStage.Background(sceneNode);
		mediaPlayers.image = new AmbienceStage.Image(sceneNode);
		mediaPlayers.sound = new AmbienceStage.Sound(sceneNode, stopSceneIfSoundOnly, includeInFade, removeFromFade);
		mediaPlayers.text = new AmbienceStage.Text(sceneNode);
		
		scene = newScene;
		playFadeIn(scene);
		
		for ( var mediaType in mediaPlayers ) {
			if ( mediaType in scene ) {
				mediaPlayers[mediaType].play(scene);
			}
		}
		
		hasStarted = true;
		
		return deferred.promise;
	}

	function mixin(mixin) {
		if ( hasStopped || !hasStarted ) {
			return;
		}
		
		var newScene = Object.create(scene);
		for ( var property in mixin ) {
			newScene[property] = mixin[property];
		}

		for ( var mediaType in mediaPlayers ) {
			if ( mediaType in scene && mediaType in mixin ) {
				mediaPlayers[mediaType].stop();
			}
		}

		for ( var mediaType in mediaPlayers ) {
			if ( mediaType in mixin ) {
				mediaPlayers[mediaType].play(newScene);
			}
		}

		if ( mixin.isVisual ) {
			sceneNode.style.visibility = 'visible';
		}

		scene = newScene;
	}

	function playFadeIn(scene) {
		sceneNode.style.visibility = scene.isVisual ? 'visible' : 'hidden';
		
		// Start the fade whether the scene is visual or not, because we still want to fade audio.
		var targets = (fade) ? fade.targets : undefined;
		fade = new Manymation.Animation(scene.fade.in, undefined, targets);
		includeInFade(sceneNode.style, 'opacity', 0, 0.999)
		fade.start();
	}
	
	// If a duration is passed in, ignore duration specified in scene object.
	// This was added because crossfading between scenes in the Stage class uses the duration of the new scene, not the old one.
	function fadeOut(duration) {
		if ( hasStopped || !hasStarted ) {
			return;
		}
		
		duration = typeof duration === 'number' ? duration : scene.fade.out;
		
		if ( isFadingOut ) {
			stop();
		} else {
			fade.cancel();
			reverseTargets(fade.targets);
			fade = new Manymation.Animation(duration, stop, fade.targets);
			
			// This needs to be set before starting the fade, because it might be instantaneous.
			// If it is, isFadingOut will be true even though the stage is not fading out.
			isFadingOut = true;
			fade.start();
		}
	}
	
	function reverseTargets(targets) {
		targets.forEach(function(target) {
			var start = target.startValue;
			var end = target.endValue;
			target.startValue = end;
			target.endValue = start;
		});
	}
	
	return {
		play: play,
		mixin: mixin,
		stop: stop,
		fadeOut: fadeOut,
		get sceneIsPlaying() {
			return hasStarted && !hasStopped;
		}
	};
};