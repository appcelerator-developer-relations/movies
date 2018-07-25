/**
 * Movies
 *
 * @copyright
 * Copyright (c) 2015-present by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */
/**
 * Load JSON file
 * @param {String} name The name of the JSON file
 * @param {Function} callback The callback invoked once parse
 */
function loadJsonFile(name, callback) {
  try {
    const data = require('data/' + name);
    callback(null, data);
  } catch (e) {
    callback('Error loading JSON file \'' + name + '\'');
  }
}

/**
   * Data
   */
var Data = {

  get_config: function (callback) {
    loadJsonFile('config', callback);
  },

  movies_get_lists: function (callback) {
    loadJsonFile('lists', callback);
  },

  movies_get_list: function (callback) {
    loadJsonFile('list', callback);
  },

  movies_get_genres: function (callback) {
    loadJsonFile('genres', callback);
  },

  movies_get_genre: function (callback) {
    loadJsonFile('genre', callback);
  },

  movies_search: function (query, callback) {
    loadJsonFile('list', function (error, e) {
      if (!error) {
        var results = _.filter(e.movies, function (movie) {
          return (new RegExp(query, 'i')).test(movie.title); // eslint-disable-line security/detect-non-literal-regexp
        });
        callback(null, results);
      } else {
        callback(error);
      }
    });
  },

  movies_get_movie: function (callback) {
    loadJsonFile('movie', callback);
  }
};

module.exports = Data;
