// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.FileButton = function() {
	return {
		restrict: 'E',
		template: '<input type="file">',
		scope: {
			onNewFileSelected: '=whenFileSelected'
		},
		replace: true,
		link: function(scope, $input, attrs) {
			var input = $input[0];
			input.addEventListener('change', function(event) {
				var file = event.target.files[0];
				scope.onNewFileSelected(file);
			});
		}
	};
};