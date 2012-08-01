describe('Ambience mixin', function() {
	var ambience;
	
	var background;
	var backgroundNode;
	
	beforeEach(function() {
		backgroundNode = document.createElement('div');
		document.body.appendChild(backgroundNode);
		background = new Ambience.Layer(backgroundNode);
		
		var foregroundNode = document.createElement('div');
		var foreground = new Ambience.Layer(foregroundNode);
		
		ambience = new Ambience(background, foreground);
	});
	
	afterEach(function() {
		document.body.removeChild(backgroundNode);
	});
	
	it('replaces defined properties', function() {
		var scene = Object.create(Ambience.scene.base);
		scene.text = 'Test';
		ambience.play(scene);
		
		var mixin = Object.create(Ambience.scene.base);
		mixin.isMixin = true;
		mixin.text = 'Mixin';
		ambience.play(mixin);
		
		expect(backgroundNode.querySelector('.text').textContent).toBe('Mixin');
	});
	
	it('retains undefined properties', function() {
		var scene = Object.create(Ambience.scene.base);
		scene.text = 'Test';
		ambience.play(scene);
		
		var mixin = Object.create(Ambience.scene.base);
		mixin.isMixin = true;
		mixin.image = 'test-image.jpg';
		ambience.play(mixin);
		
		expect(backgroundNode.querySelector('.text').textContent).toBe('Test');
		expect(backgroundNode.querySelector('.image').style.backgroundImage).toMatch(/test-image/);
	});
	
	it('ignores fading when another scene is playing', function() {
		runs(function() {
			var scene = Object.create(Ambience.scene.base);
			scene.text = 'Test';
			ambience.play(scene);
			
			var mixin = Object.create(Ambience.scene.base);
			mixin.isMixin = true;
			mixin.text = 'Mixin';
			mixin.fadeDuration = 2000;
			ambience.play(mixin);
		});
		
		waits(1000);
		
		runs(function() {
			expect(Number(backgroundNode.style.opacity)).toBe(1);
		});
	});
	
	it('respects fading when another scene is not playing', function() {
		runs(function() {
			var mixin = Object.create(Ambience.scene.base);
			mixin.isMixin = true;
			mixin.text = 'Mixin';
			mixin.fadeDuration = 2000;
			ambience.play(mixin);
		});
		
		waits(1000);
		
		runs(function() {
			expect(Number(backgroundNode.style.opacity)).toBeGreaterThan(0.25);
			expect(Number(backgroundNode.style.opacity)).toBeLessThan(0.75);
		});
	});
});