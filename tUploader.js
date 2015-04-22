/**
 *@author: Tobias Nickel
 *@description: The tUploader is a part of my t-Microlib series.
 * This lib is defining the tUploader as a singleton object. 
 * It hooks into the drag and drop api of the document and prevents all the browse standart behavior.
 * There for it provides a very simple way to upload handle the file upload from the client side.
 * t allows you 
 */
tUploader =(function(document){
// loading tStabilizer from https://github.com/TobiasNickel/tStabilizer
tStabilizer=function(c){c=c||Infinity;this.values=[];this.push=function(a){for(this.values.push(a);this.values.length>c;)this.values.shift()};this.getAvarage=function(){return this.getSum()/this.values.length};this.getMax=function(){for(var a=-Infinity,b=this.values.length;b--;)a=a<this.values[b]?this.values[b]:a;return a};this.getMin=function(){for(var a=Infinity,b=this.values.length;b--;)a=a>this.values[b]?this.values[b]:a;return a};this.getSum=function(){for(var a=0,b=this.values.length;b--;)a+=this.values[b];return a}};
// tmitter.min.js from https://github.com/TobiasNickel/tMitter
function tMitter(b){b._events={};b.on=function(a,c){a=a.toLowerCase();a in this._events||(this._events[a]=[]);-1===this._events[a].indexOf(c)&&this._events[a].push(c)};b.off=function(a,c){a?c?delete this._events[a][this._events[a].indexOf(c)]:delete this._events[a]:this._events={}};b.trigger=function(a,c){if(a&&this._events[a])for(var b=this._events[a].length;b--;)this._events[a][b](c)}};
	
	var body=null;
	// the input that is used for the filebrowser
	var input = document.createElement('input');
	input.setAttribute('type', 'file');
	input.setAttribute('multiple', 'true');
	input.onchange = function(){
		// call the drop method, with an object that looks like an event. 
		drop({dataTransfer:{files: input.files}, stopPropagation: function(){}, preventDefault: function(){}});
	};
	// the droparea for the autoTropzone filling the whole screen
	var autoDroparea = document.createElement('div');
	autoDroparea.setAttribute('style','position:fixed;top:0px;bottom:0px;right:0px;left:0px;z-index:100;background-color:rgba(255,255,50,0.6);border:brown dashed 3px;display:none;margin:0px;');
	
	//preparing the eventlistener
	window.addEventListener('load',function(){
		body  = document.body;
		body.appendChild(autoDroparea);
		document.addEventListener("dragenter", dragenter, false);
		document.addEventListener("dragstart", dragenter, false);
		autoDroparea.addEventListener("dragleave", dragleave, false);
		document.addEventListener("dragend", dragleave, false);
		
		document.addEventListener("dragover", dragover, false);
		document.addEventListener("drop", drop, false);
	});
	// used to not let the browse catch the file and displaying it.
	function dragenter(e) {
		e.stopPropagation();
		e.preventDefault();
	}

	function dragover(e) {
		e.stopPropagation();
		e.preventDefault();
		if(tUploader.autoDroparea){
			autoDroparea.style.display = 'block';
		}
	}
	function dragleave(e) {
		e.stopPropagation();
		e.preventDefault();
		autoDroparea.style.display = 'none';
	}

	// the entry point for catching all files, no matter if from drag and drop or selecting it via filebrowser
	function drop(e) {
		autoDroparea.style.display = 'none';
		// copy the fileObject to a manageable Array, from a FileList
		e.files=[];
		var i = e.dataTransfer.files.length;
		while(i--){
			e.files.push(e.dataTransfer.files[i]);
		}
		// remove files, that don't match the filetype
		if(tUploader.acceptedFileExtensions){
			var i = e.files.length
			while(i--){
				var extension = e.files[i].name.slice(e.files[i].name.lastIndexOf('.')).toLowerCase();
				if(	tUploader.acceptedFileExtensions.indexOf(extension)==-1)
					e.files.splice(i,1);
			}
		}
		tUploader.preprocess(e, function(options){
			if(!options)options = {};
			// stop if there is no file to upload left
			if(!e.files.length)return;
			
			e.stopPropagation();
			e.preventDefault();
						
			e.bitrate = new tStabilizer(5);
			tUploader.uploads.push(e);
			options.path = options.path || tUploader.stdUploadPath;
			
			// prepare the files for upload
			var files = e.files;
			var formData = new FormData();
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				// Add the file to the request.
				formData.append(tUploader.varName+'[]', file, file.name);
			}
			//prepare getData
			var getParams = '';
			if(options.get){
				for( i in options.get){
					getParams += (getParams.length ? '' : '?') + i + options.get[i];
				}
			}
			
			//add postData
			if(options.post){
				for ( i in post) {
					formData.append(i, post[i]);
				}
			}
			
			
			// Set up the request.
			var xhr = new XMLHttpRequest();
			xhr.open('POST', options.path + (getParams.length ? getParams : ''), true);
			// Set up a handler for when the request finishes.
			xhr.onload = function () {
				if (xhr.status === 200) {
					tUploader.uploads.splice(tUploader.uploads.indexOf(e), 1);
					tUploader.trigger('progress',{event: e, progress: 1, bitrate: 0});
					tUploader.trigger('success',{event: e});
				} else {
					tUploader.trigger('error',{event: e});
				}
			};
			var lastLoaded = 0;
			var lastTimeStamp = 0;
			xhr.upload.addEventListener('progress', function(ep){ 
				var progress = ep.loaded / ep.total;
				var deltaLoaded = ep.loaded - lastLoaded;
				var deltaTime = ep.timeStamp - lastTimeStamp;
				var bitrate = parseInt(deltaLoaded / deltaTime);
				e.bitrate.push(bitrate);
				e.total = ep.total;
				e.loaded = ep.loaded;
				e.progress = progress;
				tUploader.trigger('progress', {
					event: e,
					progressEvent: ep, 
					progress: progress, 
					bitrate: e.bitrate.getAvarage(),
					globalProgress: tUploader.getGlobalProgress()
				});
				lastLoaded = ep.loaded;
				lastTimeStamp = ep.timeStamp;
			});
			// Send the Data.
			xhr.send(formData);
			tUploader.trigger('begin', {event: e});
		})
	}
	var tUploader={
		openFilebrowser: function(){
			input.click();
		},
		// validate is your option to decide if the file should be uploaded. if so, call the callback
		// you also can manupulate on the eventObject, so that there might be uploaded a subset of the files
		// or the filenames are changed.
		preprocess: function(e,callback){
			// you can pass an object, that has an alternative path, and/or add post and get data. as simple key - value objects
			// example: {path:'upload.json',get:{userid:'someuserid'},post:{additionalData:'here goes the data'}}
			if(true)callback({});
		},
		stdUploadPath: 'upload.json',
		getGlobalProgress: function(){
			var progressSum = 0;
			var sizeSum = 0;
			for(var i = 0;i<this.uploads.length;i++){
				progressSum += this.uploads[i].progress * this.uploads[i].total;
				sizeSum += this.uploads[i].total;
			}
			if(progressSum == 0 &&sizeSum == 0 ){
				return 1;
			}else{
				return progressSum / sizeSum;
			}
		},
		/**
		 * set the acceptValue
		 *@param value {string} use a value as described here:
		 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input?redirectlocale=en-US&redirectslug=HTML%2FElement%2FInput
		 * 
		 */
		setAccept: function(value){
			input.setAttribute('accept', value);
			if(value){
				switch(value){
					case 'imgage/*': this.acceptedFileExtensions = '.jpg,.jpeg,.png,.gif,.tif,.bmp'; break;
					case 'audio/*': this.acceptedFileExtensions = '.mp3,.mp4,.odd,.wav'; break;
					default: this.acceptedFileExtensions = value;
				}
			}else{
				this.acceptedFileExtensions=null;
			}
		},
		acceptedFileExtensions: null,
		// the input used to open the filebrowser
		input: input,
		// contains information about all current uploads
		uploads:[],
		varName:'files',
		// the style for the dropzone, change it, to fit to your design, 
		// now it is yellow with a brown border.
		// but this dropzone should keep filling the whole width. 
		// feel free to add some children for some user description 
		// or having the border not completely outside.
		// The style.display is used to show and hide the element.
		autoDropareaElement: autoDroparea,
		autoDroparea: true
	}
	tMitter(tUploader);
	return tUploader;
})(document);
