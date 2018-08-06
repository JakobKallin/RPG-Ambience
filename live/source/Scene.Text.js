// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.App.Scene.Text = function() {
	return {
		string: '',
		size: 5,
		font: '',
		color: '#ffffff',
		bold: false,
		italic: false,
		alignment: 'center',
		padding: 0,
		get style() {
			return (this.italic) ? 'italic' : 'normal';
		},
		get weight() {
			return (this.bold) ? 'bold' : 'normal';
		}
	};
}