/*jshint debug:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, curly:true, browser: true, devel: true, jquery:true, strict:false */
/*global Backbone, _, jQuery, Sail, google */

(function() {
  "use strict";
  var Skeletor = this.Skeletor || {};
  this.Skeletor.Mobile = this.Skeletor.Mobile || {};
  var app = this.Skeletor.Mobile;
  var Model = this.Skeletor.Model;
  Skeletor.Model = Model;
  app.View = {};
  var MAX_FILE_SIZE = 20971520;     // 20 Mb

  /**
    DefinitionView
  **/
  app.View.DefinitionView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing DefinitionView...', view.el);
    },

    events: {
      'change #photo-file'                : 'uploadMedia',
      'click .remove-btn'                 : 'removeOneMedia',
      'click .publish-definition-btn'     : 'publishDefinition',
      'click .photo-container'            : 'openPhotoModal',
      'keyup :input'                      : 'checkForAutoSave'
    },

    openPhotoModal: function(ev) {
      var view = this;
      var url = jQuery(ev.target).attr('src');
      //the fileName isn't working for unknown reasons - so we can't add metadata to the photo file name, or make them more human readable. Also probably doesn't need the app.parseExtension(url)
      //var fileName = view.model.get('author') + '_' + view.model.get('title').slice(0,8) + '.' + app.parseExtension(url);
      jQuery('#photo-modal .photo-content').attr('src', url);
      jQuery('#photo-modal .download-photo-btn a').attr('href',url);
      //jQuery('#photo-modal .download-photo-btn a').attr('download',fileName);
      jQuery('#photo-modal').modal({keyboard: true, backdrop: true});
    },

    uploadMedia: function() {
      var view = this;

      var file = jQuery('#photo-file')[0].files.item(0);
      var formData = new FormData();
      formData.append('file', file);

      if (file.size < MAX_FILE_SIZE) {
        jQuery('#photo-upload-spinner').removeClass('hidden');
        jQuery('.upload-icon').addClass('invisible');
        jQuery('.publish-note-btn').addClass('disabled');

        jQuery.ajax({
          url: app.config.pikachu.url,
          type: 'POST',
          success: success,
          error: failure,
          data: formData,
          cache: false,
          contentType: false,
          processData: false
        });
      } else {
        jQuery().toastmessage('showErrorToast', "Max file size of 20MB exceeded");
        jQuery('.upload-icon').val('');
      }

      function failure(err) {
        jQuery('#photo-upload-spinner').addClass('hidden');
        jQuery('.upload-icon').removeClass('invisible');
        jQuery('.publish-definition-btn').removeClass('disabled');
        jQuery().toastmessage('showErrorToast', "Photo could not be uploaded. Please try again");
      }

      function success(data, status, xhr) {
        jQuery('#photo-upload-spinner').addClass('hidden');
        jQuery('.upload-icon').removeClass('invisible');
        jQuery('.publish-definition-btn').removeClass('disabled');
        console.log("UPLOAD SUCCEEDED!");
        console.log(xhr.getAllResponseHeaders());

        // clear out the label value if they for some reason want to upload the same thing...
        jQuery('.upload-icon').val('');

        // update the model
        var mediaArray = view.model.get('media');
        mediaArray.push(data.url);
        view.model.set('media', mediaArray);
        view.model.save();
        // update the view (TODO: bind this to an add event, eg do it right)
        view.appendOneMedia(data.url);

        // one lightweight way of doing captions for this wallcology - but only do it once (eg if length is one)
        // if (mediaArray.length === 1) {
        //   var noteBodyText = jQuery('#note-body-input').val();
        //   jQuery('#note-body-input').val(noteBodyText + '\n\nSomething on pictures and videos: ');
        // }
      }

    },

    checkForAutoSave: function(ev) {
      var view = this,
          field = ev.target.name,
          input = ev.target.value;
      // clear timer on keyup so that a save doesn't happen while typing
      app.clearAutoSaveTimer();

      // save after 10 keystrokes - now 20
      app.autoSave(view.model, field, input, false);

      // setting up a timer so that if we stop typing we save stuff after 5 seconds
      app.autoSaveTimer = setTimeout(function(){
        app.autoSave(view.model, field, input, true);
      }, 5000);
    },

    // TODO: this can be done more cleanly/backbonely with views for the media containers
    appendOneMedia: function(url) {
      var el;

      if (app.photoOrVideo(url) === "photo") {
        el = '<span class="media-container" data-url="'+url+'"><img src="'+app.config.pikachu.url+url+'" class="media photo-container img-responsive"></img><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
      } else if (app.photoOrVideo(url) === "video") {
        el = '<span class="media-container" data-url="'+url+'"><video src="' + app.config.pikachu.url+url + '" class="camera-icon img-responsive" controls /><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
      } else {
        el = '<img src="img/camera_icon.png" class="media img-responsive" alt="camera icon" />';
        throw "Error trying to append media - unknown media type!";
      }
      jQuery('#definition-media-container').append(el);
    },

    removeOneMedia: function(ev) {
      var view = this;
      var targetUrl = jQuery(ev.target).data('url');
      var mediaArray = view.model.get('media');
      var newMediaArray = [];
      _.each(mediaArray, function(url, i) {
        if (mediaArray[i] !== targetUrl) {
          newMediaArray.push(mediaArray[i]);
        }
      });
      view.model.set('media', newMediaArray);
      view.model.save();

      jQuery('.media-container[data-url="'+targetUrl+'"]').remove();
      // clearing this out so the change event for this can be used (eg if they upload the same thing)
      jQuery('.upload-icon').val('');
    },

    publishDefinition: function() {
      var view = this;
      var explanation = jQuery('#definition-explanation-input').val();

      if (explanation.length > 0) {
        app.clearAutoSaveTimer();
        view.model.set('explanation',explanation);
        view.model.set('complete', true);
        view.model.set('modified_at', new Date());
        view.model.save();

        app.determineNextStep();
      } else {
        jQuery().toastmessage('showErrorToast', "You must complete the explanation before continuing...");
      }
    },

    render: function () {
      var view = this;
      console.log("Rendering DefinitionView...");

      jQuery('#definition-name-field').text(view.model.get('name'));
      jQuery('#definition-explanation-input').val(view.model.get('explanation'));
      jQuery('#definition-media-container').html('');
      view.model.get('media').forEach(function(url) {
        view.appendOneMedia(url);
      });
    }
  });















