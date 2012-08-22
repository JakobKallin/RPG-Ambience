ko.bindingHandlers.sortable = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
		var sortedIndex;

		var onSortStarted = function(event, ui) {
			sortedIndex = ui.item.index();
		}
		
		var onSortEnded = function(event, ui) {
			// Remove the reordered node.
			var oldIndex = sortedIndex;
			var newIndex = ui.item.index();
			ui.item.remove();
			
			// Apply the corresponding reordering through Knockout.
			var observable = allBindingsAccessor().foreach;
			// Account for Knockwrap.
			if ( observable instanceof Function ) {
				var sortedValue = observable()[oldIndex];
			} else {
				var sortedValue = observable[oldIndex];
			}
			observable.splice(oldIndex, 1);
			observable.splice(newIndex, 0, sortedValue);
			
			// Apparently, the Knockout templating engine takes care of the rest.
		};
		
		$(element).sortable({
			axis: 'y',
			start: onSortStarted,
			stop: onSortEnded
		});
	}
};