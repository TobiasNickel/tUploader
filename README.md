# tUploader
simple web drag and drop uploader - in hTML5 + Javascript

This module creates a singleton object tUploader.

##properties:
    // method to lunch the fileBrowser
  	openFilebrowser:function(){
			input.click();
		},
		// validate is your option to decide if the file should be uploaded. if so, call the callback
		// you also can manupulate on the eventObject, so that there might be uploaded a subset of the files
		// or the filenames are changed.
		preprocess: executed before upload. 
		
		// the default upload path, if the preProcess-method is not providing a path
		stdUploadPath:'upload.json',
		
		// the style for the dropzone, change it, to fit to your design, 
		// now it is yellow with a brown border.
		// but this dropzone should keep filling the whole width. 
		// feel free to add some children for some user description 
		// or having the border not completely outside.
		// The style.display is used to show and hide the element.
		autoDropareaElement:autoDroparea,
		
		// set this to false, if you want to handle the dropzones by yourself, 
		// this  nessasary if you need more then one dropzone on your app.
		autoDroparea:true

##events
    this lib uses the tMitter eventsystem, witch is almost similar to use like Backbone.event or emitter.js. It has the Methods .on - to register a listener, .off - to remove a listener, internally .trigger is used to provide the events for your app.
    
    'begin': the preProzessing is finished and the lib starts to upload
    'progress': the progress information for a file, it also provides information for multiple uploads
    'success':triggered when an upload has finished successfully
    'error':triggered when an upload was stopped, i.e.: connection lost/refused
    
    
    
        
        
this lib, works good in combination with tomcat, ruby, PHP, Phython, NodeJS and more