/***********************************************************
 ***********************************************************
 *********************** NOTES VIEWS ***********************
 ***********************************************************
 ***********************************************************/

 /**
  ** Note View
  **/
 app.View.Note = Backbone.View.extend({
   textTemplate: "#text-note-template",
   photoTemplate: "#photo-note-template",
   videoTemplate: "#video-note-template",

   events: {
     'click' : 'editNote'
   },

   initialize: function () {
     var view = this;

     view.model.on('change', function () {
       view.render();
     });

     return view;
   },

   editNote: function(ev) {
     var view = this;

     app.hideAllContainers();

     app.notesWriteView.model = view.model;
     jQuery('#notes-write-screen').removeClass('hidden');
     app.notesWriteView.render();
   },

   render: function () {
     var view = this,
         note = view.model,
         noteType,
         firstMediaUrl,
         listItemTemplate,
         listItem;

     // determine what kind of note this is, ie what kind of template do we want to use
     if (note.get('media').length === 0) {
       noteType = "text";
     } else if (note.get('media').length > 0) {
       firstMediaUrl = note.get('media')[0];
       if (app.photoOrVideo(firstMediaUrl) === "photo") {
         noteType = "photo";
       } else if (app.photoOrVideo(firstMediaUrl) === "video") {
         noteType = "video";
       } else {
         jQuery().toastmessage('showErrorToast', "You have uploaded a file that is not a supported file type! How did you manage to sneak it in there? Talk to Colin to resolve the issue...");
       }
     } else {
       throw "Unknown note type!";
     }

     var date = new Date(view.model.get('created_at'));
     date = date.toLocaleString();

     if (noteType === "text") {
       //if class is not set do it
       if (!view.$el.hasClass('note-container')) {
         view.$el.addClass('note-container');
       }
       listItemTemplate = _.template(jQuery(view.textTemplate).text());
       listItem = listItemTemplate({ 'id': note.get('_id'), 'title': note.get('title'), 'body': note.get('body'), 'author': '- '+note.get('author'), 'date': date });
     } else if (noteType === "photo") {
       // if class is not set do it
       if (!view.$el.hasClass('photo-note-container')) {
         view.$el.addClass('photo-note-container');
       }
       listItemTemplate = _.template(jQuery(view.photoTemplate).text());
       listItem = listItemTemplate({ 'id': note.get('_id'), 'title': note.get('title'), 'url': app.config.pikachu.url + firstMediaUrl, 'author': '- '+note.get('author'), 'date': date });
     } else if (noteType === "video") {
       // if class is not set do it
       if (!view.$el.hasClass('video-note-container')) {
         view.$el.addClass('video-note-container');
       }
       listItemTemplate = _.template(jQuery(view.videoTemplate).text());
       listItem = listItemTemplate({ 'id': note.get('_id'), 'title': note.get('title'), 'url': app.config.pikachu.url + firstMediaUrl, 'author': '- '+note.get('author'), 'date': date });
     }
     else {
       throw "Unknown note type!";
     }

     // add the myNote class if needed
     if (note.get('note_type_tag') === "Big Idea") {
       view.$el.addClass('classNote');
     } else if (note.get('author') === app.username) {
       view.$el.addClass('myNote');
     }

     // Add the newly generated DOM elements to the view's part of the DOM
     view.$el.html(listItem);

     return view;
   }
 });



