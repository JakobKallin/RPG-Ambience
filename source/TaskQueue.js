// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

'use strict';

Ambience.TaskQueue = function(limit) {
	var inLine = new List();
	var inProgress = new List();
	var executionTimer = null;
	
	this.add = function(task) {
		var deferred = when.defer();
		deferred.task = task;
		inLine.unshift(deferred);
		scheduleExecution();
		
		return deferred.promise;
	};
	
	function scheduleExecution() {
		if ( executionTimer === null ) {
			executionTimer = setTimeout(execute, 0);
		}
	}
	
	function execute() {
		executionTimer = null;
		
		var deferredsToExecute = inLine.slice(0, limit - inProgress.length);
		deferredsToExecute.forEach(function(deferred) {
			inLine.remove(deferred);
			inProgress.push(deferred);
			
			deferred.task()
			.then(deferred.resolve, deferred.reject, deferred.notify)
			.ensure(function() {
				inProgress.remove(deferred);
				scheduleExecution();
			});
		});
	}
};