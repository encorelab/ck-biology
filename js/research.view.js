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
      'click .choose-lesson-btn' : 'chooseLesson',
      'click input'              : 'updateEnabled'
    },

    chooseLesson: function(ev) {
      var view = this;
      // check which lesson from data value
      app.lesson = jQuery(ev.target).data('lesson');
      Skeletor.Smartboard.wall.render();
      app.hideAllContainers();
      jQuery('.top-nav-btn').removeClass('hidden');
      jQuery('.top-nav-btn').removeClass('active');
      // if student
      if (app.teacherFlag === false) {
        jQuery('#contribution-nav-btn').addClass('active');
        // if review section
        if (view.collection.findWhere({"number": app.lesson}).get('kind') === "review1") {
          jQuery('#knowledge-base-nav-btn').addClass('hidden');
          jQuery('#contribution-nav-btn').addClass('hidden');
          if (app.getMyField(app.username) === null) {
            jQuery('#choose-article-screen').removeClass('hidden');
            app.chooseArticleView.render();
          } else {
            jQuery('#attach-terms-screen').removeClass('hidden');
            app.attachTermsView = new app.View.AttachTermsView({
              el: '#attach-terms-screen',
              model: Skeletor.Model.awake.articles.findWhere({"field": app.getMyField(app.username)})
            });
            app.attachTermsView.render();
          }
        } else {
          // doing this here now, because we need the lesson during the init
          if (app.relationshipView === null) {
            app.relationshipView = new app.View.RelationshipView({
              el: '#relationship-screen',
              collection: Skeletor.Model.awake.relationships
            });
          }
          app.buildContributionArray();
          app.determineNextStep();
        }
      } else {
        jQuery('#knowledge-base-nav-btn').addClass('active');
        jQuery('#wall').removeClass('hidden');
      }
    },

    updateEnabled: function(ev) {
      var view = this;

      if (jQuery(ev.target).val() === "on") {
        jQuery(ev.target).val("off");
        var lesson = view.collection.findWhere({'number': jQuery(ev.target).data('lesson')});
        lesson.set('enabled', false);
        lesson.save();
      } else {
        jQuery(ev.target).val("on");
        var lesson = view.collection.findWhere({'number': jQuery(ev.target).data('lesson')});
        lesson.set('enabled', true);
        lesson.save();
      }

      view.render();
    },

    render: function () {
      var view = this;
      console.log("Rendering HomeView...");

      view.collection.comparator = function(model) {
        return model.get('number');
      };
      view.collection.sort();

      // create the html for the buttons and progress bars
      var homeEl = '';
      view.collection.each(function(lesson) {
        var title = lesson.get('title');
        var number = lesson.get('number');

        var el = '<div class="home-row-container">'
        if (app.teacherFlag === true) {
          if (lesson.get('enabled') === true) {
            el += '<h3>Lesson Enabled</h3><input class="checkbox-blue" data-lesson="'+number+'" type="checkbox" value="on" checked />';
          } else {
            el += '<h3>Lesson Enabled</h3><input class="checkbox-blue" data-lesson="'+number+'" type="checkbox" value="off"/>';
          }
        }

        if (lesson.get('enabled') === true) {
          el += '<button class="choose-lesson-btn home-btn btn btn-base" data-lesson="'+number+'">Lesson '+number+'</button>';
        } else {
          el += '<button class="choose-lesson-btn home-btn btn btn-base" data-lesson="'+number+'" disabled>Lesson '+number+'</button>';
        }

        el += '<h3 class="lesson-title">'+title+'</h3>';
        el += '<span class="home-progress-container">';
        el += '<span id="lesson'+number+'-my-progress-bar"></span>';
        el += '</span>';
        if (app.getMyContributionPercent(app.username, lesson.get('number'), true) > 100) {
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
      view.collection.each(function(lesson) {
        if (app.teacherFlag === false) {
          var myPercent = '';
          if (app.getMyContributionPercent(app.username, lesson.get('number'), true) > 100) {
            myPercent = app.getMyContributionPercent(app.username, lesson.get('number'), true) + '+%';
          } else {
            myPercent = app.getMyContributionPercent(app.username, lesson.get('number')) + '%';
          }

          var myBar = new ProgressBar.Line('#lesson'+lesson.get('number')+'-my-progress-bar',
            {
              easing: 'easeInOut',
              color: app.hexDarkPurple,
              trailColor: app.hexLightGrey,
              strokeWidth: 8,
              svgStyle: app.progressBarStyleHome,
              text: {
                value: myPercent,
                style: app.progressBarTextStyle
              }
            });
          myBar.animate(app.getMyContributionPercent(app.username, lesson.get('number')) / 100);
        }

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
   ********************* TEACHER VIEW ************************
   ***********************************************************
   ***********************************************************/

  app.View.TeacherView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing TeacherView...', view.el);
    },

    render: function () {
      var view = this;
      console.log("Rendering TeacherView...");

      // sort collection by most complete to least complete
      var userArray = [];
      view.collection.each(function(user) {
        if (user.get('user_role') !== "teacher") {
          user.set('complete_percent', app.getMyContributionPercent(user.get('username'), app.lesson, true));
          userArray.push(user);
        }
      });

      function compare(a,b) {
        if (a.get('complete_percent') > b.get('complete_percent'))
          return -1;
        if (a.get('complete_percent') < b.get('complete_percent'))
          return 1;
        return 0;
      }
      userArray.sort(compare);

      // create the html for the buttons and progress bars
      var teacherEl = '';
      _.each(userArray, function(user, index) {
        var name = user.get('username');

        var el = '';
        if (index%2 === 0) {
          el += '<div class="teacher-row-container">';
          el += '<span class="teacher-name-container"><h2>'+name+'</h2></span>';
          el += '<span class="teacher-progress-container">';
          el += '<span id="'+name+'-progress-bar"></span>';
          el += '</span>';
        } else {
          el += '<span class="teacher-name-container"><h2>'+name+'</h2></span>';
          el += '<span class="teacher-progress-container">';
          el += '<span id="'+name+'-progress-bar"></span>';
          el += '</span>';
          el += '</div>';
        }

        teacherEl += el;
      });
      // odd number of students, but including maria in the collection
      if (view.collection.length%2 === 0) {
        teacherEl += '<span class="teacher-name-container"><h2></h2></span>';
        teacherEl += '<span class="teacher-progress-container">';
        teacherEl += '</span>';
        teacherEl += '</div>';
      }
      jQuery('#teacher-container').html(teacherEl);

      view.collection.each(function(user) {
        if (user.get('user_role') !== 'teacher') {
          var myPercent = '';
          if (app.getMyContributionPercent(user.get('username'), app.lesson, true) > 100) {
            myPercent = app.getMyContributionPercent(user.get('username'), app.lesson, true) + '+%';
          } else {
            myPercent = app.getMyContributionPercent(user.get('username'), app.lesson) + '%';
          }

          var myBar = new ProgressBar.Line('#'+user.get('username')+'-progress-bar',
            {
              easing: 'easeInOut',
              color: app.hexDarkPurple,
              trailColor: app.hexLightGrey,
              strokeWidth: 8,
              svgStyle: app.progressBarStyleHome,
              text: {
                value: myPercent,
                style: app.progressBarTextStyle
              }
            });
          myBar.animate(app.getMyContributionPercent(user.get('username'), app.lesson) / 100);
        }
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
      var el = '<span class="media-container" data-url="'+url+'"><img src="'+app.config.pikachu.url+url+'" class="media photo-container img-responsive"></img><i class="fa fa-times fa-2x remove-btn editable" data-url="'+url+'"/></span>';
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
        view.model.set('ip_addr', app.userIP);
        view.model.set('complete', true);
        view.model.set('submitted_at', new Date());
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

      jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.username, app.lesson));
      app.defBar.animate(app.getMyContributionPercent(app.username, app.lesson) / 100);

      view.checkForAllowedToPublish();
    }
  });






  /***********************************************************
   ***********************************************************
   ******************* RELATIONSHIP VIEW *********************
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
      view.collection.comparator = function(model) {
        return model.get('link');
      };
      view.collection.sort();
      _.each(view.collection.where({"lesson": app.lesson}), function(relationship) {
        // handling the corner case of pre-populated linkages
        if (relationship.get('link').length > 0) {
          relationshipTypes.push(relationship.get('link'));
        }
      });
      var el = '<option value="">Select Relationship</option>';
      _.each(_.uniq(relationshipTypes), function(type) {
        el += '<option value="'+type+'">'+type+'</option>'
      });
      jQuery('#relationship-link-dropdown').html(el);

      view.incorrectCounter = 0;
    },

    events: {
      'click .publish-relationship-btn'    : 'publishRelationship',
      'change #relationship-link-dropdown' : 'checkLink'
    },

    checkLink: function() {
      var view = this;

      jQuery('.relationship-outcome-container').addClass('invisible');

      if (view.model.get('link') === jQuery('#relationship-link-dropdown').val()) {
        jQuery('#relationship-correct').removeClass('invisible');
        jQuery('.publish-relationship-btn').removeClass('disabled');
        jQuery('.publish-relationship-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('#relationship-incorrect').removeClass('invisible');
        jQuery('.publish-relationship-btn').addClass('disabled');
        jQuery('.publish-relationship-btn').css({'background': app.hexDarkGrey});
        view.incorrectCounter++;
        jQuery('.incorrect-counter').text(view.incorrectCounter).removeClass('invisible').effect("highlight", {}, 3000);
      }
    },

    publishRelationship: function() {
      var view = this;

      view.model.set('ip_addr', app.userIP);
      view.model.set('incorrect_guesses', view.incorrectCounter);
      view.model.set('complete', true);
      view.model.set('modified_at', new Date());
      view.model.save();

      view.model = null;
      jQuery('.relationship-outcome-container').addClass('invisible');
      jQuery('#relationship-link-dropdown').val("");
      jQuery('.publish-relationship-btn').addClass('disabled');
      jQuery('.publish-relationship-btn').css({'background': app.hexDarkGrey});
      jQuery('.incorrect-counter').addClass('invisible');
      view.incorrectCounter = 0;

      app.markAsComplete();
      app.determineNextStep();
    },

    render: function () {
      var view = this;
      console.log("Rendering RelationshipView...");

      jQuery('#relationship-from-container').text(view.model.get('from'));
      jQuery('#relationship-to-container').text(view.model.get('to'));

      jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.username, app.lesson));
      app.relBar.animate(app.getMyContributionPercent(app.username, app.lesson) / 100);
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
      var el = '<span class="media-container" data-url="'+url+'"><img src="'+app.config.pikachu.url+url+'" class="media photo-container img-responsive"></img><i class="fa fa-times fa-2x remove-btn '+disabledAttr+'" data-url="'+url+'"/></span>';
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
        var dateStr = d.toDateString() + ", " + d.toLocaleTimeString();
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
        vettingObj.ip_addr = app.userIP;

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
        view.model.unlock();
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
      var comments = '';

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

      _.each(view.model.get('comments'), function(comment) {
        comments += '\n' + comment.author + ' - ' + comment.date + ':\n' + comment.explanation;
      });

      jQuery('#vetting-name-field').text(view.model.get('name'));
      jQuery('#vetting-explanation-input').val(termExplanation + '\n' + vettingExplanation + '\n' + comments);

      if (app.getMyContributionPercent(app.username, app.lesson, true) > 100) {
        jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.username, app.lesson, true) + '+');
        jQuery('.vetting-fa-star').removeClass('hidden');
      } else {
        jQuery('.my-progress-percent').text(app.getMyContributionPercent(app.username, app.lesson));
        jQuery('.vetting-fa-star').addClass('hidden');
      }
      app.vetBar.animate(app.getMyContributionPercent(app.username, app.lesson) / 100);

      view.checkForAllowedToPublish();
    }
  });




  /***********************************************************
   ***********************************************************
   ****************** CHOOSE ARTICLE VIEW ********************
   ***********************************************************
   ***********************************************************/

  app.View.ChooseArticleView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing ChooseArticleView...', view.el);
    },

    events: {
      'click #choose-article-container img' : 'chooseField'
    },

    chooseField: function(ev) {
      var view = this;

      var model = view.collection.findWhere({"field": jQuery(ev.target).data('field')})

      if (model.get('users').length < 4) {
        var usersArr = model.get('users');
        usersArr.push(app.username);
        model.set('users', usersArr);
        model.save();

        app.hideAllContainers();
        app.attachTermsView = new app.View.AttachTermsView({
          el: '#attach-terms-screen',
          model: Skeletor.Model.awake.articles.findWhere({"field": app.getMyField(app.username)})
        });
        app.attachTermsView.render();
        jQuery('#attach-terms-screen').removeClass('hidden');
      } else {
        jQuery().toastmessage('showErrorToast', "This article has already been chosen by the maximum number of students");
      }
    },

    render: function () {
      var view = this;
      console.log("Rendering ChooseArticleView...");

      view.collection.comparator = function(model) {
        return model.get('field');
      };
      view.collection.sort();

      // create the html for the buttons and progress bars
      var fieldsEl = '';
      view.collection.each(function(article) {
        var name = article.get('field');
        var image = article.get('field_img');

        var el = '<div class="article-column-container">';
        el += '<img src="'+image+'" data-field="'+name+'"></img><h3>'+name+'</h3>';
        el += '</div>';

        fieldsEl += el;
      });
      jQuery('#choose-article-container').html(fieldsEl);
    }
  });




  /***********************************************************
   ***********************************************************
   ******************** ATTACH TERMS VIEW ********************
   ***********************************************************
   ***********************************************************/

  app.View.AttachTermsView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing AttachTermsView...', view.el);
    },

    events: {
      'click .submit-attached-terms-btn' : 'submitTerms'
    },

    submitTerms: function() {
      var view = this;

      app.explainTermsView = new app.View.ExplainTermsView({
        el: '#explain-terms-screen',
        model: view.model
      });
      app.explainTermsView.render();

      jQuery('#attach-terms-screen').addClass('hidden');
      jQuery('#explain-terms-screen').removeClass('hidden');
    },

    updateModel: function(option, checked) {
      var view = this;

      var termsArr = view.model.get('user_associated_terms');
      if (checked) {
        // add term
        var d = new Date();
        var dateStr = d.toDateString() + ", " + d.toLocaleTimeString();
        var termObj = {};
        termObj.name = option.val();
        termObj.author = app.username;
        termObj.explanation = '';
        termObj.complete = false;
        termObj.date = dateStr;
        termObj.removed = false;
        termsArr.push(termObj);
      } else {
        // remove term
        _.each(termsArr, function(termObj, index) {
          if (termObj.name === option.val()) {
            termsArr.splice(index, 1);
          }
        });
      }
      view.model.set('user_associated_terms', termsArr);
      view.model.save();
    },

    renderTerms: function(containerNum, values) {
      var container = jQuery('[data-term-container="'+containerNum+'"]');
      jQuery(container).html('');
      _.each(values, function(value) {
        jQuery(container).append('<div>'+value+'</div>');
      });

      if (values && values.length > 0) {
        jQuery('.submit-attached-terms-btn').removeClass('disabled');
        jQuery('.submit-attached-terms-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('.submit-attached-terms-btn').addClass('disabled');
        jQuery('.submit-attached-terms-btn').css({'background': app.hexDarkGrey});
      }
    },

    render: function() {
      var view = this;
      console.log("Rendering AttachTermsView...");

      var objEl = '<object id="attach-terms-pdf-content" type="application/pdf" data="articles/pdfs/'+view.model.get('source')+'?#zoom=80&scrollbar=0&toolbar=0&navpanes=0"><p>PDF cannot be displayed</p></object>'
      jQuery('#attach-terms-pdf-container').html(objEl);

      // http://davidstutz.github.io/bootstrap-multiselect/ for API

      // clear everything out
      jQuery('#attach-terms-terms-container').html('');
      jQuery('#attach-terms-selected-container').html('');
      // set up the dropdown types by eaching over the lessons
      _.each(Skeletor.Model.awake.lessons.where({"kind": "homework"}), function(lesson) {
        var el = '<select id="attach-terms-dropdown-'+lesson.get('number')+'" class="lesson-dropdown" multiple="multiple"></select>';
        jQuery('#attach-terms-terms-container').append(el);
        jQuery('#attach-terms-dropdown-'+lesson.get('number')).multiselect({
          nonSelectedText: lesson.get('title'),
          onChange: function(option, checked, select) {
            view.renderTerms(lesson.get('number'), jQuery('#attach-terms-dropdown-'+lesson.get('number')).val());
            view.updateModel(option, checked);
          }
        });

        // set up the containers that this terms will be shown in
        jQuery('#attach-terms-selected-container').append('<div class="terms-container" data-term-container="'+lesson.get('number')+'"></div>');
      });

      // each over the terms and add to dropdown based on term.get('lesson')
      Skeletor.Model.awake.terms.comparator = function(model) {
        return model.get('name').toLowerCase();
      };
      Skeletor.Model.awake.terms.sort();
      // add terms to dropdowns, selected if they are already in the model, plus add terms to view container
      Skeletor.Model.awake.terms.each(function(term) {
        var name = term.get('name');
        var termsArr = _.where(view.model.get('user_associated_terms'), {"name": name});
        // if the user has previously selected this term
        if (termsArr.length > 0) {
          // add the option to the dropdown, set to selected
          jQuery('#attach-terms-dropdown-'+term.get('lesson')).append(new Option(name, name, true, true));
          // add to the respective terms container
          var container = jQuery('[data-term-container="'+term.get('lesson')+'"]');
          jQuery(container).append('<div>'+name+'</div>');
          // user should be able to submit immediately
          jQuery('.submit-attached-terms-btn').removeClass('disabled');
          jQuery('.submit-attached-terms-btn').css({'background': app.hexLightBlack});
        } else {
          // add the option to the dropdown
          jQuery('#attach-terms-dropdown-'+term.get('lesson')).append(new Option(name, name));
        }
      });

      // needs a rebuild to show all the terms
      jQuery('.lesson-dropdown').each(function() {
        jQuery(this).multiselect('rebuild');
      });
    }
  });


  /***********************************************************
   ***********************************************************
   ******************* EXPLAIN TERMS VIEW ********************
   ***********************************************************
   ***********************************************************/

  app.View.ExplainTermsView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing ExplainTermsView...', view.el);
    },

    events: {
      'click .explain-term-btn'             : 'explainTerm',
      'click .submit-annotated-article-btn' : 'submitArticle'
    },

    explainTerm: function(ev) {
      var view = this;
      var termToExplain = jQuery(ev.target).data('term');
      app.explainDetailsView = new app.View.ExplainDetailsView({
        el: '#explain-details-screen',
        model: view.model,
        term: termToExplain
      });
      app.explainDetailsView.render();

      jQuery('#explain-terms-screen').addClass('hidden');
      jQuery('#explain-details-screen').removeClass('hidden');
    },

    submitArticle: function() {
      jQuery().toastmessage('showSuccessToast', "Congratulations! You have completed this section of the unit review.");
      jQuery('#explain-terms-screen').addClass('hidden');
      jQuery('#home-screen').removeClass('hidden');
    },

    render: function() {
      var view = this;
      console.log("Rendering ExplainTermsView...");

      jQuery('#explain-terms-img-container').html('');
      jQuery('#explain-terms-terms-container').html('');

      jQuery('#explain-terms-img-container').append('<img src="articles/pdfs/'+view.model.get('source_img')+'"/>');

      _.each(view.model.get('user_associated_terms'), function(term) {
        var el = ''
        if (term.explanation.length > 0) {
          el = '<button class="explain-term-btn explain-term-complete-btn" data-term="'+term.name+'">'+term.name+'</button>';
        } else {
          el = '<button class="explain-term-btn explain-term-uncomplete-btn" data-term="'+term.name+'">'+term.name+'</button>';
        }
        jQuery('#explain-terms-terms-container').append(el);
      });
    }
  });


  /***********************************************************
   ***********************************************************
   ****************** EXPLAIN DETAILS VIEW *******************
   ***********************************************************
   ***********************************************************/

  app.View.ExplainDetailsView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      // passing in the term name with this.options.term. Good idea, bad idea?
      console.log('Initializing ExplainDetailsView for', this.options.term);
    },

    events: {
      'click .submit-explain-details-btn'        : 'submitExplainDetails',
      'keyup #explain-details-content-container' : 'checkForAllowedToPublish'
    },

    checkForAllowedToPublish: function() {
      var view = this;

      if (jQuery('#explain-details-content-container').val().length > 0) {
        jQuery('.submit-explain-details-btn').removeClass('disabled');
        jQuery('.submit-explain-details-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('.submit-explain-details-btn').addClass('disabled');
        jQuery('.submit-explain-details-btn').css({'background': app.hexDarkGrey});
      }
    },

    submitExplainDetails: function() {
      var view = this;

      _.each(view.model.get('user_associated_terms'), function(termObj) {
        if (termObj.name === view.options.term) {
          termObj.explanation = jQuery('#explain-details-content-container').val();
          view.model.save();
        }
      });
      jQuery('#explain-details-screen').addClass('hidden');
      jQuery('#explain-terms-screen').removeClass('hidden');
    },

    render: function() {
      var view = this;
      console.log("Rendering ExplainDetailsView...");

      jQuery('#explain-details-content-title').html('');

      // if the user has previously defined this
      var termObj = _.findWhere(view.model.get('user_associated_terms'), {"name": view.options.term});
      jQuery('#explain-details-content-container').val(termObj.explanation);

      // TODO: all of this
      var term = Skeletor.Model.awake.terms.findWhere({"name": view.options.term});
      // TODO: this wont work with repeated terms - check out the smartboard.view.balloon.js checkForRepeatedTerms function
      // var termModel = Skeletor.Model.awake.terms.filter(function(term) {
      //   return term.get('name') === view.object.term
      // });

      // DOES THIS NEED TO REFER TO A

      var filteredRelationships = Skeletor.Model.awake.relationships.filter(function(rel) {
        return rel.get('from') === view.options.term || rel.get('to') === view.options.term;
      });

      //jQuery('#explain-details-term-container');


      var titleEl = '<h3><b>'+term.get('name')+'</b> in '+view.model.get('author')+'</h3>';
      jQuery('#explain-details-content-title').append(titleEl);

      view.checkForAllowedToPublish();
    }
  });



  this.Skeletor = Skeletor;
}).call(this);