/**
  NotesReadView
**/
app.View.NotesReadView = Backbone.View.extend({
  initialize: function () {
    var view = this;
    console.log('Initializing NotesReadView...', view.el);

    /* We should not have to listen to change on collection but on add. However, due to wakefulness
    ** and published false first we would see the element with add and see it getting created. Also not sure
    ** how delete would do and so on.
    ** IMPORTANT: in addOne we check if the id of the model to be added exists in the DOM and only add it to the DOM if it is new
    */
    view.collection.on('change', function(n) {
      if (n.get('published') === true) {
        view.addOne(n);
      }
    });

    /*
    ** See above, but mostly we would want add and change in the note view. But due to wakeness and published flag
    ** we are better off with using change and filtering to react only if published true.
    ** IMPORTANT: in addOne we check that id isn't already in the DOM
    */
    view.collection.on('add', function(n) {
      if (n.get('published') === true) {
        view.addOne(n);
      }
    });

    return view;
  },

  events: {
    'click .nav-write-btn'              : 'createNote'
  },

  createNote: function(ev) {
    var view = this;
    var m;

    // check if we need to resume
    // BIG NB! We use author here! This is the only place where we care about app.username (we want you only to be able to resume your own notes)
    var noteToResume = view.collection.findWhere({author: app.username, published: false});

    if (noteToResume) {
      // RESUME NOTE
      console.log("Resuming...");
      m = noteToResume;
    } else {
      // NEW NOTE
      console.log("Starting a new note...");
      m = new Model.Note();
      m.set('author', app.username);
      m.set('note_type_tag', "Note Type");        // set these all to the default
      m.wake(app.config.wakeful.url);
      m.save();
      view.collection.add(m);
    }

    app.notesWriteView.model = m;
    app.notesWriteView.model.wake(app.config.wakeful.url);

    app.hideAllContainers();
    jQuery('#notes-write-screen').removeClass('hidden');
    app.notesWriteView.render();
  },

  addOne: function(noteModel) {
    var view = this;

    // check if the note already exists
    // http://stackoverflow.com/questions/4191386/jquery-how-to-find-an-element-based-on-a-data-attribute-value
    if (view.$el.find("[data-id='" + noteModel.id + "']").length === 0 ) {
      // wake up the project model
      noteModel.wake(app.config.wakeful.url);

      // This is necessary to avoid Backbone putting all HTML into an empty div tag
      var noteContainer = jQuery('<li class="note-container col-xs-12 col-sm-4 col-lg-3" data-id="'+noteModel.id+'"></li>');

      var noteView = new app.View.Note({el: noteContainer, model: noteModel});
      var listToAddTo = view.$el.find('.notes-list');
      listToAddTo.prepend(noteView.render().el);
    } else {
      console.log("The note with id <"+noteModel.id+"> wasn't added since it already exists in the DOM");
    }
  },

  render: function() {
    var view = this;
    console.log("Rendering NotesReadView...");

    // sort newest to oldest (prepend!)
    view.collection.comparator = function(model) {
      return model.get('created_at');
    };

    var criteria = {published: true};

    var noteTypeFilteredCollection = view.collection.sort().where(criteria);

    // clear the house
    view.$el.find('.notes-list').html("");

    // CHECK ME
    noteTypeFilteredCollection.forEach(function (note) {
      view.addOne(note);
    });
  }
});


