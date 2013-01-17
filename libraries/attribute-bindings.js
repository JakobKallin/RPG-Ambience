var attributeBindings = new function() {
	var processDocument = function() {
		processNode(document.body);
	};

	var processNode = function(node) {
		if ( node.getAttribute('is-attribute-bound') ) {
			return;
		}
		
		convertBindings(node);
		node.setAttribute('is-attribute-bound', true);
	
		Array.prototype.forEach.call(node.children, processNode);
	};
	
	var propertyFromDataAttribute = function(attribute) {
		var words = attribute.name.split('-');
		var relevantWords = words.slice(1); // Remove "data".
		var capitalizedWords = relevantWords.slice(0, 1).concat(relevantWords.slice(1).map(capitalize));
		return capitalizedWords.join('');
	};
	
	var capitalize = function(string) {
		return string.charAt(0).toUpperCase() + string.substring(1);
	};
	
	var bindingGroups = ['attr', 'bind', 'css', 'event', 'style']
	var convertBindings = function(node) {
		var bindings = {};
		
		var dataAttributes = [];
		for ( var i = 0; i < node.attributes.length; ++i ) {
			if ( node.attributes.item(i).name.startsWith('data-') ) {
				dataAttributes.push(node.attributes.item(i));
			}
		}
		
		dataAttributes.forEach(function(attribute) {
			var property = propertyFromDataAttribute(attribute);
			var expression = attribute.value;
			var matchesExpression = function(groupName) { return property.startsWith(groupName); };
			var groupName = bindingGroups.first(matchesExpression);
			if ( groupName ) {
				var bindingName = property.substring(groupName.length).firstToLowerCase();
				
				if ( groupName === 'bind' ) {
					bindings[bindingName] = expression;
				} else {
					bindings[groupName] = bindings[groupName] || {};
					bindings[groupName][bindingName] = expression;
				}
				
				node.removeAttribute(attribute.name);
			} else {
				throw new Error("'" + groupName + "' in node data '" + property + "' is not a valid binding group.");
			}
		});
		
		var bindingString = serializeBindings(bindings);
		if ( bindingString !== '' ) {
			node.setAttribute('data-bind', bindingString);
		}
	};

	var serializeBindings = function(bindings) {
		var bindingStrings = [];
		for ( var bindingName in bindings ) {
			bindingStrings.push(serializeBinding(bindings, bindingName));
		}
		return bindingStrings.join(', ');
	};

	var serializeBinding = function(bindings, bindingName) {
		var expression = bindings[bindingName];
		if ( typeof expression === 'string' ) {
			return bindingName + ': ' + expression;
		} else {
			return bindingName + ': { ' + serializeBindings(expression) + ' }';
		}
	};

	return {
		processDocument: processDocument,
		processNode: processNode
	};
}();
