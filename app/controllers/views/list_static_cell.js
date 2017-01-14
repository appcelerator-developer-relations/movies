var animation = require('/animation');

var args = arguments[0] || {};

$.animateClick = function(callback) {
	animation.flash($.overlay_view, callback);
};