/**
  NotesWriteView
**/
app.View.NotesWriteView = Backbone.View.extend({
  initialize: function() {
    var view = this;
    console.log('Initializing NotesWriteView...', view.el);

    // populate the dropdown (maybe move this since, it'll be used a lot of places)
    jQuery('#notes-write-screen .note-type-selector').html('');
    _.each(app.noteTypes, function(k, v) {
      jQuery('#notes-write-screen .note-type-selector').append('<option value="'+v+'">'+v+'</option>');
    });
  },

  events: {
    'click .nav-read-btn'               : 'switchToReadView',
    'change #photo-file'                : 'uploadMedia',
    'click .remove-btn'                 : 'removeOneMedia',
    'click .publish-note-btn'           : 'publishNote',
    'click #lightbulb-icon'             : 'showSentenceStarters',
    'click .sentence-starter'           : 'appendSentenceStarter',
    'click .photo-container'            : 'openPhotoModal',
    'keyup :input'                      : 'checkForAutoSave'
  },

  openPhotoModal: function(ev) {
    var view = this;
    var url = jQuery(ev.target).attr('src');
    //the fileName isn't working for unknown reasons - so we can't add metadata to the photo file name, or make them more human readable. Also probably doesn't need the app.parseExtension(url)
    //var fileName = view.model.get('author') + '_' + view.model.get('title').slice(0,8) + '.' + app.parseExtension(url);
    jQuery('#photo-modal .photo-content').attr('src', url);
    jQuery('#photo-modal .download-photo-btn a').attr('href',url);
    //jQuery('#photo-modal .download-photo-btn a').attr('download',fileName);
    jQuery('#photo-modal').modal({keyboard: true, backdrop: true});
  },

  uploadMedia: function() {
    var view = this;

    var file = jQuery('#photo-file')[0].files.item(0);
    var formData = new FormData();
    formData.append('file', file);

    if (file.size < MAX_FILE_SIZE) {
      jQuery('#photo-upload-spinner').removeClass('hidden');
      jQuery('.upload-icon').addClass('invisible');
      jQuery('.publish-note-btn').addClass('disabled');

      jQuery.ajax({
        url: app.config.pikachu.url,
        type: 'POST',
        success: success,
        error: failure,
        data: formData,
        cache: false,
        contentType: false,
        processData: false
      });
    } else {
      jQuery().toastmessage('showErrorToast', "Max file size of 20MB exceeded");
      jQuery('.upload-icon').val('');
    }

    function failure(err) {
      jQuery('#photo-upload-spinner').addClass('hidden');
      jQuery('.upload-icon').removeClass('invisible');
      jQuery('.publish-note-btn').removeClass('disabled');
      jQuery().toastmessage('showErrorToast', "Photo could not be uploaded. Please try again");
    }

    function success(data, status, xhr) {
      jQuery('#photo-upload-spinner').addClass('hidden');
      jQuery('.upload-icon').removeClass('invisible');
      jQuery('.publish-note-btn').removeClass('disabled');
      console.log("UPLOAD SUCCEEDED!");
      console.log(xhr.getAllResponseHeaders());

      // clear out the label value if they for some reason want to upload the same thing...
      jQuery('.upload-icon').val('');

      // update the model
      var mediaArray = view.model.get('media');
      mediaArray.push(data.url);
      view.model.set('media', mediaArray);
      view.model.save();
      // update the view (TODO: bind this to an add event, eg do it right)
      view.appendOneMedia(data.url);

      // one lightweight way of doing captions for this wallcology - but only do it once (eg if length is one)
      if (mediaArray.length === 1) {
        var noteBodyText = jQuery('#note-body-input').val();
        jQuery('#note-body-input').val(noteBodyText + '\n\nNotes on pictures and videos: ');
      }
    }

  },

  checkForAutoSave: function(ev) {
    var view = this,
        field = ev.target.name,
        input = ev.target.value;
    // clear timer on keyup so that a save doesn't happen while typing
    app.clearAutoSaveTimer();

    // save after 10 keystrokes - now 20
    app.autoSave(view.model, field, input, false);

    // setting up a timer so that if we stop typing we save stuff after 5 seconds
    app.autoSaveTimer = setTimeout(function(){
      app.autoSave(view.model, field, input, true);
    }, 5000);
  },

  publishNote: function() {
    var view = this;
    var title = jQuery('#note-title-input').val();
    var body = jQuery('#note-body-input').val();

    if (title.length > 0 && body.length > 0) {
      app.clearAutoSaveTimer();
      view.model.set('title',title);
      view.model.set('body',body);
      view.model.set('published', true);
      view.model.set('modified_at', new Date());

      view.model.save();
      jQuery().toastmessage('showSuccessToast', "Published to the note wall!");

      view.switchToReadView();
    } else {
      jQuery().toastmessage('showErrorToast', "You must complete both fields and select a note type to submit your note...");
    }
  },

  switchToReadView: function() {
    var view = this;
    app.hideAllContainers();
    jQuery('#notes-read-screen').removeClass('hidden');

    view.model = null;
    jQuery('.input-field').val('');
    // resets in the case of Big Idea
    jQuery('#notes-write-screen .input-field').css('border', '1px solid #237599');
    jQuery('#note-body-input').attr('placeholder', '');

    // rerender everything
    app.notesReadView.render();
  },

  // TODO: this can be done more cleanly/backbonely with views for the media containers
  appendOneMedia: function(url) {
    var el;

    if (app.photoOrVideo(url) === "photo") {
      el = '<span class="media-container" data-url="'+url+'"><img src="'+app.config.pikachu.url+url+'" class="media photo-container img-responsive"></img><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
    } else if (app.photoOrVideo(url) === "video") {
      el = '<span class="media-container" data-url="'+url+'"><video src="' + app.config.pikachu.url+url + '" class="camera-icon img-responsive" controls /><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
    } else {
      el = '<img src="img/camera_icon.png" class="media img-responsive" alt="camera icon" />';
      throw "Error trying to append media - unknown media type!";
    }
    jQuery('#note-media-container').append(el);
  },

  removeOneMedia: function(ev) {
    var view = this;
    var targetUrl = jQuery(ev.target).data('url');
    var mediaArray = view.model.get('media');
    var newMediaArray = [];
    _.each(mediaArray, function(url, i) {
      if (mediaArray[i] !== targetUrl) {
        newMediaArray.push(mediaArray[i]);
      }
    });
    view.model.set('media', newMediaArray);
    view.model.save();

    jQuery('.media-container[data-url="'+targetUrl+'"]').remove();
    // clearing this out so the change event for this can be used (eg if they upload the same thing)
    jQuery('.upload-icon').val('');
  },

  render: function () {
    var view = this;
    console.log("Rendering NotesWriteView...");

    // FOR BRENDA - CAN BE REMOVED IN A COUPLE DAYS
    var date = new Date(view.model.get('created_at'));
    jQuery('#date-container').text(date.toLocaleString());

    jQuery('#note-title-input').val(view.model.get('title'));
    jQuery('#note-body-input').val(view.model.get('body'));
    jQuery('#note-media-container').html('');
    view.model.get('media').forEach(function(url) {
      view.appendOneMedia(url);
    });

    // check is this user is allowed to edit this note
    if (view.model.get('author') === app.username) {
      jQuery('#notes-write-screen .editable.input-field').removeClass('uneditable');
      jQuery('#notes-write-screen .editable.input-field').prop("disabled", false);
      jQuery(jQuery('#notes-write-screen .selector-container .editable').children()).prop("disabled", false);
      jQuery('#notes-write-screen .editable').removeClass('disabled');
    } else {
      jQuery('#notes-write-screen .editable.input-field').addClass('uneditable');
      jQuery('#notes-write-screen .editable.input-field').prop("disabled", true);
      jQuery(jQuery('#notes-write-screen .selector-container .editable').children()).prop("disabled", true);
      jQuery('#notes-write-screen .editable').addClass('disabled');
    }
  }
});



