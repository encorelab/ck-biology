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

  app.hexLightGrey  = '#F4F4F4';
  app.hexDarkGrey   = '#95A5A6';
  app.hexLightBlack = '#34495E';
  app.hexLightBlue  = '#3498DB';
  app.hexDarkPurple = '#8E44AD';

  app.progressBarStyleHome = {
    display: 'inline',
    width: '18%',
    'border-radius': '25px'
  };
  app.progressBarTextStyle = {
    color: '#555',
    position: 'absolute',
    left: '2%',
    top: '100%',
    'font-size': '16px'
  };
  app.progressBarStyleTask = {
    display: 'inline',
    width: '50%',
    'border-radius': '25px'
  }


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
      Skeletor.Smartboard.wall.render();
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
      view.collection.each(function(lesson) {
        var title = lesson.get('title');
        var number = lesson.get('number');

        var el = '';
        if (app.getMyContributionPercent(lesson.get('number'))) {
          el += '<div class="home-row-container"><button class="choose-lesson-btn home-btn btn btn-base" data-lesson="'+number+'">Lesson '+number+'</button>';
        } else {
          el += '<div class="home-row-container"><button class="choose-lesson-btn home-btn btn btn-base disabled" data-lesson="'+number+'">Lesson '+number+'</button>';
        }

        el += '<h3 class="lesson-title">'+title+'</h3>';
        el += '<span class="home-progress-container">';
        el += '<span id="lesson'+number+'-my-progress-bar"></span>';
        el += '</span>';
        if (app.getMyContributionPercent(lesson.get('number'), true) > 100) {
          el += '<span class="fa fa-star home-fa-star"></span>';
        } else {
          el += '<span class="fa fa-star home-fa-star invisible"></span>';
        }
        el += '<span class="home-progress-container">';
        el += '<span id="lesson'+number+'-community-progress-bar" class="community-progress-bar"></span>';
        el += '</span></div>';

        homeEl += el;
      });
      jQuery('#home-container').html(homeEl);

      // fill in the progress bars
      Skeletor.Model.awake.lessons.each(function(lesson) {
        var myPercent = '';
        if (app.getMyContributionPercent(lesson.get('number'), true) > 100) {
          myPercent = app.getMyContributionPercent(lesson.get('number'), true) + '+%';
        } else {
          myPercent = app.getMyContributionPercent(lesson.get('number')) + '%';
        }

        var myBar = new ProgressBar.Line('#lesson'+lesson.get('number')+'-my-progress-bar',
          {
            easing: 'easeInOut',
            color: app.hexDarkPurple,
            trailColor: app.hexLightGrey,
            strokeWidth: 8,
            svgStyle: app.progressBarStyleHome,
            text: {
              value:  myPercent,
              style: app.progressBarTextStyle
            }
          });
        myBar.animate(app.getMyContributionPercent(lesson.get('number')) / 100);
        var communityBar = new ProgressBar.Line('#lesson'+lesson.get('number')+'-community-progress-bar',
          {
            easing: 'easeInOut',
            color: app.hexLightBlue,
            trailColor: app.hexLightGrey,
            strokeWidth: 8,
            svgStyle: app.progressBarStyleHome,
            text: {
              value: app.getCommunityContributionPercent(lesson.get('number')) + '%',
              style: app.progressBarTextStyle
            }
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
          color: app.hexDarkPurple,
          trailColor: app.hexLightGrey,
          strokeWidth: 3,
          svgStyle: app.progressBarStyleTask
          // text: {
          //   value:  myPercent,
          //   style: app.progressDefBarTextStyle
          // }
        });
    },

    events: {
      'change #definition-photo-file'        : 'uploadMedia',
      'click .remove-btn'                    : 'removeOneMedia',
      'click .publish-definition-btn'        : 'publishDefinition',
      'click .photo-container'               : 'openPhotoModal',
      'keyup :input'                         : 'checkForAutoSave',
      'keyup #definition-explanation-input'  : 'checkForAllowedToPublish'
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
        jQuery('#definition-btn-container .photo-wrapper').addClass('hidden');
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
        jQuery('#definition-btn-container .photo-wrapper').removeClass('hidden');
        jQuery('.upload-icon').removeClass('invisible');
        jQuery('.publish-definition-btn').removeClass('disabled');
        jQuery().toastmessage('showErrorToast', "Photo could not be uploaded. Please try again");
      }

      function success(data, status, xhr) {
        jQuery('#definition-photo-upload-spinner').addClass('hidden');
        jQuery('#definition-btn-container .photo-wrapper').removeClass('hidden');
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

    appendOneMedia: function(url) {
      var el;

      if (app.photoOrVideo(url) === "photo") {
        el = '<span class="media-container" data-url="'+url+'"><img src="'+app.config.pikachu.url+url+'" class="media photo-container img-responsive"></img><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
      } else if (app.photoOrVideo(url) === "video") {
        el = '<span class="media-container" data-url="'+url+'"><video src="' + app.config.pikachu.url+url + '" class="camera-icon img-responsive" controls /><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
      } else {
        el = '<img src="img/add_file.png" class="media img-responsive" alt="camera icon" />';
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

    checkForAllowedToPublish: function() {
      var view = this;

      if (jQuery('#definition-explanation-input').val().length > 0) {
        jQuery('.publish-definition-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('.publish-definition-btn').css({'background': app.hexDarkGrey});
      }
    },

    publishDefinition: function() {
      var view = this;
      var explanation = jQuery('#definition-explanation-input').val();
      jQuery('.publish-definition-btn').css({'background': app.hexDarkGrey});

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
      app.defBar.animate(app.getMyContributionPercent(app.lesson) / 100);

      view.checkForAllowedToPublish();
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
          color: app.hexDarkPurple,
          trailColor: app.hexLightGrey,
          strokeWidth: 3,
          svgStyle: app.progressBarStyleTask
        });

      // fill the link drop down
      var relationshipTypes = [];
      view.collection.each(function(relationship) {
        relationshipTypes.push(relationship.get('link'));
      });
      var el = '<option value="">Select Relationship</option>';
      _.each(_.uniq(relationshipTypes), function(type) {
        el += '<option value="'+type+'">'+type+'</option>'
      });
      jQuery('#relationship-link-dropdown').html(el);
    },

    events: {
      'click .publish-relationship-btn'      : 'publishRelationship',
      'change #relationship-link-dropdown'   : 'checkLink'
    },

    checkLink: function() {
      var view = this;

      jQuery('.relationship-outcome-container').addClass('hidden');

      if (view.model.get('link') === jQuery('#relationship-link-dropdown').val()) {
        jQuery('#relationship-correct').removeClass('hidden');
        jQuery('.publish-relationship-btn').removeClass('disabled');
        jQuery('.publish-relationship-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('#relationship-incorrect').removeClass('hidden');
        jQuery('.publish-relationship-btn').addClass('disabled');
        jQuery('.publish-relationship-btn').css({'background': app.hexDarkGrey});
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
      jQuery('.publish-relationship-btn').css({'background': app.hexDarkGrey});

      app.markAsComplete();
      app.determineNextStep();
    },

    render: function () {
      var view = this;
      console.log("Rendering RelationshipView...");

      jQuery('#relationship-from-container').text(view.model.get('from'));
      jQuery('#relationship-to-container').text(view.model.get('to'));

      jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.lesson));
      app.relBar.animate(app.getMyContributionPercent(app.lesson) / 100);
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
          color: app.hexDarkPurple,
          trailColor: app.hexLightGrey,
          strokeWidth: 3,
          svgStyle: app.progressBarStyleTask
        });

    },

    events: {
      'change #vetting-photo-file'        : 'uploadMedia',
      'click .remove-btn'                 : 'removeOneMedia',
      'click .publish-vetting-btn'        : 'publishVetting',
      'click .photo-container'            : 'openPhotoModal',
      'click .vetting-radio-btn'          : 'updateVettingRequired',
      'keyup #vetting-addon-input'        : 'checkForAllowedToPublish'
    },

    openPhotoModal: function(ev) {
      var view = this;
      var url = jQuery(ev.target).attr('src');
      //the fileName isn't working for unknown reasons - so we can't add metadata to the photo file name, or make them more human readable. Also probably doesn't need the app.parseExtension(url)
      //var fileName = view.model.get('author') + '_' + view.model.get('title').slice(0,8) + '.' + app.parseExtension(url);
      jQuery('#vetting-photo-modal .photo-content').attr('src', url);
      jQuery('#vetting-photo-modal .download-photo-btn a').attr('href',url);              // TODO this can get removed, maybe moved to the board?
      //jQuery('#vetting-photo-modal .download-photo-btn a').attr('download',fileName);
      jQuery('#vetting-photo-modal').modal({keyboard: true, backdrop: true});
    },

    uploadMedia: function() {
      var view = this;

      var file = jQuery('#vetting-photo-file')[0].files.item(0);
      var formData = new FormData();
      formData.append('file', file);

      if (file.size < MAX_FILE_SIZE) {
        jQuery('#vetting-btn-container .photo-wrapper').addClass('hidden');
        jQuery('#vetting-photo-upload-spinner').removeClass('hidden');
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
        jQuery('#vetting-btn-container .photo-wrapper').removeClass('hidden');
        jQuery('.publish-vetting-btn').removeClass('disabled');
        jQuery().toastmessage('showErrorToast', "Photo could not be uploaded. Please try again");
      }

      function success(data, status, xhr) {
        jQuery('#vetting-photo-upload-spinner').addClass('hidden');
        jQuery('#vetting-btn-container .photo-wrapper').removeClass('hidden');
        jQuery('.publish-vetting-btn').removeClass('disabled');
        console.log("UPLOAD SUCCEEDED!");
        console.log(xhr.getAllResponseHeaders());

        // clear out the label value if they for some reason want to upload the same thing...
        jQuery('.upload-icon').val('');

        view.appendOneMedia(data.url, true);
      }
    },

    appendOneMedia: function(url, allowDelete) {
      var disabledAttr = '';
      if (!allowDelete) {
        disabledAttr = 'hidden';
      }
      var el;

      if (app.photoOrVideo(url) === "photo") {
        el = '<span class="media-container" data-url="'+url+'"><img src="'+app.config.pikachu.url+url+'" class="media photo-container img-responsive"></img><i class="fa fa-times fa-2x remove-btn '+disabledAttr+'" data-url="'+url+'"/></span>';
      } else if (app.photoOrVideo(url) === "video") {
        el = '<span class="media-container" data-url="'+url+'"><video src="' + app.config.pikachu.url+url + '" class="camera-icon img-responsive" controls /><i class="fa fa-times fa-2x remove-btn '+disabledAttr+'" data-url="'+url+'"/></span>';
      } else {
        el = '<img src="img/add_file.png" class="media img-responsive" alt="camera icon" />';
        throw "Error trying to append media - unknown media type!";
      }
      jQuery('#vetting-media-container').append(el);
    },

    removeOneMedia: function(ev) {
      jQuery('.media-container[data-url="'+jQuery(ev.target).data('url')+'"]').remove();
      // clearing this out so the change event for this can be used (eg if they upload the same thing)
      jQuery('.upload-icon').val('');
    },

    updateVettingRequired: function(ev) {
      var view = this;

      // dealing with the view components of this, since radio buttons are THE WORST
      jQuery('.vetting-radio-btn').prop('checked', false);
      jQuery(ev.target).prop('checked', true);

      jQuery('.publish-vetting-btn').removeClass('disabled');

      if (jQuery(ev.target).prop('name') === "yes") {
        jQuery('#vetting-addon-container').addClass('hidden');
        jQuery('#vetting-btn-container .photo-wrapper').addClass('hidden');
      } else {
        jQuery('#vetting-addon-container').removeClass('hidden');
        jQuery('#vetting-btn-container .photo-wrapper').removeClass('hidden');
      }

      view.checkForAllowedToPublish();
    },

    checkForAllowedToPublish: function() {
      var view = this;

      if (jQuery('#vetting-addon-input').val().length > 0 || jQuery('input:radio[name=yes]:checked').val() === "on") {
        jQuery('.publish-vetting-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('.publish-vetting-btn').css({'background': app.hexDarkGrey});
      }
    },

    publishVetting: function() {
      var view = this;
      var explanation = jQuery('#vetting-addon-input').val();

      // this radio button check is very sloppy TODO
      if (explanation.length > 0 || jQuery('input:radio[name=yes]:checked').val() === "on") {
        // all of this date nonsense to work around the fact that wakeful/drowsy choke on the nested Date obj (b/c it isn't JSON)
        var d = new Date();
        var dateStr = d.toDateString() + ', ' + d.toTimeString();
        dateStr = dateStr.substring(0, dateStr.length - 15);
        var vettingObj = {};

        // if radio button is yes, we need to write explanation is blank. This is way over the top, but hoping to future proof since we're going to launch before we get to the knowledge base section
        if (jQuery('input:radio[name=yes]:checked').val() === "on") {
          vettingObj.correct = true;
          vettingObj.explanation = "";
        } else {
          vettingObj.correct = false;
          vettingObj.explanation = explanation;
        }
        vettingObj.author = app.username;
        vettingObj.date = dateStr;

        var vettingsAr = view.model.get('vettings');
        vettingsAr.push(vettingObj);
        view.model.set('vettings', vettingsAr);
        var vettedByAr = view.model.get('vetted_by');
        vettedByAr.push(app.username);
        view.model.set('vetted_by', vettedByAr);

        // note that we add media to the original model, not the vet
        var mediaArr = []
        jQuery('#vetting-media-container .media-container').each(function(i, container) {
          mediaArr.push(jQuery(container).data('url'));
        });
        view.model.set('media', mediaArr);
        view.model.set('locked', '');
        view.model.save();

        jQuery('.vetting-radio-btn').prop('checked', false);
        jQuery('.publish-vetting-btn').addClass('disabled');
        jQuery('#vetting-addon-input').val('');
        jQuery('#vetting-addon-container').addClass('hidden');
        jQuery('#vetting-btn-container .photo-wrapper').addClass('hidden');
        jQuery('.publish-vetting-btn').css({'background': app.hexDarkGrey});

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

      // clear and then add all media from term
      jQuery('#vetting-media-container').html('');
      view.model.get('media').forEach(function(url) {
        view.appendOneMedia(url, false);
      });

      _.each(view.model.get('vettings'), function(vetting) {
        // if this vetter said 'no' complete and correct
        if (!vetting.correct) {
          // create the text for the vet
          vettingExplanation += '\n' + vetting.author + ' - ' + vetting.date + ':\n' + vetting.explanation;
        }
      });

      jQuery('#vetting-name-field').text(view.model.get('name'));
      jQuery('#vetting-explanation-input').val(termExplanation + vettingExplanation);

      if (app.getMyContributionPercent(app.lesson, true) > 100) {
        jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.lesson) + '+');
        jQuery('.vetting-fa-star').removeClass('hidden');
      } else {
        jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.lesson));
        jQuery('.vetting-fa-star').addClass('hidden');
      }
      app.vetBar.animate(app.getMyContributionPercent(app.lesson) / 100);

      view.checkForAllowedToPublish();
    }
  });


  this.Skeletor = Skeletor;
}).call(this);
