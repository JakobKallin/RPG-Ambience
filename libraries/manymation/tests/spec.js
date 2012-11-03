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
		var target = { property: undefined };
		var animation = new Manymation();
		animation.track(target, 'property', 2);
		
		runs(function() {
			animation.play(500);
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
	
	it('reverses from positive to zero', function() {
		var target = { property: undefined };
		var animation = new Manymation();
		animation.track(target, 'property', 2);
		
		runs(function() {
			animation.reverse(500);
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
		var target = { property: undefined };
		var animation = new Manymation();
		animation.track(target, 'property', 0);
		
		runs(function() {
			animation.play(500);
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
		var target = { property: undefined };
		var animation = new Manymation();
		animation.track(target, 'property', 2);
		animation.play(0);
		expect(target.property).toBe(2)
	});
	
	it('animates empty animation', function() {
		var animation = new Manymation();
		
		runs(function() {
			animation.play(500);
		});
		
		waits(1000);
	});
	
	it('plays and then reverses', function() {
		var target = { property: undefined };
		var animation = new Manymation();
		animation.track(target, 'property', 2);
		
		runs(function() {
			animation.play(500);
		});
		
		waits(250);
		
		runs(function() {
			expect(target.property).toBeBetween(0.8, 1.2);
		});
		
		waits(500);
		
		runs(function() {
			expect(target.property).toBe(2);
			animation.reverse(500);
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
	
	it('plays after interrupting', function() {
		var target = { property: undefined };
		var animation = new Manymation();
		animation.track(target, 'property', 2);
		
		runs(function() {
			animation.play(500);
		});
		
		waits(250);
		
		runs(function() {
			animation.play(500);
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
	
	it('animates multiple objects', function() {
		var first = { property: undefined };
		var second = { property: undefined };
		
		runs(function() {
			var animation = new Manymation();
			animation.track(first, 'property', 2);
			animation.track(second, 'property', 2);
			animation.play(1000);
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
		var target = { property: undefined };
		var animation = new Manymation();
		
		runs(function() {
			animation.play(1000);
		});
		
		waits(250);
		
		runs(function() {
			animation.track(target, 'property', 2);
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
	
	it('sets starting value during play', function() {
		var target = { property: undefined };
		var animation = new Manymation();
		
		runs(function() {
			animation.play(1000);
		});
		
		waits(500);
		
		runs(function() {
			animation.track(target, 'property', 2);
			expect(target.property).toBeBetween(0.8, 1.2);
		});
	});
	
	it('prevents value from being NaN', function() {
		expect(function() {
			var target = { property: undefined };
			var animation = new Manymation();
			animation.track(target, 'property', NaN);
			animation.play(0);
		}).toThrow();
	});
	
	it('stops animation when playing', function() {
		var target = { property: undefined };
		var animation = new Manymation();
		animation.track(target, 'property', 2);
		
		runs(function() {
			animation.play(1000);
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
});