describe('Ambience audio', function() {
	var ambience;
	
	var layer;
	var layerNode;
	
	beforeEach(function() {
		layerNode = document.createElement('div');
		document.body.appendChild(layerNode);
		layer = new Ambience.Layer(layerNode);
		
		ambience = new Ambience(layer, new Ambience.Layer(document.createElement('div')));
	});
	
	afterEach(function() {
		document.body.removeChild(layerNode);
	});
	
	it('fades audio volume', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.fadeDuration = 1000;
			scene.sounds = ['test-audio.ogg'];
			ambience.play(scene);
		});
		
		waits(500);
		
		runs(function() {
			// If CSS transitions are used, this has to be changed to getComputedStyle.
			// We're using a fairly generous range for the opacity.
			expect(layer.soundNode.volume).toBeGreaterThan(0.25);
			expect(layer.soundNode.volume).toBeLessThan(0.75);
		});
		
		waits(1000);
		
		runs(function() {
			expect(layer.soundNode.volume).toBe(1);
		});
	});
	
	it('interrupts an audio fade halfway through', function() {
		runs(function() {
			var scene = new Ambience.Scene();
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
			expect(layer.soundNode.volume).toBeLessThan(0.5);
		});
		
		waits(1000);
		
		runs(function() {
			expect(layer.soundCount).toBe(0);
		});
	});
	
	it('stops non-looping audio-only scenes when audio ends', function() {
		runs(function() {
			var scene = new Ambience.Scene();
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
			var scene = new Ambience.Scene();
			scene.image = 'test-image.jpg';
			scene.sounds = ['test-audio-2s.ogg'];
			scene.loops = false;
			
			ambience.play(scene);
		});
		
		waits(3000);
		
		runs(function() {
			expect(layer.soundCount).toBe(0);
		});
	});
	
	it('crosses over', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.crossoverDuration = 2;
			scene.sounds = ['test-audio-5s.ogg', 'test-audio-5s.ogg'];
			ambience.play(scene);
		});
		
		waits(4000);
		
		runs(function() {
			expect(layer.soundCount).toBe(2);
		});
		
		waits(2000);
		
		runs(function() {
			expect(layer.soundCount).toBe(1);
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
			var scene = new Ambience.Scene();
			scene.crossoverDuration = 6;
			scene.sounds = ['test-audio-10s.ogg', 'test-audio-5s.ogg', 'test-audio-10s.ogg'];
			ambience.play(scene);
		});
		
		waits(8500); // 8.5
		
		runs(function() {
			expect(layer.soundCount).toBe(2);
		});
		
		waits(2500); // 11.0
		
		runs(function() {
			expect(layer.soundCount).toBe(2);
		});
		
		waits(2500); // 13.5
		
		runs(function() {
			expect(layer.soundCount).toBe(1);
		});
	});
	*/
	
	it('respects fade level when a new track is started during fade', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.sounds = ['test-audio-5s.ogg', 'test-audio-5s.ogg'];
			scene.fadeDuration = 10000;
			scene.fadesIn = false;
			ambience.play(scene);
			ambience.fadeOutBackground();
		});
		
		waits(6000);
		
		runs(function() {
			expect(layer.soundNode.volume).toBeLessThan(0.5);
		});
	});
});