/***********************************************************
 ***********************************************************
 ******************** RELATIONSHIP VIEWS *******************
 ***********************************************************
 ***********************************************************/


/**
 ** Relationship View
 **/
app.View.Relationship = Backbone.View.extend({
  textTemplate: "#text-relationship-template",
  photoTemplate: "#photo-relationship-template",
  videoTemplate: "#video-relationship-template",

  events: {
    'click' : 'editRelationship'
  },

  initialize: function () {
    var view = this;

    view.model.on('change', function () {
      view.render();
    });

    return view;
  },

  editRelationship: function(ev) {
    var view = this;

    app.hideAllContainers();

    app.relationshipsWriteView.model = view.model;
    jQuery('#relationships-write-screen').removeClass('hidden');
    app.relationshipsWriteView.render();
  },

  render: function () {
    var view = this,
        relationship = view.model,
        relationshipType,
        firstMediaUrl,
        listItemTemplate,
        listItem;

    // determine what kind of relationship this is, ie what kind of template do we want to use
    if (relationship.get('media').length === 0) {
      relationshipType = "text";
    } else if (relationship.get('media').length > 0) {
      firstMediaUrl = relationship.get('media')[0];
      if (app.photoOrVideo(firstMediaUrl) === "photo") {
        relationshipType = "photo";
      } else if (app.photoOrVideo(firstMediaUrl) === "video") {
        relationshipType = "video";
      } else {
        jQuery().toastmessage('showErrorToast', "You have uploaded a file that is not a supported file type! How did you manage to sneak it in there? Talk to Colin to resolve the issue...");
      }
    } else {
      throw "Unknown relationship type!";
    }

    var date = new Date(view.model.get('created_at'));
    date = date.toLocaleString();

    if (relationshipType === "text") {
      //if class is not set do it
      if (!view.$el.hasClass('relationship-container')) {
        view.$el.addClass('relationship-container');
      }
      listItemTemplate = _.template(jQuery(view.textTemplate).text());
      listItem = listItemTemplate({ 'id': relationship.get('_id'), 'title': relationship.get('title'), 'body': relationship.get('body'), 'author': '- '+relationship.get('author'), 'date': date });
    } else if (relationshipType === "photo") {
      // if class is not set do it
      if (!view.$el.hasClass('photo-relationship-container')) {
        view.$el.addClass('photo-relationship-container');
      }
      listItemTemplate = _.template(jQuery(view.photoTemplate).text());
      listItem = listItemTemplate({ 'id': relationship.get('_id'), 'title': relationship.get('title'), 'url': app.config.pikachu.url + firstMediaUrl, 'author': '- '+relationship.get('author'), 'date': date });
    } else if (relationshipType === "video") {
      // if class is not set do it
      if (!view.$el.hasClass('video-relationship-container')) {
        view.$el.addClass('video-relationship-container');
      }
      listItemTemplate = _.template(jQuery(view.videoTemplate).text());
      listItem = listItemTemplate({ 'id': relationship.get('_id'), 'title': relationship.get('title'), 'url': app.config.pikachu.url + firstMediaUrl, 'author': '- '+relationship.get('author'), 'date': date });
    }
    else {
      throw "Unknown relationship type!";
    }

    // add the myRelationship class if needed
    if (relationship.get('author') === app.username) {
      view.$el.addClass('myRelationship');
    }

    // Add the newly generated DOM elements to the view's part of the DOM
    view.$el.html(listItem);

    return view;
  }
});



