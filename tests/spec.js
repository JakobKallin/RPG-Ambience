describe('Ambience', function() {
	var ambience;
	
	var background;
	var backgroundNode;
	var audioNodes;
	
	var foreground;
	var foregroundNode;
	
	beforeEach(function() {
		backgroundNode = document.createElement('div');
		document.body.appendChild(backgroundNode);
		background = new Ambience.Stage(backgroundNode);
		audioNodes = backgroundNode.getElementsByTagName('audio');
		
		foregroundNode = document.createElement('div');
		document.body.appendChild(foregroundNode);
		foreground = new Ambience.Stage(foregroundNode);
		
		ambience = new Ambience(background, foreground);
	});
	
	afterEach(function() {
		document.body.removeChild(backgroundNode);
		document.body.removeChild(foregroundNode);
	});
	
	it("fades an entire layer's opacity", function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.fadeDuration = 2000;
			ambience.playBackground(scene);
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
	
	it('fades audio volume', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.fadeDuration = 2000;
			scene.sounds = ['test-music.ogg'];
			ambience.playBackground(scene);
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
});