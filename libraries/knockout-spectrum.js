ko.bindingHandlers.spectrum = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
		var property = valueAccessor();
		var onChange = function(color) {
			// Account for Knockwrap.
			if ( viewModel[property] instanceof Function ) {
				viewModel[property](color.toHslString());
			} else {
				viewModel[property] = color.toHslString();
			}
		};
		$(element).spectrum({
			change: onChange,
			move: onChange,
			clickoutFiresChange: true,
			showAlpha: true,
			showButtons: false
		});
		$(element).spectrum('set', viewModel[property]);
	}
};