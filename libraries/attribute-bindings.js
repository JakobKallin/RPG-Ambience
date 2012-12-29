var attributeBindings = new function() {
	var processDocument = function() {
		var nodes = document.getElementsByTagName('*');
		Array.prototype.forEach.call(nodes, processNode);
	};

	var processNode = function(node) {
		convertContext(node);
		convertLoop(node);
		convertSortableLoop(node);
		convertConditional(node);
		convertOtherBindings(node);
	};

	var convertContext = function(node) {
		convertToVirtualElement(node, 'context', 'with');
	};

	var convertLoop = function(node) {
		convertToVirtualElement(node, 'forall', 'foreach');
	};

	var convertSortableLoop = function(node) {
		var startComment = convertToVirtualElement(node, 'forallSortable', 'foreach');

		if ( startComment ) {
			var startComment = node.previousSibling;
			startComment.textContent =
				startComment.textContent.substring(0, startComment.textContent.length - 1) +
					', sortable: true ';
		}
	};

	var convertConditional = function(node) {
		convertToVirtualElement(node, 'if');
	};

	var convertToVirtualElement = function(node, customBinding, knockoutBinding) {
		if ( !node.dataset[customBinding] ) {
			return null;
		}

		knockoutBinding = knockoutBinding || customBinding;

		var expression = node.dataset[customBinding];
		var startCommentString = ' ko ' + knockoutBinding + ': ' + expression + ' ';
		var startComment = document.createComment(startCommentString);
		node.parentNode.insertBefore(startComment, node);

		var endCommentString = ' /ko ';
		var endComment = document.createComment(endCommentString);
		node.parentNode.insertBefore(endComment, node.nextSibling);

		delete node.dataset[customBinding];

		return startComment;
	};

	var bindingGroups = {
		attr: 'attr',
		bind: 'bind',
		class: 'css',
		handle: 'event',
		style: 'style'
	};
	var convertOtherBindings = function(node) {
		var bindings = {};

		for ( var property in node.dataset ) {
			var expression = node.dataset[property];
			for ( var groupName in bindingGroups ) {
				var knockoutGroupName = bindingGroups[groupName];
				if ( property.startsWith(groupName) ) {
					var bindingName = property.substring(groupName.length).firstToLowerCase();

					if ( groupName === 'bind' ) {
						bindings[bindingName] = expression;
					} else {
						bindings[knockoutGroupName] = bindings[knockoutGroupName] || {};
						bindings[knockoutGroupName][bindingName] = expression;
					}
				}
			}
			delete node.dataset[property];
		}

		var bindingString = serializeBindings(bindings);
		node.dataset.bind = bindingString;
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
		processDocument: processDocument
	};
}();
