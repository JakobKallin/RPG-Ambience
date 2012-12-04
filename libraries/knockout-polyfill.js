ko.bindingHandlers.polyfill = function() {
	return {
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, context) {
			if ( ko.virtualElements.firstChild(element) ) {
				ko.virtualElements.childNodes(element).forEach(function(child) {
					if (child.nodeType === 1) {
						child.dispatchEvent(new CustomEvent('added', { bubbles: true }));
						ko.utils.domNodeDisposal.addDisposeCallback(child, function() {
							child.dispatchEvent(new CustomEvent('removed', { bubbles: true }));
						});
					}
				});
			}
		}
	};
}();

ko.virtualElements.allowedBindings.polyfill = true;