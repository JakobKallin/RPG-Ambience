describe('Manymation', function() {
	beforeEach(function() {
		this.addMatchers({
			toBeBetween: function(first, second) {
				var lowest = Math.min(first, second);
				var highest = Math.max(first, second);
				
				return lowest <= this.actual && this.actual <= highest;
			}
		});
	});
	
	it('animates from zero to positive', function() {
		var target = {
			property: undefined
		};
		var animation = new Manymation.Animation(500);
		animation.track(target, 'property', 0, 2);
		
		runs(function() {
			animation.start();
		});
		
		waits(250);
		
		runs(function() {
			expect(target.property).toBeBetween(0.8, 1.2);
		});
		
		waits(500);
		
		runs(function() {
			expect(target.property).toBe(2);
		});
	});
	
	it('animates from positive to zero', function() {
		var target = {
			property: undefined
		};
		var animation = new Manymation.Animation(500);
		animation.track(target, 'property', 2, 0);
		
		runs(function() {
			animation.start();
		});
		
		waits(250);
		
		runs(function() {
			expect(target.property).toBeBetween(0.8, 1.2);
		});
		
		waits(500);
		
		runs(function() {
			expect(target.property).toBe(0);
		});
	});
	
	it('animates constant animation', function() {
		var target = {
			property: undefined
		};
		var animation = new Manymation.Animation(500);
		animation.track(target, 'property', 0, 0);
		
		runs(function() {
			animation.start();
		});
		
		waits(250);
		
		runs(function() {
			expect(target.property).toBe(0);
		});
		
		waits(500);
		
		runs(function() {
			expect(target.property).toBe(0);
		});
	});
	
	it('animates immediate animation', function() {
		var target = {
			property: undefined
		};
		var animation = new Manymation.Animation(0);
		animation.track(target, 'property', 0, 2);
		animation.start();
		expect(target.property).toBe(2)
	});
	
	it('animates empty animation', function() {
		var animation = new Manymation.Animation(500);
		
		runs(function() {
			animation.start();
		});
		
		waits(1000);
	});
	
	it('animates multiple objects', function() {
		var first = {
			property: undefined
		};
		var second = {
			property: undefined
		};
		
		runs(function() {
			var animation = new Manymation.Animation(1000);
			animation.track(first, 'property', 0, 2);
			animation.track(second, 'property', 0, 2);
			animation.start();
		});
		
		waits(500);
		
		runs(function() {
			expect(first.property).toBeBetween(0.8, 1.2);
			expect(second.property).toBeBetween(0.8, 1.2);
		});
		
		waits(1000);
		
		runs(function() {
			expect(first.property).toBe(2);
			expect(second.property).toBe(2);
		});
	});
	
	it('animates objects added while playing', function() {
		var target = {
			property: undefined
		};
		var animation = new Manymation.Animation(1000);
		
		runs(function() {
			animation.start();
		});
		
		waits(250);
		
		runs(function() {
			animation.track(target, 'property', 0, 2);
		});
		
		waits(250);
		
		runs(function() {
			expect(target.property).toBeBetween(0.8, 1.2);
		});
		
		waits(1000);
		
		runs(function() {
			expect(target.property).toBe(2);
		});
	});
	
	it('sets starting value during animation', function() {
		var target = {
			property: undefined
		};
		var animation = new Manymation.Animation(1000);
		
		runs(function() {
			animation.start();
		});
		
		waits(500);
		
		runs(function() {
			animation.track(target, 'property', 0, 2);
			expect(target.property).toBeBetween(0.8, 1.2);
		});
	});
	
	it('prevents value from being NaN', function() {
		expect(function() {
			var target = {
				property: undefined
			};
			var animation = new Manymation.Animation(0);
			animation.track(target, 'property', 0, NaN);
			animation.start();
		}).toThrow();
	});
	
	it('stops animation when playing', function() {
		var target = {
			property: undefined
		};
		var animation = new Manymation.Animation(1000);
		animation.track(target, 'property', 0, 2);
		
		runs(function() {
			animation.start();
		});
		
		waits(500);
		
		runs(function() {
			animation.complete();
		});
		
		waits(500);
		
		runs(function() {
			expect(target.property).toBe(2);
		});
	});
	
	it('runs callback after ending', function() {
		var onEndedCalled = false;
		var onEnded = function() {
			onEndedCalled = true;
		};
		
		runs(function() {
			Manymation.animate(250, onEnded);
		});
		
		waits(500);
		
		runs(function() {
			expect(onEndedCalled).toBe(true);
		});
	});
	
	it('runs multiple callbacks after ending', function() {
		var onEndedCalledCount = 0;
		var onEnded = function() {
			onEndedCalledCount += 1;
		};
		
		runs(function() {
			Manymation.animate(250, [onEnded, onEnded]);
		});
		
		waits(500);
		
		runs(function() {
			expect(onEndedCalledCount).toBe(2);
		});
	});
	
	it('animates targets given in constructor', function() {
		var target = {
			property: undefined
		};
		var dummy = new Manymation.Animation(0);
		dummy.track(target, 'property', 0, 2);
		
		runs(function() {
			Manymation.animate(1000, undefined, dummy.targets);			
		});
		
		waits(500);
		
		runs(function() {			
			expect(target.property).toBeBetween(0.8, 1.2);
		});
	});
});