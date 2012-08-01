window.addEventListener('load', function() {
	var flatBindings = [
		'checked',
		'click',
		'css',
		'disable',
		'enable',
		'foreach',
		'hasfocus',
		'html',
		'if',
		'ifnot',
		'options',
		'selectedOptions',
		'submit',
		'template',,
		'text',
		'uniqueName',
		'value',
		'visible',
		'with'
	];
	
	var nestedBindings = [
		'attr',
		'event',
		'style'
	];
	
	var bindingNames = [];
	for ( var bindingName in ko.bindingHandlers ) {
		bindingNames.push(bindingName);
	}
	
	wrapKnockout();
	
	function wrapKnockout() {
		var oldKnockout = ko.applyBindings;
		var newKnockout = function(viewModel, rootNode) {
			rootNode = rootNode || document.body;
			convertNode(rootNode);
			oldKnockout(viewModel, rootNode);
		};
		ko.applyBindings = newKnockout;
	}
	
	function convertNode(node) {
		convertNodeData(node);
		convertNodeChildren(node);
	}
	
	function convertNodeData(node) {
		flatBindings.map(function(name) {
			convertFlatBinding(node, name);
		});
		nestedBindings.map(function(name) {
			convertNestedBinding(node, name);
		});
	}
	
	function convertFlatBinding(node, bindingName) {
		var attribute = 'data-bind-' + bindingName;
		
		if ( node.hasAttribute(attribute) ) {
			var expression = node.getAttribute(attribute);
			node.removeAttribute(attribute);
			var knockoutString = bindingName + ': ' + expression;
			
			if ( node.hasAttribute('data-bind') ) {
				knockoutString = node.getAttribute('data-bind') + ', ' + knockoutString;
			}
			
			node.setAttribute('data-bind', knockoutString);
		}
	}
	
	function convertNestedBinding(node, bindingName) {
		var bindingAttribute = 'data-bind-' + bindingName;
		var expressions = {};
		for ( var i = 0; i < node.attributes.length; i += 1 ) {
			var attribute = node.attributes[i].name;
			if ( startsWith(attribute, bindingAttribute) ) {
				// Removes "data-bind-attr-".
				var attributeSuffix = attribute.slice(bindingAttribute.length + 1);
				var expression = node.attributes[i].value;
				expressions[attributeSuffix] = expression;
			}
		}
		
		// We need to remove the attributes after collecting them, or node.attributes.length will change and interfere with the loop.
		for ( var attributeSuffix in expressions ) {
			var attribute = bindingAttribute + '-' + attributeSuffix;
			node.removeAttribute(attribute);
		}
		
		var nestedKnockoutStrings = [];
		for ( var attributeSuffix in expressions ) {
			var expression = expressions[attributeSuffix];
			nestedKnockoutStrings.push(attributeSuffix + ': ' + expression);
		}
		
		if ( nestedKnockoutStrings.length > 0 ) {
			var knockoutString = (
				bindingName + ': { ' +
					nestedKnockoutStrings.join(', ') +
				' }'
			);
			
			if ( node.hasAttribute('data-bind') ) {
				knockoutString = node.getAttribute('data-bind') + ', ' + knockoutString;
			}
			
			node.setAttribute('data-bind', knockoutString);
		}
	}
	
	function convertNodeChildren(node) {
		var children = node.getElementsByTagName('*');
		for ( var i = 0; i < children.length; i += 1 ) {
			convertNode(children[i]);
		}
	}
	
	function startsWith(string, prefix) {
		return string.indexOf(prefix) != -1;
	}
});