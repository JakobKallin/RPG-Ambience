describe('Ambience audio', function() {
	var ambience;
	
	var background;
	var backgroundNode;
	var audioNodes;
	
	beforeEach(function() {
		backgroundNode = document.createElement('div');
		document.body.appendChild(backgroundNode);
		background = new Ambience.Layer(backgroundNode);
		
		var foregroundNode = document.createElement('div');
		var foreground = new Ambience.Layer(foregroundNode);
		
		ambience = new Ambience(background, foreground);
		
		audioNodes = backgroundNode.getElementsByTagName('audio');
	});
	
	afterEach(function() {
		document.body.removeChild(backgroundNode);
	});
	
	it('fades audio volume', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.fadeDuration = 2000;
			scene.sounds = ['test-audio.ogg'];
			ambience.play(scene);
		});
		
		waits(1000);
		
		runs(function() {
			// If CSS transitions are used, this has to be changed to getComputedStyle.
			// We're using a fairly generous interval for the opacity.
			expect(audioNodes[0].volume).toBeGreaterThan(0.25);
			expect(audioNodes[0].volume).toBeLessThan(0.75);
		});
		
		waits(2000);
		
		runs(function() {
			expect(audioNodes[0].volume).toBe(1);
		});
	});
	
	it('interrupts an audio fade halfway through', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.fadeDuration = 2000;
			scene.sounds = ['test-audio.ogg'];
			ambience.play(scene);
		});
		
		waits(1000);
		
		runs(function() {
			ambience.fadeOutBackground();
		});
		
		waits(500);
		
		runs(function() {
			expect(audioNodes[0].volume).toBeLessThan(0.5);
		});
		
		waits(1000);
		
		runs(function() {
			expect(audioNodes.length).toBe(0);
		});
	});
	
	it('stops non-looping audio-only scenes when audio ends', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.sounds = ['test-audio-2s.ogg'];
			scene.loops = false;
			
			ambience.play(scene);
		});
		
		waits(500);
		
		runs(function() {
			expect(ambience.sceneIsPlaying).toBe(true);
		});
		
		waits(3000);
		
		runs(function() {
			expect(ambience.sceneIsPlaying).toBe(false);
		});
	});
	
	it('removes audio element when audio ends', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.image = 'test-image.jpg';
			scene.sounds = ['test-audio-2s.ogg'];
			scene.loops = false;
			
			ambience.play(scene);
		});
		
		waits(3000);
		
		runs(function() {
			expect(audioNodes.length).toBe(0);
		});
	});
	
	it('crosses over', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.crossoverDuration = 2;
			scene.sounds = ['test-audio-5s.ogg', 'test-audio-5s.ogg'];
			ambience.play(scene);
		});
		
		waits(4000);
		
		runs(function() {
			expect(audioNodes.length).toBe(2);
		});
		
		waits(2000);
		
		runs(function() {
			expect(audioNodes.length).toBe(1);
		});
	});
	
	// The test below requires some work to implement. It prevents too long crossover durations from endlessly creating new audio as soon as a track starts.
	/*
	       7.5  10   12.5
	_ _ _ _ _ _ _
	        _ _ _ _ _ _
	              _ _ _ _ _ _ _
	*/
	/*
	it('crosses over at most half of audio length', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.crossoverDuration = 6;
			scene.sounds = ['test-audio-10s.ogg', 'test-audio-5s.ogg', 'test-audio-10s.ogg'];
			ambience.play(scene);
		});
		
		waits(8500); // 8.5
		
		runs(function() {
			expect(audioNodes.length).toBe(2);
		});
		
		waits(2500); // 11.0
		
		runs(function() {
			expect(audioNodes.length).toBe(2);
		});
		
		waits(2500); // 13.5
		
		runs(function() {
			expect(audioNodes.length).toBe(1);
		});
	});
	*/
	
	it('crossfades', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.crossoverDuration = 2;
			scene.crossfades = true;
			scene.sounds = ['test-audio-5s.ogg', 'test-audio-5s.ogg'];
			ambience.play(scene);
		});
		
		waits(4000); // Tracks should have the same volume at this point.
		
		runs(function() {
			expect(audioNodes[0].volume).toBeGreaterThan(0.25);
			expect(audioNodes[0].volume).toBeLessThan(0.75);
			
			expect(audioNodes[1].volume).toBeGreaterThan(0.25);
			expect(audioNodes[1].volume).toBeLessThan(0.75);
		});
	});
});