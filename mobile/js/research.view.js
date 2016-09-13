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

  app.hexLightGrey = '#F4F4F4';
  app.hexLightBlue ='#3498DB';
  app.hexDarkPurple = '#8E44AD';




  /***********************************************************
   ***********************************************************
   *********************** HOME VIEW *************************
   ***********************************************************
   ***********************************************************/

  app.View.HomeView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing HomeView...', view.el);
    },

    events: {
      'click .choose-lesson-btn' : 'chooseLesson'
    },

    chooseLesson: function(ev) {
      // check which lesson from data value
      app.lesson = jQuery(ev.target).data('lesson');
      app.buildContributionArray();
      app.hideAllContainers();
      jQuery('.top-nav-btn').removeClass('hidden');
      jQuery('.top-nav-btn').removeClass('active');
      jQuery('#contribution-nav-btn').addClass('active');
      app.determineNextStep();
    },

    render: function () {
      var view = this;
      console.log("Rendering HomeView...");

      // create the html for the buttons and progress bars
      var homeEl = '';
      Skeletor.Model.awake.lessons.each(function(lesson) {
        var title = lesson.get('title');
        var number = lesson.get('number');

        var el = '<div class="home-row-container"><button class="choose-lesson-btn home-btn btn btn-base" data-lesson="'+number+'">Lesson '+number+'</button>';
        el += '<h3 class="lesson-title">'+title+'</h3>';
        el += '<span class="home-progress-container">';
        el += '<span id="lesson'+number+'-my-progress-bar" class="my-progress-bar"></span>';
        el += '<span class="my-progress-percent lesson'+number+'"></span>';
        el += app.getMyContributionPercent(number)+'%</span>';
        el += '<span class="home-progress-container">';
        el += '<span id="lesson'+number+'-community-progress-bar" class="community-progress-bar"></span>';
        el += '<span class="community-progress-percent lesson'+number+'"></span>';
        el += app.getCommunityContributionPercent(number)+'%</span></div>';

        homeEl += el;
      });
      jQuery('#home-container').html(homeEl);

      // fill in the progress bars
      Skeletor.Model.awake.lessons.each(function(lesson) {
        var myBar = new ProgressBar.Line('#lesson'+lesson.get('number')+'-my-progress-bar',
          {
            easing: 'easeInOut',
            color: app.hexDarkPurple,
            trailColor: app.hexLightGrey,
            svgStyle: {
                display: 'inline',
                width: '15%'
            },
            strokeWidth: 7
          });
        myBar.animate(app.getMyContributionPercent(lesson.get('number')) / 100);
        var communityBar = new ProgressBar.Line('#lesson'+lesson.get('number')+'-community-progress-bar',
          {
            easing: 'easeInOut',
            color: app.hexLightBlue,
            trailColor: app.hexLightGrey,
            svgStyle: {
                display: 'inline',
                width: '15%'
            },
            strokeWidth: 7
          });
        communityBar.animate(app.getCommunityContributionPercent(lesson.get('number')) / 100);
      });

    }
  });







  /***********************************************************
   ***********************************************************
   ******************** DEFINITION VIEW **********************
   ***********************************************************
   ***********************************************************/

  app.View.DefinitionView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing DefinitionView...', view.el);

      app.defBar = new ProgressBar.Line('#definition-my-progress-bar',
        {
          easing: 'easeInOut',
          color: app.hexLightBlue,
          trailColor: app.hexLightGrey
        });
    },

    events: {
      'change #definition-photo-file'     : 'uploadMedia',
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
      jQuery('#definition-photo-modal .photo-content').attr('src', url);
      jQuery('#definition-photo-modal .download-photo-btn a').attr('href',url);              // this can get removed, maybe moved to the board?
      //jQuery('#definition-photo-modal .download-photo-btn a').attr('download',fileName);
      jQuery('#definition-photo-modal').modal({keyboard: true, backdrop: true});
    },

    uploadMedia: function() {
      var view = this;

      var file = jQuery('#definition-photo-file')[0].files.item(0);
      var formData = new FormData();
      formData.append('file', file);

      if (file.size < MAX_FILE_SIZE) {
        jQuery('#definition-photo-upload-spinner').removeClass('hidden');
        jQuery('.upload-icon').addClass('invisible');
        jQuery('.publish-definition-btn').addClass('disabled');

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
        jQuery('#definition-photo-upload-spinner').addClass('hidden');
        jQuery('.upload-icon').removeClass('invisible');
        jQuery('.publish-definition-btn').removeClass('disabled');
        jQuery().toastmessage('showErrorToast', "Photo could not be uploaded. Please try again");
      }

      function success(data, status, xhr) {
        jQuery('#definition-photo-upload-spinner').addClass('hidden');
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
        view.model.set('explanation', explanation);
        view.model.set('complete', true);
        view.model.set('modified_at', new Date());
        view.model.save();

        app.markAsComplete();
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

      jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.lesson));
      app.defBar.animate(app.getMyContributionPercent(1) / 100);
      jQuery('.community-progress-percent').text(app.getCommunityContributionPercent(app.lesson));
    }
  });






  /***********************************************************
   ***********************************************************
   ******************* RELATIONSHIP VIEWS ********************
   ***********************************************************
   ***********************************************************/

  app.View.RelationshipView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing RelationshipView...', view.el);

      app.relBar = new ProgressBar.Line('#relationship-my-progress-bar',
        {
          easing: 'easeInOut',
          color: app.hexLightBlue,
          trailColor: app.hexLightGrey
        });
    },

    events: {
      'click .publish-relationship-btn' : 'publishRelationship',
      'change #relationship-link-dropdown' : 'checkLink'
    },

    checkLink: function() {
      var view = this;

      jQuery('.relationship-outcome-container').addClass('hidden');

      if (view.model.get('link') === jQuery('#relationship-link-dropdown').val()) {
        jQuery('#relationship-correct').removeClass('hidden');
        jQuery('.publish-relationship-btn').removeClass('disabled');
      } else {
        jQuery('#relationship-incorrect').removeClass('hidden');
        jQuery('.publish-relationship-btn').addClass('disabled');
      }
    },

    publishRelationship: function() {
      var view = this;

      view.model.set('complete', true);
      view.model.set('modified_at', new Date());
      view.model.save();

      view.model = null;
      jQuery('.relationship-outcome-container').addClass('hidden');
      jQuery('#relationship-link-dropdown').val("");
      jQuery('.publish-relationship-btn').addClass('disabled');

      app.markAsComplete();
      app.determineNextStep();
    },

    render: function () {
      var view = this;
      console.log("Rendering RelationshipView...");

      jQuery('#relationship-from-container').text(view.model.get('from'));
      jQuery('#relationship-to-container').text(view.model.get('to'));

      jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.lesson));
      app.relBar.animate(app.getMyContributionPercent(1) / 100);
      jQuery('.community-progress-percent').text(app.getCommunityContributionPercent(app.lesson));
    }
  });





  /***********************************************************
   ***********************************************************
   ********************* VETTING VIEW ************************
   ***********************************************************
   ***********************************************************/

  app.View.VettingView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing VettingView...', view.el);

      app.vetBar = new ProgressBar.Line('#vetting-my-progress-bar',
        {
          easing: 'easeInOut',
          color: app.hexLightBlue,
          trailColor: app.hexLightGrey
        });

    },

    events: {
      'change #vetting-photo-file'        : 'uploadMedia',
      'click .remove-btn'                 : 'removeOneMedia',
      'click .publish-vetting-btn'        : 'publishVetting',
      'click .photo-container'            : 'openPhotoModal',
      //'keyup :input'                      : 'checkForAutoSave',
      'click .vetting-radio-btn'          : 'updateVettingRequired'
      // 'click .submit-addon-btn'           : 'submitAddOn',
      // 'click .cancel-addon-btn'           : 'cancelAddOn'
    },

    updateVettingRequired: function(ev) {
      // dealing with the view components of this, since radio buttons are THE WORST
      jQuery('.vetting-radio-btn').prop('checked', false);
      jQuery(ev.target).prop('checked', true);

      jQuery('.publish-vetting-btn').removeClass('disabled');

      if (jQuery(ev.target).prop('name') === "yes") {
        jQuery('#vetting-addon-container').addClass('hidden');
      } else {
        jQuery('#vetting-addon-container').removeClass('hidden');
      }
    },

    // submitAddOn: function() {

    // },

    // cancelAddOn: function() {

    // },

    openPhotoModal: function(ev) {
      var view = this;
      var url = jQuery(ev.target).attr('src');
      //the fileName isn't working for unknown reasons - so we can't add metadata to the photo file name, or make them more human readable. Also probably doesn't need the app.parseExtension(url)
      //var fileName = view.model.get('author') + '_' + view.model.get('title').slice(0,8) + '.' + app.parseExtension(url);
      jQuery('#vetting-photo-modal .photo-content').attr('src', url);
      jQuery('#vetting-photo-modal .download-photo-btn a').attr('href',url);              // this can get removed, maybe moved to the board?
      //jQuery('#vetting-photo-modal .download-photo-btn a').attr('download',fileName);
      jQuery('#vetting-photo-modal').modal({keyboard: true, backdrop: true});
    },

    uploadMedia: function() {
      var view = this;

      var file = jQuery('#vetting-photo-file')[0].files.item(0);
      var formData = new FormData();
      formData.append('file', file);

      if (file.size < MAX_FILE_SIZE) {
        jQuery('#vetting-photo-upload-spinner').removeClass('hidden');
        jQuery('.upload-icon').addClass('invisible');
        jQuery('.publish-vetting-btn').addClass('disabled');

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
        jQuery('#vetting-photo-upload-spinner').addClass('hidden');
        jQuery('.upload-icon').removeClass('invisible');
        jQuery('.publish-vetting-btn').removeClass('disabled');
        jQuery().toastmessage('showErrorToast', "Photo could not be uploaded. Please try again");
      }

      function success(data, status, xhr) {
        jQuery('#vetting-photo-upload-spinner').addClass('hidden');
        jQuery('.upload-icon').removeClass('invisible');
        jQuery('.publish-vetting-btn').removeClass('disabled');
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
      }
    },

    // checkForAutoSave: function(ev) {
    //   var view = this,
    //       field = ev.target.name,
    //       input = ev.target.value;
    //   // clear timer on keyup so that a save doesn't happen while typing
    //   app.clearAutoSaveTimer();

    //   // save after 10 keystrokes - now 20
    //   app.autoSave(view.model, field, input, false);

    //   // setting up a timer so that if we stop typing we save stuff after 5 seconds
    //   app.autoSaveTimer = setTimeout(function(){
    //     app.autoSave(view.model, field, input, true);
    //   }, 5000);
    // },

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
      jQuery('#vetting-media-container').append(el);
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

    publishVetting: function() {
      var view = this;
      var explanation = jQuery('#vetting-addon-input').val();

      // this radio button check is very sloppy TODO
      if (explanation.length > 0 || jQuery('input:radio[name=yes]:checked').val() === "on") {
        // all of this nonsense to work around the fact that wakeful/drowsy choke on the nested Date obj (b/c it isn't JSON)
        var d = new Date();
        var dateStr = d.toDateString() + ', ' + d.toTimeString();
        dateStr = dateStr.substring(0, dateStr.length - 15);
        var vettingObj = {};
        vettingObj.explanation = explanation;
        vettingObj.author = app.username;
        vettingObj.date = dateStr;
        var vettingsAr = view.model.get('vettings');
        vettingsAr.push(vettingObj);
        view.model.set('vettings', vettingsAr);
        var vettedByAr = view.model.get('vetted_by');
        vettedByAr.push(app.username);
        view.model.set('vetted_by', vettedByAr);
        view.model.save();

        jQuery('.vetting-radio-btn').prop('checked', false);
        jQuery('.publish-vetting-btn').addClass('disabled');
        jQuery('#vetting-addon-input').val('');
        jQuery('#vetting-addon-container').addClass('hidden');

        app.markAsComplete();
        app.determineNextStep();
      } else {
        jQuery().toastmessage('showErrorToast', "You must complete the explanation before continuing...");
      }
    },

    render: function () {
      var view = this;
      console.log("Rendering VettingView...");

      var termExplanation = view.model.get('explanation');
      var vettingExplanation = '';

      _.each(view.model.get('vettings'), function(vetting) {
        // if there is nothing to improve on...
        if (vetting.explanation) {
          vettingExplanation += '\n' + vetting.author + ' - ' + vetting.date + ':\n' + vetting.explanation;
        }
      });


      jQuery('#vetting-name-field').text(view.model.get('name'));
      jQuery('#vetting-explanation-input').val(termExplanation + vettingExplanation);
      jQuery('#vetting-media-container').html('');
      view.model.get('media').forEach(function(url) {
        view.appendOneMedia(url);
      });

      jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.lesson));
      app.vetBar.animate(app.getMyContributionPercent(1) / 100);
      jQuery('.community-progress-percent').text(app.getCommunityContributionPercent(app.lesson));
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








  this.Skeletor = Skeletor;
}).call(this);
