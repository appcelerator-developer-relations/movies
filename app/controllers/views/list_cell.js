var alloyAnimation = require('alloy/animation'),
	animation = require('/animation');

var _images = [];
var _currentImageIndex = 0;
var _currentImageView = 'imageview';
var _animationInterval;

$.populateImages = function(images) {
	_images = images;
	$.imageview.image = _images[0];
	Ti.API.debug('Images: ' + images);
};

$.animateImages = function() {

	var nextImageIndex = (_currentImageIndex >= _images.length - 1) ? 0 : _currentImageIndex + 1;
	var nextImageView = (_currentImageView == 'imageview') ? 'imageview1' : 'imageview';

	$[_currentImageView].zIndex = 0;
	$[nextImageView].opacity = 0;
	$[nextImageView].zIndex = 1;
	$[nextImageView].image = _images[nextImageIndex];

	if (OS_IOS) {
		$[nextImageView].animate({
			opacity: 1,
			duration: 1000
		});
	}
	if (OS_WINDOWS) {
		$[nextImageView].animate({
			opacity: 1,
			duration: 1000
		});
	}

	_currentImageIndex = nextImageIndex;
	_currentImageView = nextImageView;
};

$.animateClick = function(callback) {
	animation.flash($.overlay_view, callback);
};

if (OS_ANDROID) {
	$.imageview.addEventListener('load', function(e){
		$.imageview.animate({
			opacity: 1,
			duration: 1000
		});
	});
	
	$.imageview1.addEventListener('load', function(e){
		$.imageview1.animate({
			opacity: 1,
			duration: 1000
		});
	});
}

$.title_label.addEventListener('postlayout', function(e){
	if ($.title_label.text.indexOf(' ') == -1) {
		if (OS_IOS) {
			$.title_label.minimumFontSize = $.title_label.font.size;
		} else if (OS_ANDROID) {
			$.title_label.wordWrap = false;
		}
	}
});
