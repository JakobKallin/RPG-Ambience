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
		for ( var property in target ) {
			wrapProperty(target, property);
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
		
		return observable;
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
		
		wrapper.push = wrappedPush(wrapper, observable);
		wrapLength(wrapper, observable);
		wrapSplice(wrapper, observable);
		
		target[property] = wrapper;
	}
	
	function wrapArrayIndex(wrapper, index, observable) {
		Object.defineProperty(wrapper, index, {
			get: function() { return observable()[index]; }
		});
	}
	
	function wrappedPush(wrapper, observable) {
		return function() {
			var args = Array.prototype.slice.call(arguments);
			args.map(wrapObject);
			var oldLength = observable().length;
			observable.push.apply(observable, args);
			wrapNewArrayIndexes(wrapper, observable, oldLength);
		};
	}
	
	function wrapNewArrayIndexes(wrapper, observable, oldLength) {
		var lastOldIndex = oldLength - 1;
		var lastNewIndex = observable().length - 1;
		for ( var index = lastOldIndex + 1; index <= lastNewIndex; index += 1 ) {
			wrapArrayIndex(wrapper, index, observable);
		}
	}
	
	function wrapLength(wrapper, observable) {
		var getter = function() {
			return observable().length;
		};
		Object.defineProperty(wrapper, 'length', {
			get: getter
		});
	}
	
	function wrapSplice(wrapper, observable) {
		wrapper.splice = function() {
			var args = Array.prototype.slice.call(arguments);
			var newObjects = args.slice(2);
			newObjects.map(wrapObject);
			var oldLength = observable().length;
			observable.splice.apply(observable, args);
			wrapNewArrayIndexes(wrapper, observable, oldLength);
		};
	}
	
	return {
		wrapProperty: wrapProperty,
		wrapObject: wrapObject
	};
}();