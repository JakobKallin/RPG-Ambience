// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

describe('Task queue', function() {
	var queue;
	
	beforeEach(function() {
		queue = new Ambience.TaskQueue(1)
		
		this.addMatchers({
			toBeBetween: function(first, second) {
				var lowest = Math.min(first, second);
				var highest = Math.max(first, second);
				
				return lowest <= this.actual && this.actual <= highest;
			}
		});
	});
	
	it('executes task immediately when below capacity', function() {
		var taskWasExecuted = false;
		
		runs(function() {
			queue.add(function() {
				return when.delay(100).then(function() {
					taskWasExecuted = true;
				});
			});
		});
		
		waits(150);
		
		runs(function() {
			expect(taskWasExecuted).toBe(true);
		});
	});
	
	it('executes task later when above capacity', function() {
		var taskWasExecuted = false;
		
		runs(function() {
			queue.add(function() {
				return when.delay(100);
			});
			queue.add(function() {
				return when.delay(100).then(function() {
					taskWasExecuted = true;
				});
			});
		});
		
		// It seems that we need a generous delay for this to work properly.
		waits(500);
		
		runs(function() {
			expect(taskWasExecuted).toBe(true);
		});
	});
	
	it('executes next task even if previous task failed', function() {
		var firstTaskFailed = false;
		var secondTaskSucceeded = false;
		
		runs(function() {
			queue.add(function() {
				return when.defer().reject();
			}).otherwise(function() {
				firstTaskFailed = true;
			});
			
			queue.add(function() {
				secondTaskSucceeded = true;
			});
		});
		
		// We need a delay here, as in the test above.
		waits(100);
		
		runs(function() {
			expect(firstTaskFailed).toBe(true);
			expect(secondTaskSucceeded).toBe(true);
		});
	});
});