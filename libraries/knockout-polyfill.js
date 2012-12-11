ko.bindingHandlers.polyfill = function() {
	return {
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, context) {
			if ( ko.virtualElements.firstChild(element) ) {
				ko.virtualElements.childNodes(element).forEach(function(child) {
					if (child.nodeType === 1) {
						var addedEvent = document.createEvent('CustomEvent');
						addedEvent.initCustomEvent('added', true, true, null)
						child.dispatchEvent(addedEvent);
						ko.utils.domNodeDisposal.addDisposeCallback(child, function() {
							var removedEvent = document.createEvent('CustomEvent');
							removedEvent.initCustomEvent('added', true, true, null)
							child.dispatchEvent(removedEvent);
						});
					}
				});
			}
		}
	};
}();

ko.virtualElements.allowedBindings.polyfill = true;