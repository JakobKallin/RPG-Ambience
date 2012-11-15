describe('Ambience mixin', function() {
	var ambience;
	
	var layer;
	var layerNode;
	
	beforeEach(function() {
		layerNode = document.createElement('div');
		document.body.appendChild(layerNode);
		layer = new Ambience.Layer(layerNode);
		
		ambience = new Ambience(layer, new Ambience.Layer(document.createElement('div')));
	});
	
	beforeEach(function() {
		this.addMatchers({
			toBeBetween: function(first, second) {
				var lowest = Math.min(first, second);
				var highest = Math.max(first, second);
				
				return lowest <= this.actual && this.actual <= highest;
			}
		});
	});
	
	afterEach(function() {
		document.body.removeChild(layerNode);
	});
	
	it('replaces defined properties', function() {
		var scene = new Ambience.Scene();
		scene.text = 'Test';
		ambience.play(scene);
		
		var mixin = new Ambience.Scene();
		mixin.isMixin = true;
		mixin.text = 'Mixin';
		ambience.play(mixin);
		
		expect(layer.textNode.textContent).toBe('Mixin');
	});
	
	it('retains undefined properties', function() {
		var scene = new Ambience.Scene();
		scene.text = 'Test';
		ambience.play(scene);
		
		var mixin = new Ambience.Scene();
		mixin.isMixin = true;
		mixin.image = 'test-image.jpg';
		ambience.play(mixin);
		
		expect(layer.textNode.textContent).toBe('Test');
		expect(layer.imageNode.style.backgroundImage).toMatch(/test-image/);
	});
	
	it('ignores fading when another scene is playing', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.text = 'Test';
			ambience.play(scene);
			
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.text = 'Mixin';
			mixin.fadeDuration = 2000;
			ambience.play(mixin);
		});
		
		waits(1000);
		
		runs(function() {
			expect(layer.opacity).toBeGreaterThan(0.9);
		});
	});
	
	it('respects fading when another scene is not playing', function() {
		runs(function() {
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.text = 'Mixin';
			mixin.fadeDuration = 2000;
			ambience.play(mixin);
		});
		
		waits(1000);
		
		runs(function() {
			expect(layer.opacity).toBeBetween(0.25, 0.75);
		});
	});
	
	it('respects current visual fade level when mixed-in during fade', function() {
		runs(function() {
			var base = new Ambience.Scene();
			base.image = 'test-image.jpg';
			base.fadeDuration = 2000;
			ambience.play(base);
		});
		
		waits(500);
		
		runs(function() {
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.text = 'Mixin';
			ambience.play(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(layer.opacity).toBeBetween(0.25, 0.75);
		});
	});
	
	it('respects current audio fade level when mixed-in during fade', function() {
		runs(function() {
			var base = new Ambience.Scene();
			base.sounds = ['test-audio.ogg'];
			base.fadeDuration = 2000;
			ambience.play(base);
		});
		
		waits(500);
		
		runs(function() {
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.sounds = ['test-audio.ogg'];
			ambience.play(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(layer.soundNode.volume).toBeBetween(0.25, 0.75);
		});
	});
	
	it('only mixes in properties of media when media itself is present', function() {
		var base = new Ambience.Scene();
		base.text = 'Base';
		base.textStyle = { color: 'red' }
		ambience.play(base);
		
		var mixin = new Ambience.Scene();
		mixin.isMixin = true;
		mixin.textStyle = { color: 'blue' };
		ambience.play(mixin);
		
		expect(layerNode.querySelector('.text.inner').style.color).toBe('red');
	});
	
	it('keeps playing visual scene even after audio of mixed-in audio-only scene ends', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.image = 'test-image.jpg';
			ambience.play(scene);
			
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.sounds = ['test-audio-2s.ogg'];
			mixin.loops = false;
			ambience.play(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(layer.soundCount).toBe(1);
		});
		
		waits(3000);
		
		runs(function() {
			expect(ambience.sceneIsPlaying).toBe(true);
		});
	});
	
	it('displays visual mixin even when previous scene was not visual', function() {
		var scene = new Ambience.Scene();
		scene.sounds = ['test-audio-2s.ogg'];
		ambience.play(scene);
		
		var mixin = new Ambience.Scene();
		mixin.isMixin = true;
		mixin.image = 'test-image.jpg';
		ambience.play(mixin);
		
		expect(layerNode.style.visibility).toBe('visible');
	});
	
	it('respects volume of mixed-in scene', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.sounds = ['test-audio-2s.ogg'];
			ambience.play(scene);
			
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.sounds = ['test-audio-2s.ogg'];
			mixin.volume = 0.5;
			ambience.play(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(layer.soundNode.volume).toBeBetween(0.45, 0.55);
		});
	});
});