/**
  RelationshipsReadView
**/
app.View.RelationshipsReadView = Backbone.View.extend({
  initialize: function () {
    var view = this;
    console.log('Initializing RelationshipsReadView...', view.el);

    /* We should not have to listen to change on collection but on add. However, due to wakefulness
    ** and published false first we would see the element with add and see it getting created. Also not sure
    ** how delete would do and so on.
    ** IMPORTANT: in addOne we check if the id of the model to be added exists in the DOM and only add it to the DOM if it is new
    */
    view.collection.on('change', function(n) {
      if (n.get('published') === true) {
        view.addOne(n);
        view.createAggregateTable();
      }
    });

    /*
    ** See above, but mostly we would want add and change in the relationship view. But due to wakeness and published flag
    ** we are better off with using change and filtering to react only if published true.
    ** IMPORTANT: in addOne we check that id isn't already in the DOM
    */
    view.collection.on('add', function(n) {
      if (n.get('published') === true) {
        view.addOne(n);
      }
    });

    return view;
  },

  events: {
    'click .nav-write-btn'               : 'createRelationship',
    'change .relationship-type-selector' : 'render'
  },

  createRelationship: function(ev) {
    var view = this;
    var m;

    // check if we need to resume
    // BIG NB! We use author here! This is the only place where we care about app.username (we want you only to be able to resume your own relationships)
    var relationshipToResume = view.collection.findWhere({author: app.username, published: false});

    if (relationshipToResume) {
      // RESUME NOTE
      console.log("Resuming...");
      m = relationshipToResume;
    } else {
      // NEW NOTE
      console.log("Starting a new relationship...");
      m = new Model.Relationship();
      m.set('author', app.username);
      m.set('from_species_index', '');
      m.set('to_species_index', '');
      m.wake(app.config.wakeful.url);
      m.save();
      view.collection.add(m);
    }

    app.relationshipsWriteView.model = m;
    app.relationshipsWriteView.model.wake(app.config.wakeful.url);

    app.hideAllContainers();
    jQuery('#relationships-write-screen').removeClass('hidden');
    app.relationshipsWriteView.render();
  },

  addOne: function(relationshipModel) {
    var view = this;

    // check if the relationship already exists
    // http://stackoverflow.com/questions/4191386/jquery-how-to-find-an-element-based-on-a-data-attribute-value
    if (view.$el.find("[data-id='" + relationshipModel.id + "']").length === 0 ) {
      // wake up the project model
      relationshipModel.wake(app.config.wakeful.url);

      // This is necessary to avoid Backbone putting all HTML into an empty div tag
      var relationshipContainer = jQuery('<li class="relationship-container col-xs-12 col-sm-4 col-lg-3" data-id="'+relationshipModel.id+'"></li>');

      var relationshipView = new app.View.Relationship({el: relationshipContainer, model: relationshipModel});
      var listToAddTo = view.$el.find('.relationships-list');
      listToAddTo.prepend(relationshipView.render().el);
    } else {
      console.log("The relationship with id <"+relationshipModel.id+"> wasn't added since it already exists in the DOM");
    }
  },

  render: function() {
    var view = this;
    console.log("Rendering RelationshipsReadView...");
    var screenId = "#relationships-read-screen";

    /************ NOTES LIST ************/

    // sort newest to oldest (prepend!)
    view.collection.comparator = function(model) {
      return model.get('created_at');
    };

    var publishedCollection = view.collection.sort().where({published: true});

    // clear the house
    view.$el.find('.relationships-list').html("");


    publishedCollection.forEach(function (relationship) {
      view.addOne(relationship);
    });
  }
});


