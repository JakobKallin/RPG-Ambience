knockwrap = function() {
	function wrapObject(target) {
		if ( target instanceof Object ) {
			for ( var property in target ) {
				wrapProperty(target, property);
			}
			Object.defineProperty(target, 'copy', {
				value: copyObject
			});
		}
	}
	
	function wrapProperty(target, property) {
		var descriptor = Object.getOwnPropertyDescriptor(target, property);
		if ( descriptor.get ) {
			wrapGetter(target, property);
		} else if ( target[property] instanceof Array ) {
			wrapArrayProperty(target, property);
		} else if ( target[property] instanceof Function ) {
			wrapFunctionProperty(target, property);
		} else if ( target[property] instanceof Object ) {
			wrapObjectProperty(target, property);
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
			set: setter,
			enumerable: true
		});
	}
	
	function wrapObjectProperty(target, property) {
		wrapObject(target[property]);
	};
	
	function wrapGetter(target, property) {
		var descriptor = Object.getOwnPropertyDescriptor(target, property);
		var originalGetter = descriptor.get;
		var observable = ko.computed(originalGetter, target);
		var wrappedGetter = function() {
			return observable();
		};
		
		// We save the original getter so that we can copy it later.
		wrappedGetter.original = originalGetter;
		
		Object.defineProperty(target, property, {
			get: wrappedGetter,
			enumerable: true
		});
	}
	
	// We make sure that the proper "this" keyword is used, because Knockout redefines it.
	function wrapFunctionProperty(target, property) {
		var original = target[property];
		target[property] = function() {
			return original.apply(target, arguments);
		};
		target[property].original = original;
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
			get: function() { return observable()[index]; },
			enumerable: true
		});
	}
	
	function wrapLength(wrapper, observable) {
		var getter = function() {
			return observable().length;
		};
		Object.defineProperty(wrapper, 'length', {
			get: getter,
			enumerable: true
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
	
	function copyValue(original) {
		if ( original instanceof Object ) {
			return copyObject.call(original);
		} else {
			return original;
		}
	}
	
	function copyObject() {
		var original = this;
		var copy = {};
		for ( var property in original ) {
			var descriptor = Object.getOwnPropertyDescriptor(original, property);
			// We need to check for .get because the property might be an array or object, and those are not wrapped.
			var propertyIsGetter = descriptor.get && !descriptor.set;
			
			if ( propertyIsGetter ) {
				var descriptor = Object.getOwnPropertyDescriptor(original, property);
				Object.defineProperty(copy, property, {
					// We use the original getter, which will be wrapped below.
					get: descriptor.get.original,
					configurable: true,
					enumerable: true
				});
			} else if ( original[property] instanceof Function ) {
				copy[property] = original[property].original;
			} else if ( original[property] instanceof Array ) {
				copy[property] = [];
				original[property].map(function(originalValue) {
					var copiedValue = copyValue(originalValue);
					copy[property].push(copiedValue);
				});
			} else if ( original[property] instanceof Object ) {
				copy[property] = copyObject.call(original[property]);
			} else {
				copy[property] = copyValue(original[property]);
			}
		};
		
		knockwrap.wrapObject(copy);
		return copy;
	}
	
	return {
		wrapProperty: wrapProperty,
		wrapObject: wrapObject
	};
}();