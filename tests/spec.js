describe('Ambience', function() {
	var ambience;
	var background;
	var backgroundNode;
	var foreground;
	var foregroundNode;
	
	beforeEach(function() {
		backgroundNode = document.createElement('div');
		document.body.appendChild(backgroundNode);
		background = new Ambience.Stage(backgroundNode);
		
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
			expect(backgroundNode.style.opacity).toBeGreaterThan(0.25);
			expect(backgroundNode.style.opacity).toBeLessThan(0.75);
		});
		
		waits(2000);
		
		runs(function() {
			expect(Number(backgroundNode.style.opacity)).toBe(1);
		});
	});
});