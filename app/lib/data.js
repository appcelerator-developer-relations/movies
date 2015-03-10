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

/**
 * Load JSON file
 * @param {String} name
 * @param {Function} callback
 */
function loadJsonFile(name, callback) {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, '/data/' + name + '.json');

	if (file.exists()) {
  		var dataSrc = Ti.Platform.osname === 'android' ? ''+file.read() : file.read();
  		data = JSON.parse(dataSrc);
  		callback(null, data);
  		return; 
	}

 	callback("Error loading JSON file '" + name + "'");
}

/**
 * Data 
 */
var Data = {
	
	get_config: function(callback) {
		loadJsonFile('config', callback);
	},
	
	movies_get_lists: function(callback) {
	   loadJsonFile('lists', callback);
	},
	
	movies_get_list: function(callback) {
	   loadJsonFile('list', callback);
	},
	
	movies_get_genres: function(callback) {
	   loadJsonFile('genres', callback);
	},
	
	movies_get_genre: function(callback) {
	   loadJsonFile('genre', callback);
	},
	
	movies_search: function(query, callback) {
	   loadJsonFile('list', function(error, e){
	   		if (!error) {
	   			var results = _.filter(e.movies, function(movie){
	   				return (new RegExp(query, 'i')).test(movie.title);
	   			});
	   			callback(null, results);
	   		} else {
	   			callback(error);
	   		}
	   });
	},
	
	movies_get_movie: function(callback) {
	   loadJsonFile('movie', callback);
	}
};

module.exports = Data;

