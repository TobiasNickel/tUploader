var express = require('express');
var fs = require('file-system');
var formidable = require('formidable');

var app = express();
var http = require('http').Server(app);

app.use('/uploads',express.static(__dirname+ '/uploads'));

/**
 *	an allow crossDomain middleware
 */
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//	res.end();
    next();
}
app.use(allowCrossDomain);

// the upload route itself, 
app.post('/upload.json', function(req, res,next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/json'});
        res.write('received upload:\n\n');
        res.end("end");
    });
    form.uploadDir=__dirname + '/uploads/';
    form.on('end', function(fields, files) {
		if(this.openedFiles[0]){
			var name = this.openedFiles[0].name;
			//console.log(this.openedFiles[0]);
        	fs.rename(this.openedFiles[0].path, __dirname+'/uploads/'+name);
        }
    });
});

// upload route, that is used for cross domain
app.use('/upload.json', function(req, res,next) {
	res.end('true');
});

// static file routes for the client code
app.get('/upload.html',function(req, res,next) {
	res.end(fs.readFileSync(__dirname+'/upload.html')+'');
})
app.get('/tUploader.js',function(req, res,next) {
	res.end(fs.readFileSync(__dirname+'/tUploader.js')+'');
})
app.get('/tUploader.min.js',function(req, res,next) {
	res.end(fs.readFileSync(__dirname+'/tUploader.js')+'');
})


// route for loading the list of uploaded files
app.use('/uploads.json',function(req,res,next){
    fs.readdir(__dirname + '/uploads/', function(err,files){
        res.json(files);
    })
});

// removing a file
app.get('/delete.json',function(req,res){

	var filename = req.query.name;
	if(!filename){res.json(false);return}
	filename = filename.split('/');
	filename = filename[filename.length-1];
	fs.unlink(__dirname+'/uploads/'+filename);
	res.json(filename);
})

//end app space


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.end('error');
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.end('error');
});

http.listen(1111, function(){
  console.log('listening on *:1111');
});