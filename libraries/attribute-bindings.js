var attributeBindings = new function() {
	var processDocument = function() {
		processNode(document.body);
	};

	var processNode = function(node) {
		if ( node.dataset.isAttributeBound ) {
			return;
		}
		
		convertBindings(node);
		node.dataset.isAttributeBound = true;
		
		Array.prototype.forEach.call(node.children, processNode);
	};
	
	var bindingGroups = ['attr', 'bind', 'css', 'event', 'style']
	var convertBindings = function(node) {
		var bindings = {};

		for ( var property in node.dataset ) {
			var expression = node.dataset[property];
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
				
				delete node.dataset[property];
			} else {
				throw new Error("'" + groupName + "' in node data '" + property + "' is not a valid binding group.");
			}
		}
		
		var bindingString = serializeBindings(bindings);
		if ( bindingString !== '' ) {
			node.dataset.bind = bindingString;
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
