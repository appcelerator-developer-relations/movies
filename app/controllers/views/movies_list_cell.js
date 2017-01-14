var animation = require('/animation');

exports.animateClick = function(callback) {
	animation.flash($.overlay_view, callback);	
};
