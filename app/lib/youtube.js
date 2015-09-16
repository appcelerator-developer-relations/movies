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

var lib = Alloy.Globals;
 
var win = null,
    videoPlayer = null;
 
exports.isPlaying = false;
 
exports.play = function(id) {
    exports.isPlaying = true;
    // getVideo(id);
    
    h264videosWithYoutubeURL(id, function success(e) {
    	playVideo(e);
    	
    }, function error(e) {
    	Ti.API.error("Error: " + e);
    });
    
};

function getURLArgs(_string) {
    var args = {};
    var pairs = _string.split("&");
    for(var i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf('=');
        if (pos == -1) continue;
        var argname = pairs[i].substring(0,pos);
        var value = pairs[i].substring(pos+1);
        args[argname] = unescape(value);
    }
    return args;
}

function h264videosWithYoutubeURL(_youtubeId, _callbackOk, _callbackError)
{
    var youtubeInfoUrl = 'http://www.youtube.com/get_video_info?video_id=' + _youtubeId;
    var request = Titanium.Network.createHTTPClient({ timeout : 10000  /* in milliseconds */});
    request.open("GET", youtubeInfoUrl);
    request.onerror = function(_event){
        if (_callbackError)
            _callbackError({status: this.status, error:_event.error});
    };  
    request.onload = function(_event){
        var qualities = [];
        var response = this.responseText;
        var args = getURLArgs(response);
        if (!args.hasOwnProperty('url_encoded_fmt_stream_map'))
        {
            if (_callbackError)
                _callbackError();
        }
        else
        {
            var fmtstring = args['url_encoded_fmt_stream_map'];
            var fmtarray = fmtstring.split(',');
            for(var i=0,j=fmtarray.length; i<j; i++){
                var args2 = getURLArgs(fmtarray[i]);
                var type = decodeURIComponent(args2['type']);
                if (type.indexOf('mp4') >= 0)
                {
                    var url = decodeURIComponent(args2['url']);
                    var quality = decodeURIComponent(args2['quality']);
                        // qualities[quality] = url;
                        qualities.push(url);
                    }
                }
                if (_callbackOk)
                    _callbackOk(qualities[0]);
                }
        };
        request.send();
 
 
}
 
function getVideo(id) {
    var client = Ti.Network.createHTTPClient();
    client.onload = function () {
        var json = decodeURIComponent(decodeURIComponent(decodeURIComponent(decodeURIComponent(this.responseText.substring(4, this.responseText.length)))));
        var response = JSON.parse(json);
        var video = response.content.video;
        var isHighQuality = video['fmt_stream_map'] != null;
        var streamUrl = isHighQuality ? video['fmt_stream_map'][0].url : video.stream_url;
        if(!isHighQuality) {
            Ti.API.info('using low quality video because fmt_stream_map does not exist in json response, User-Agent probably is not being sent correctly');
        }
        playVideo(streamUrl);
    };
    if(OS_IOS) {
        client.setRequestHeader('Referer', 'http://www.youtube.com/watch?v=' + id);
        client.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.14 (KHTML, like Gecko) Version/6.0.1 Safari/536.26.14');
    }
    client.open('GET', 'http://m.youtube.com/watch?ajax=1&layout=mobile&tsp=1&utcoffset=330&v=' + id);
    if(OS_ANDROID) {
        client.setRequestHeader('Referer', 'http://www.youtube.com/watch?v=' + id);
        client.setRequestHeader('User-Agent', 'Mozilla/5.0 (Linux; U; Android 2.2.1; en-gb; GT-I9003 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1');
    }
    client.send();
}
 
function playVideo(url) {
    if(OS_IOS) {
        win = Ti.UI.createWindow({
            title: 'View Training Video',
            backgroundColor: '#000'
        });
    }
    if(OS_WINDOWS) {
        win = Ti.UI.createWindow({
            title: 'View Training Video',
            backgroundColor: '#000'
        });
    }
    videoPlayer = Ti.Media.createVideoPlayer({
        backgroundColor: '#000',
        url: url,
        fullscreen: true,
        autoplay: true,
        scalingMode: Ti.Media.VIDEO_SCALING_ASPECT_FIT,
        mediaControlMode: Ti.Media.VIDEO_CONTROL_DEFAULT   
    });
    videoPlayer.addEventListener('complete', function(e) { 
        Ti.API.info('video player complete');
        exports.close();
    });
    videoPlayer.addEventListener('fullscreen', function(e) {
        if (!e.entering) {
            Ti.API.info('video player fullscreen exit');
            exports.close();
        }
    });
    if(OS_IOS) {
        win.add(videoPlayer);
        win.open();
    }
    if(OS_WINDOWS) {
        win.add(videoPlayer);
        win.open();
    }
}
 
exports.close = function() {
    Ti.API.info('closing video player');
    
    if(OS_IOS) {
    	if (videoPlayer) {
	        videoPlayer.fullscreen = false;
	    }
        win && win.close();
        win = null;
    } else if (OS_WINDOWS) {
        win && win.close();
        win = null;
    } else {
    	if (videoPlayer) {
	        videoPlayer.hide();
	        videoPlayer.release();
	        videoPlayer = null;
	    }
    }
    exports.isPlaying = false;
};
