var path = require('path');

var restify = require('restify');
var morgan = require('morgan');
var ffmpeg 	= require('fluent-ffmpeg');
var validator = require('validator');

var config = require('./config.json');

if(process.env && process.env.PORT){
  config.port = process.env.PORT;
}

if(!config.basePath){
  config.basePath = '/';
}

if(config.ffmpegDir){
	ffmpeg.setFfmpegPath(path.join(config.ffmpegDir, 'ffmpeg'));
	ffmpeg.setFfprobePath(path.join(config.ffmpegDir, 'ffprobe'));
}

var logger = morgan(config.logFormat);

var server = restify.createServer();

server.use(restify.queryParser());
server.use(logger);

server.get(config.basePath, function(req, res, next){
	var video_url = encodeURI(req.query.video_url);

	if(!video_url)
  		return next(new restify.MissingParameterError('Missing video_url.'));

  	if(!validator.isURL(video_url))
  		return next(new restify.InvalidArgumentError('video_url: ' + video_url + ' is not a valid URL.'));

  	ffmpeg.ffprobe(video_url, function(err, metadata) {
		return err ? next(err) : res.send(metadata);
	});
});

server.listen(config.port);
