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

var Data = require("data"),
	theMovieDb = require('themoviedb'),
	yt = require('youtube'),
	animation = require('animation');

var IMDB_BASE_URL = 'http://www.imdb.com/title/';

var args = arguments[0] || {};
var movie;
var images_loaded = 0;
var can_play_trailer = false;

/**
 * init
 */
function init() {
	
	$.window.removeEventListener("open", init);
	
	$.activity_indicator.show();
	
	if (args.id) {
		Ti.Analytics.featureEvent('view:movie');
		fetchMovie(args.id);
	} else if (args.movie) {
		movie = args.movie;
	}
}

/**
 * fetch movie
 * @param {String} id
 */
function fetchMovie(id) {
	
	Data.movies_get_movie(function(error, e) {
		if (!error) { 
			movie = e;
			Ti.Analytics.featureEvent('view:movie.' + movie.title);
			populateMovie(e);
		} else {
			Ti.API.error("Error: " + JSON.stringify(JSON.parse(e), null, 4));
		}
	});
	
}

/**
 * populate movie
 * @param {Object} movie
 */
function populateMovie(movie) {
	
	$.background_imageview.image = theMovieDb.common.getImage({
		size: Alloy.Globals.backdropImageSize,
		file: movie.backdrop_path
	});
	
	$.poster_imageview.image = theMovieDb.common.getImage({
		size: Alloy.Globals.posterImageSize,
		file: movie.poster_path
	});
	
	$.title_label.text = movie.title;
	$.info_label.text = durationString(movie.runtime);
	if (movie.release_date) $.info_label.text += '  |  ' + movie.release_date.substr(0, 4); 
	var info_label_max_y = $.info_label.rect.y + $.info_label.rect.height;

	if (movie.homepage || movie.imdb_id) {
		
		if (movie.homepage) {
			$.website_button.top = info_label_max_y + 15;
		} else {
			$.details_view.remove($.website_button);
		}
		
		if (movie.imdb_id) {
			if (!movie.homepage) $.imdb_button.left = $.website_button.left; 
			$.imdb_button.top = info_label_max_y + 15;
		} else {
			$.details_view.remove($.imdb_button);
		}
	}

	// synopsis
	$.synopsis_label.text = movie.overview;
	var synopsis_height = 0;
	$.synopsis_label.addEventListener('postlayout', function synopsisPostLayout(e) {
		
		if ($.synopsis_label.rect.height == synopsis_height) {
			return;
		}
		synopsis_height = $.synopsis_label.rect.height;
		 
		$.details_scrollview.contentHeight = $.synopsis_label.rect.y + $.synopsis_label.rect.height + 20;
		$.details_scrollview.contentHeight = Math.max($.details_scrollview.contentHeight, Alloy.Globals.Device.height + 1);
	});
	
	if (movie.trailer) {
		can_play_trailer = true;
	} else {
		$.poster.remove($.play_button);
	}
}

/**
 * duration in hours and minutes
 * @param {Number} minutes
 * @return {String}
 */
function durationString(minutes) {
	
	var hours = Math.floor(minutes/60);
	minutes = minutes - (hours * 60);
	var duration = (hours > 0) ? hours + "h " : "";
	duration += (minutes > 9) ? minutes + "m" : "0" + minutes + "m";
	return duration;
}

/**
 * animate in
 */
function animateIn() {
	images_loaded++;
	if (images_loaded < 2) return;
	
	$.activity_indicator.hide();
	
	var background_animation = Ti.UI.createAnimation({
		opacity: 1,
		duration: 1000,
		curve: Titanium.UI.ANIMATION_CURVE_EASE_OUT
	});
	$.background_imageview.animate(background_animation);
	
	var details_animation = Ti.UI.createAnimation({
		opacity: 1,
		duration: 500,
		delay: 800,
		curve: Titanium.UI.ANIMATION_CURVE_EASE_OUT
	});
	$.details_scrollview.animate(details_animation);
}



///////////////////////////////////////////////////////////////////////////////
//
// event handlers
//
///////////////////////////////////////////////////////////////////////////////

/**
 * window open
 */
$.window.addEventListener("open", init);

/**
 * background imageview load
 */
$.background_imageview.addEventListener('load', function(e) {
	$.background_gradient_view.height = e.source.rect.height + 2; // hacky :(
	animateIn();
});

/**
 * poster imageview load
 */
$.poster_imageview.addEventListener('load', animateIn);

/**
 * scrollview scroll
 */
$.details_scrollview.addEventListener('scroll', function(e) {
	
	var opacity = 1.0;
	var offset = e.y;
	
	if (offset <= 0) {
		
		var height = Alloy.Globals.layout.movie.backdropImageHeight - offset;
		var scale = height / Alloy.Globals.layout.movie.backdropImageHeight;
		
		var transform = Ti.UI.create2DMatrix({scale: scale});
		transform = transform.translate(0, -offset/(2*scale));
		
		$.background_imageview.transform = $.background_gradient_view.transform = transform;
		$.background_imageview.opacity = 1;
		
	} else if (offset > 0) {
		
		opacity = Math.max(1 - (offset / 200), 0.5);
		$.background_imageview.opacity = opacity; 
	}

});

/**
 * play button click
 */
$.play_button.addEventListener('click', function(e){
	if (can_play_trailer) {
		Ti.Analytics.featureEvent('view:trailer');
		$.play_button.touchEnabled = false;
		animation.flash($.poster_overlay_view, function(){
			yt.play(movie.trailer.source);
			setTimeout(function(){
				$.play_button.touchEnabled = true;
			}, 2000);
		});
	}
});

/**
 * website button click
 */
$.website_button.addEventListener('click', function(e){
	if (movie.homepage) {
		Ti.Analytics.featureEvent('open:movie.website');
		Ti.Platform.openURL(movie.homepage);
	}
});

/**
 * IMDB button click
 */
$.imdb_button.addEventListener('click', function(e){
	if (movie.imdb_id) {
		Ti.Analytics.featureEvent('open:movie.imdb');
		Ti.Platform.openURL(IMDB_BASE_URL + movie.imdb_id);
	}
});
