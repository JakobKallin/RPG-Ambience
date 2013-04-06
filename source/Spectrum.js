// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

// Prevent Spectrum from automatically altering all of the color inputs.
$.fn.spectrum.load = false;

Ambience.Spectrum = function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, $input, attrs, ngModel) {
			var input = $input[0];
			
			$(input).spectrum({
				change: onChange,
				move: onChange,
				clickoutFiresChange: true,
				showAlpha: false,
				showButtons: false,
				color: scope.$eval(attrs.ngModel)
			});
			
			read();
			
			ngModel.$render = function() {
				$(input).spectrum('set', ngModel.$viewValue);
			}
			
			function onChange() {
				scope.$apply(read);
			}
			
			function read() {
				ngModel.$setViewValue($(input).spectrum('get').toHexString());
			}
			
			$input.bind('$destroy', function() {
				$(input).spectrum('destroy');
			});
		}
	};
};