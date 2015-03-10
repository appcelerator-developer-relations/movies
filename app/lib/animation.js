/**
 * Movies
 * 
 * @copyright
 * Copyright (c) 2015 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

exports.flash = function(view, callback) {

	var in_animation = Ti.UI.createAnimation({
		opacity: 0.7,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
		duration: 100
	});
	in_animation.addEventListener('complete', function(e){		
		var out_animation = Ti.UI.createAnimation({
			opacity: 0,
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
			duration: 300	
		});
		out_animation.addEventListener('complete', function(e){
			callback();
		});
		view.animate(out_animation);
	});
	view.animate(in_animation);
		
};