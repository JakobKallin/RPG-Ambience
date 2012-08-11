Object.getPropertyDescriptor = function(target, property) {
	var descriptor = Object.getOwnPropertyDescriptor(target, property);
	var proto = Object.getPrototypeOf(target);
	
	if ( descriptor ) {
		return descriptor;
	} else if ( proto ) {
		return Object.getPropertyDescriptor(proto, property);
	} else {
		return undefined;
	}
};

knockwrap = function() {
	function wrapObject(target) {
		if ( target instanceof Object ) {
			for ( var property in target ) {
				wrapProperty(target, property);
			}
		}
	}
	
	function wrapProperty(target, property) {
		var descriptor = Object.getPropertyDescriptor(target, property);
		if ( descriptor.get ) {
			wrapGetter(target, property);
		} else if ( target[property] instanceof Array ) {
			wrapArrayProperty(target, property);
		} else {
			wrapSimpleProperty(target, property);
		}
	}
	
	function wrapSimpleProperty(target, property) {
		var observable = ko.observable(target[property]);
		var getter = function() {
			return observable();
		};
		var setter = function(value) {
			observable(value);
		};
		Object.defineProperty(target, property, {
			get: getter,
			set: setter
		});
	}
	
	function wrapGetter(target, property) {
		var descriptor = Object.getPropertyDescriptor(target, property);
		var originalGetter = descriptor.get;
		var observable = ko.computed(originalGetter, target);
		var wrappedGetter = function() {
			return observable();
		};
		
		Object.defineProperty(target, property, {
			get: wrappedGetter
		});
	}
	
	function wrapArrayProperty(target, property) {
		var array = target[property];
		var observable = ko.observableArray(array);
		
		var wrapper = Object.create(array);
		array.forEach(function(value, index) {
			wrapObject(value);
			wrapArrayIndex(wrapper, index, observable);
		});
		
		wrapLength(wrapper, observable);
		wrapMutators(wrapper, observable);
		
		target[property] = wrapper;
	}
	
	function wrapArrayIndex(wrapper, index, observable) {
		Object.defineProperty(wrapper, index, {
			get: function() { return observable()[index]; }
		});
	}
	
	function wrapLength(wrapper, observable) {
		var getter = function() {
			return observable().length;
		};
		Object.defineProperty(wrapper, 'length', {
			get: getter
		});
	}
	
	// We need all of these in a single method so that they all have access to the same maxLength variable.
	function wrapMutators(wrapper, observable) {
		var maxLength = observable().length;
		
		wrapper.push = function() {
			var args = Array.prototype.slice.call(arguments);
			args.map(wrapObject);
			observable.push.apply(observable, args);
			maxLength = wrapNewArrayIndexes(wrapper, observable, maxLength);
		};
		
		wrapper.splice = function() {
			var args = Array.prototype.slice.call(arguments);
			var newObjects = args.slice(2);
			newObjects.map(wrapObject);
			observable.splice.apply(observable, args);
			maxLength = wrapNewArrayIndexes(wrapper, observable, maxLength);
		};
	}
	
	function wrapNewArrayIndexes(wrapper, observable, maxLength) {
		var oldLastIndex = maxLength - 1;
		var newLength = observable().length;
		var newLastIndex = newLength - 1;
		for ( var index = oldLastIndex + 1; index <= newLastIndex; index += 1 ) {
			wrapArrayIndex(wrapper, index, observable);
		}
		
		var newMaxLength = Math.max(maxLength, newLength);
		return newMaxLength;
	}
	
	return {
		wrapProperty: wrapProperty,
		wrapObject: wrapObject
	};
}();