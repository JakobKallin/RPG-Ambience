describe('Ambience layer', function() {
	var ambience;
	
	var background;
	var backgroundNode;
	var audioNodes;
	
	var foreground;
	var foregroundNode;
	
	beforeEach(function() {
		backgroundNode = document.createElement('div');
		document.body.appendChild(backgroundNode);
		background = new Ambience.Layer(backgroundNode);
		
		foregroundNode = document.createElement('div');
		document.body.appendChild(foregroundNode);
		foreground = new Ambience.Layer(foregroundNode);
		
		ambience = new Ambience(background, foreground);
		
		audioNodes = backgroundNode.getElementsByTagName('audio');
	});
	
	afterEach(function() {
		document.body.removeChild(backgroundNode);
		document.body.removeChild(foregroundNode);
	});
	
	it('stops any old scene when playing a new scene', function() {
		var scene = new Ambience.Scene();
		scene.image = 'test-image.jpg';
		ambience.play(scene);
		
		var newScene = new Ambience.Scene();
		scene.image = 'test-image.jpg';
		ambience.play(scene);
		
		expect(backgroundNode.querySelectorAll('.image').length).toBe(1);
	});
	
	it("fades an entire layer's opacity", function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.fadeDuration = 2000;
			ambience.play(scene);
		});
		
		waits(1000);
		
		runs(function() {
			// If CSS transitions are used, this has to be changed to getComputedStyle.
			// We're using a fairly generous interval for the opacity.
			expect(Number(backgroundNode.style.opacity)).toBeGreaterThan(0.25);
			expect(Number(backgroundNode.style.opacity)).toBeLessThan(0.75);
		});
		
		waits(2000);
		
		runs(function() {
			expect(Number(backgroundNode.style.opacity)).toBe(1);
		});
	});
	
	it('interrupts a fade halfway through', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.fadeDuration = 2000;
			ambience.play(scene);
		});
		
		waits(1000);
		
		runs(function() {
			ambience.fadeOutBackground();
		});
		
		waits(500);
		
		runs(function() {
			expect(Number(backgroundNode.style.opacity)).toBeLessThan(0.5);
		});
		
		waits(1000);
		
		runs(function() {
			expect(Number(backgroundNode.style.opacity)).toBe(0);
		});
	});
	
	it('stops all layers after fading out', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.fadeDuration = 1000;
			scene.backgroundColor = 'red';
			scene.image = 'test-image.jpg';
			scene.sounds = ['test-audio.ogg'];
			scene.text = 'Test';
			scene.video = 'test-video.webm';
			
			ambience.play(scene);
			
			expect(backgroundNode.style.backgroundColor).toBe('red');
			expect(backgroundNode.querySelectorAll('.image').length).toBe(1);
			expect(audioNodes.length).toBe(1);
			expect(backgroundNode.querySelectorAll('.text.outer').length).toBe(1);
			expect(backgroundNode.querySelectorAll('.video').length).toBe(1);
		});
		
		waits(1500);
		
		runs(function() {
			ambience.fadeOutBackground();
		});
		
		waits(1500);
		
		runs(function() {
			expect(backgroundNode.style.backgroundColor).toBe(Ambience.Scene.base.backgroundColor);
			expect(backgroundNode.querySelectorAll('.image').length).toBe(0);
			expect(audioNodes.length).toBe(0);
			expect(backgroundNode.querySelectorAll('.text').length).toBe(0);
			expect(backgroundNode.querySelectorAll('.video').length).toBe(0);
		});
	});
});