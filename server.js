require('dotenv').config({ silent: true });

var path = require('path');

var restify = require('restify');
var morgan = require('morgan');
var ffmpeg 	= require('fluent-ffmpeg');
var validator = require('validator');

if(!process.env.base_path){
  process.env.base_path = '/';
}

if(process.env.ffmpeg_dir){
	ffmpeg.setFfmpegPath(path.join(process.env.ffmpeg_dir, 'ffmpeg'));
	ffmpeg.setFfprobePath(path.join(process.env.ffmpeg_dir, 'ffprobe'));
}

var logger = morgan(process.env.log_format || 'common');

var server = restify.createServer();

server.use(restify.queryParser());
server.use(logger);

server.get(process.env.base_path, function(req, res, next){
	var video_url = req.query.video_url;

	if(!video_url)
  		return next(new restify.MissingParameterError('Missing video_url.'));

  	if(!validator.isURL(video_url))
  		return next(new restify.InvalidArgumentError('video_url is not a valid URL.'));

  	ffmpeg.ffprobe(video_url, function(err, metadata) {
		return err ? next(err) : res.send(metadata);
	});
});

server.listen(process.env.port || 3000);