/**
  RelationshipsWriteView
**/
app.View.RelationshipsWriteView = Backbone.View.extend({
  initialize: function() {
    var view = this;
    console.log('Initializing RelationshipsWriteView...', view.el);
  },

  events: {
    'click .nav-read-btn'               : 'switchToReadView',
    'change #relationship-photo-file'   : 'uploadMedia',
    'click .remove-btn'                 : 'removeOneMedia',
    'click .photo-container'            : 'openPhotoModal',
    'click .publish-relationship-btn'   : 'publishRelationship',
    'keyup :input'                      : 'checkForAutoSave'
  },

  openPhotoModal: function(ev) {
    var view = this;
    var url = jQuery(ev.target).attr('src');
    //the fileName isn't working for unknown reasons - so we can't add metadata to the photo file name, or make them more human readable. Also probably doesn't need the app.parseExtension(url)
    //var fileName = view.model.get('author') + '_' + view.model.get('title').slice(0,8) + '.' + app.parseExtension(url);
    jQuery('#relationship-photo-modal .photo-content').attr('src', url);
    jQuery('#relationship-photo-modal .download-photo-btn a').attr('href',url);
    //jQuery('#relationship-photo-modal .download-photo-btn a').attr('download',fileName);
    jQuery('#relationship-photo-modal').modal({keyboard: true, backdrop: true});
  },

  uploadMedia: function() {
    var view = this;

    var file = jQuery('#relationship-photo-file')[0].files.item(0);
    var formData = new FormData();
    formData.append('file', file);

    if (file.size < MAX_FILE_SIZE) {
      jQuery('#relationship-photo-upload-spinner').removeClass('hidden');
      jQuery('.upload-icon').addClass('invisible');
      jQuery('.publish-relationship-btn').addClass('disabled');

      jQuery.ajax({
        url: app.config.pikachu.url,
        type: 'POST',
        success: success,
        error: failure,
        data: formData,
        cache: false,
        contentType: false,
        processData: false
      });
    } else {
      jQuery().toastmessage('showErrorToast', "Max file size of 20MB exceeded");
      jQuery('.upload-icon').val('');
    }

    function failure(err) {
      jQuery('#relationship-photo-upload-spinner').addClass('hidden');
      jQuery('.upload-icon').removeClass('invisible');
      jQuery('.publish-relationship-btn').removeClass('disabled');
      jQuery().toastmessage('showErrorToast', "Photo could not be uploaded. Please try again");
    }

    function success(data, status, xhr) {
      jQuery('#relationship-photo-upload-spinner').addClass('hidden');
      jQuery('.upload-icon').removeClass('invisible');
      jQuery('.publish-relationship-btn').removeClass('disabled');
      console.log("UPLOAD SUCCEEDED!");
      console.log(xhr.getAllResponseHeaders());

      // clear out the label value if they for some reason want to upload the same thing...
      jQuery('.upload-icon').val('');

      // update the model
      var mediaArray = view.model.get('media');
      mediaArray.push(data.url);
      view.model.set('media', mediaArray);
      view.model.save();
      // update the view (TODO: bind this to an add event, eg do it right)
      view.appendOneMedia(data.url);

      // one lightweight way of doing captions for this wallcology - but only do it once (eg if length is one)
      if (mediaArray.length === 1) {
        var relationshipBodyText = jQuery('#relationship-body-input').val();
        jQuery('#relationship-body-input').val(relationshipBodyText + '\n\nNotes on pictures and videos: ');
      }
    }

  },

  checkForAutoSave: function(ev) {
    var view = this,
        field = ev.target.name,
        input = ev.target.value;
    // clear timer on keyup so that a save doesn't happen while typing
    app.clearAutoSaveTimer();

    // save after 10 keystrokes
    app.autoSave(view.model, field, input, false);

    // setting up a timer so that if we stop typing we save stuff after 5 seconds
    app.autoSaveTimer = setTimeout(function(){
      app.autoSave(view.model, field, input, true);
    }, 5000);
  },

  publishRelationship: function() {
    var view = this;
    var title = jQuery('#relationship-title-input').val();
    var body = jQuery('#relationship-body-input').val();

    if (title.length > 0 && body.length > 0 && jQuery('#from-species-container').data('species-index') !== "" && jQuery('#to-species-container').data('species-index') !== "") {
      app.clearAutoSaveTimer();
      view.model.set('title',title);
      view.model.set('body',body);
      view.model.set('published', true);
      view.model.set('modified_at', new Date());
      view.model.save();
      jQuery().toastmessage('showSuccessToast', "Published to food web wall!");

      view.switchToReadView();

      view.model = null;
      jQuery('.input-field').val('');
      jQuery('.exchange-species-container').html('');
      jQuery('.exchange-species-container').data('species-index','');

    } else {
      jQuery().toastmessage('showErrorToast', "You must complete all fields to submit your relationship...");
    }
  },

  switchToReadView: function() {
    var view = this;
    app.hideAllContainers();
    jQuery('#relationships-read-screen').removeClass('hidden');

    app.relationshipsReadView.render();
  },

  // TODO: this can be done more cleanly/backbonely with views for the media containers
  appendOneMedia: function(url) {
    var el;

    if (app.photoOrVideo(url) === "photo") {
      el = '<span class="media-container" data-url="'+url+'"><img src="'+app.config.pikachu.url+url+'" class="media photo-container img-responsive"></img><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
    } else if (app.photoOrVideo(url) === "video") {
      el = '<span class="media-container" data-url="'+url+'"><video src="' + app.config.pikachu.url+url + '" class="camera-icon img-responsive" controls /><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
    } else {
      el = '<img src="img/camera_icon.png" class="media img-responsive" alt="camera icon" />';
      throw "Error trying to append media - unknown media type!";
    }
    jQuery('#relationship-media-container').append(el);
  },

  removeOneMedia: function(ev) {
    var view = this;
    var targetUrl = jQuery(ev.target).data('url');
    var mediaArray = view.model.get('media');
    var newMediaArray = [];
    _.each(mediaArray, function(url, i) {
      if (mediaArray[i] !== targetUrl) {
        newMediaArray.push(mediaArray[i]);
      }
    });
    view.model.set('media', newMediaArray);
    view.model.save();

    jQuery('.media-container[data-url="'+targetUrl+'"]').remove();
    // clearing this out so the change event for this can be used (eg if they upload the same thing)
    jQuery('.upload-icon').val('');
  },

  render: function () {
    var view = this;
    console.log("Rendering RelationshipsWriteView...");

    if (view.model.get('habitat_tag')) {
      jQuery('#exchange-habitat').text("In "+view.model.get('habitat_tag').name);
      app.setHabitat("relationships-write-screen", view.model.get('habitat_tag').index);
    } else {
      jQuery('#exchange-habitat').text("In Habitat ?");
    }

    var speciesIndexArray = [];
    var fromIndex = view.model.get('from_species_index');
    if (fromIndex !== "") {
      speciesIndexArray.push(fromIndex);
      jQuery('#from-species-container').data('species-index',fromIndex);
      jQuery('#from-species-container').html('<img src="'+app.images[fromIndex].selected+'"></img>');
    } else {
      jQuery('#from-species-container').data('species-index','');
      jQuery('#from-species-container').html('');
    }

    var toIndex = view.model.get('to_species_index');
    if (toIndex !== "") {
      speciesIndexArray.push(view.model.get('to_species_index'));
      jQuery('#to-species-container').data('species-index',toIndex);
      jQuery('#to-species-container').html('<img src="'+app.images[toIndex].selected+'"></img>');
    } else {
      jQuery('#to-species-container').data('species-index','');
      jQuery('#to-species-container').html('');
    }

    app.setSpecies(speciesIndexArray);

    jQuery('#relationship-title-input').val(view.model.get('title'));
    jQuery('#relationship-body-input').val(view.model.get('body'));
    jQuery('#relationship-media-container').html('');
    view.model.get('media').forEach(function(url) {
      view.appendOneMedia(url);
    });

    // check if this user is allowed to edit this relationship
    if (view.model.get('author') === app.username) {
      jQuery('#relationships-write-screen .editable.input-field').removeClass('uneditable');
      jQuery('#relationships-write-screen .editable.input-field').prop("disabled", false);
      jQuery(jQuery('#relationships-write-screen .selector-container .editable').children()).prop("disabled", false);
      jQuery('#relationships-write-screen .editable').removeClass('disabled');
    } else {
      jQuery('#relationships-write-screen .editable.input-field').addClass('uneditable');
      jQuery('#relationships-write-screen .editable.input-field').prop("disabled", true);
      jQuery(jQuery('#relationships-write-screen .selector-container .editable').children()).prop("disabled", true);
      jQuery('#relationships-write-screen .editable').addClass('disabled');
    }
  }
});







  this.Skeletor = Skeletor;
}).call(this);
