// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

describe('Task queue', function() {
	var queue;
	
	function SuccessTask(delay) {
		delay = typeof delay === 'number' ? delay : 100;
		return function() {
			return when.delay(delay);
		};
	}
	
	function FailTask(delay) {
		delay = typeof delay === 'number' ? delay : 100;
		return function() {
			var deferred = when.defer();
			when.delay(delay).then(deferred.reject);
			return deferred.promise;
		}
	}
	
	beforeEach(function() {
		queue = new Ambience.TaskQueue(1)
	});
	
	it('executes task immediately when below capacity', function(done) {
		queue.add(new SuccessTask()).then(done);
		
		setTimeout(function() {
			done(new Error('Task was not executed within 200 ms'));
		}, 200);
	});
	
	it('executes task later when above capacity', function(done) {
		var taskWasExecuted = false;
		
		// Note that the queue is FIFO, so the task below should be executed last.
		queue.add(new SuccessTask(200)).then(function() {
			taskWasExecuted = true;
		});
		queue.add(new SuccessTask(200));
		
		// The task cannot complete too early.
		setTimeout(function() {
			expect(taskWasExecuted).to.be(false);
		}, 300);
		
		// But it must complete at some point.
		setTimeout(function() {
			expect(taskWasExecuted).to.be(true);
			done();
		}, 500);
	});
	
	it('executes next task even if previous task failed', function(done) {
		queue.add(new FailTask());
		queue.add(new SuccessTask()).then(done);
	});
});