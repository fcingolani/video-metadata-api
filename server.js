require('dotenv').config({ silent: true });

var path = require('path');

var Bunyan = require('bunyan');
var restify = require('restify');
var ffmpeg 	= require('fluent-ffmpeg');
var validator = require('validator');

var packageJSON = require('./package.json');

var ffprobeOptions = [];

if(process.env.ffprobe_timeout_milliseconds){
  ffprobeOptions.push('-timeout');
  ffprobeOptions.push(process.env.ffprobe_timeout_milliseconds * 1000);
}

if(!process.env.base_path){
  process.env.base_path = '/';
}

if(process.env.ffmpeg_dir){
	ffmpeg.setFfmpegPath(path.join(process.env.ffmpeg_dir, 'ffmpeg'));
	ffmpeg.setFfprobePath(path.join(process.env.ffmpeg_dir, 'ffprobe'));
}

var log = new Bunyan({
  name: 'video-metadata-api',
  level: process.env.log_level || 'info' // jshint ignore:line
});


var server = restify.createServer({
  name: packageJSON.name + ' ' + packageJSON.version,
  log: log
});

server.use(restify.requestLogger());

server.use(restify.queryParser());

server.get(process.env.base_path, function getMetadata(req, res, next){
	var video_url = req.query.video_url;

	if(!video_url){
    return next(new restify.MissingParameterError('Missing video_url.'));
  }

	if(!validator.isURL(video_url)){
    return next(new restify.InvalidArgumentError('video_url is not a valid URL.'));
  }

  ffmpeg.ffprobe(video_url, ffprobeOptions, function(err, metadata) {

		if(err){
      next(err);
    }else{
      req.log.debug({
        metadata: metadata
      }, 'Metadata extracted.');
      res.send(metadata);
      next();
    }

	});
});

server.get(process.env.base_path + 'check', function check(req, res, next){
  res.send('ok');
  next();
});

server.on('after', restify.auditLogger({
    log: log
}));

server.listen(process.env.port || 3000, function() {
  server.log.info('%s listening at %s', server.name, server.url);
});
