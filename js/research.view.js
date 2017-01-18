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
      console.log('Initializing HomeView...');
    },

    events: {
      'click .choose-lesson-btn' : 'chooseLesson',
      'click input'              : 'updateEnabled'
    },

    // WARNING: SPAGHETTI NIGHTMARE LIES THIS WAY
    chooseLesson: function(ev) {
      var view = this;
      // check which lesson from data value
      app.lesson = jQuery(ev.target).data('lesson');
      Skeletor.Smartboard.wall.render();
      app.hideAllContainers();
      jQuery('.top-nav-btn').removeClass('hidden');
      jQuery('.top-nav-btn').removeClass('active');
      jQuery('#grouping-nav-btn').addClass('hidden');
      jQuery('#group-contribution-nav-btn').addClass('hidden');
      jQuery('#final-report-nav-btn').addClass('hidden');
      // STUDENT
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
            var article = Skeletor.Model.awake.articles.findWhere({"field": app.getMyField(app.username)});
            article.wake(app.config.wakeful.url);
            app.attachTermsView = new app.View.AttachTermsView({
              el: '#attach-terms-screen',
              model: article
            });
            app.attachTermsView.render();
            jQuery('#attach-terms-screen').removeClass('hidden');
          }
        } else if (view.collection.findWhere({"number": app.lesson}).get('kind') === "review2") {
          if (app.getMyField(app.username)) {
            jQuery('#knowledge-base-nav-btn').addClass('hidden');
            jQuery('#contribution-nav-btn').addClass('hidden');
            jQuery('#group-negotiate-terms-screen').removeClass('hidden');
            if (app.groupNegotiateTermsView === null) {
              app.groupNegotiateTermsView = new app.View.GroupNegotiateTermsView({
                el: '#group-negotiate-terms-screen',
                model: Skeletor.Model.awake.articles.findWhere({"field": app.getMyField(app.username)})
              });
            }
            app.groupNegotiateTermsView.render();
          } else {
            jQuery().toastmessage('showErrorToast', "You must select a field of research before proceeding. Please click on Review 1 to make that determination.");
            jQuery('.top-nav-btn').addClass('hidden');
            jQuery('#home-screen').removeClass('hidden');
          }
        } else if (view.collection.findWhere({"number": app.lesson}).get('kind') === "review3") {
          if (app.getMyGroup(app.username, "review3").get('kind') === "present") {
            jQuery('#knowledge-base-nav-btn').addClass('hidden');
            jQuery('#contribution-nav-btn').addClass('hidden');
            jQuery('#report-screen').removeClass('hidden');
            var myGroup = app.getMyGroup(app.username, "review3");
            var report = null;
            if (Skeletor.Model.awake.reports.findWhere({"group_colour":myGroup.get('colour'), "lesson":"review3"})) {
              report = Skeletor.Model.awake.reports.findWhere({"group_colour":myGroup.get('colour'), "lesson":"review3"});
            } else {
              // create new report if one doesn't exist (might remove this and pre-pop the DB with reports?). Still, TODO
              // TODO for unit 4 - create report when group is created, but don't delete when group is deleted
              report = new Model.Report();
              report.set('group_colour', myGroup.get('colour'));
              report.set('lesson', 'review3');
              report.set('parts', app.report.parts);      // TODO
              report.set('pdf', app.report.pdf);
              report.save();
              Skeletor.Model.awake.reports.add(report);
            }
            report.wake(app.config.wakeful.url);
            if (app.reportView === null) {
              app.reportView = new app.View.ReportView({
                el: '#report-screen',
                model: report
              });
            }

            app.reportView.render();
          } else {
            jQuery().toastmessage('showErrorToast', "You have not been assigned to a team!");
            jQuery('.top-nav-btn').addClass('hidden');
            jQuery('#home-screen').removeClass('hidden');
          }
        } else if (view.collection.findWhere({"number": app.lesson}).get('kind') === "review4") {
          if (app.getMyGroup(app.username, "review4").get('kind') === "present") {
            jQuery('#knowledge-base-nav-btn').addClass('hidden');
            jQuery('#contribution-nav-btn').addClass('hidden');
            jQuery('#final-report-screen').removeClass('hidden');
            jQuery('#group-contribution-nav-btn').removeClass('hidden');
            jQuery('#final-report-nav-btn').removeClass('hidden');
            jQuery('#group-contribution-nav-btn').addClass('active');

            var report = Skeletor.Model.awake.reports.findWhere({'group_colour':'class'});
            report.wake(app.config.wakeful.url);
            if (app.finalReportView === null) {
              app.finalReportView = new app.View.FinalReportView({
                el: '#final-report-screen',
                model: report
              });
            }
            // DO NOT RENDER!!
            // app.finalReportView.render();
          } else {
            jQuery().toastmessage('showErrorToast', "You have not been assigned to a team!");
            jQuery('.top-nav-btn').addClass('hidden');
            jQuery('#home-screen').removeClass('hidden');
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
      }
      // TEACHER
      else {
        app.reviewSection = view.collection.findWhere({"number": app.lesson}).get('kind');

        // this view is used by review3 and review4. Destroy and rebind
        // if (app.groupingView) {
        //   jQuery(app.groupingView.el).unbind();
        //   app.groupingView.collection.unbind();
        //   app.groupingView = null;
        // }
        if (app.reviewSection === "review1") {
          jQuery('.top-nav-btn').addClass('hidden');
          jQuery('#home-nav-btn').removeClass('hidden');
          jQuery().toastmessage('showWarningToast', "Not much to see here!");
        } else if (app.reviewSection === "review2") {
          jQuery('.top-nav-btn').addClass('hidden');
          jQuery('#home-nav-btn').removeClass('hidden');
          jQuery().toastmessage('showWarningToast', "Not much to see here!");
        } else if (app.reviewSection === "review3") {
          if (app.groupingView === null) {
            app.groupingView = new app.View.GroupingView({
              el: '#grouping-screen',
              collection: Skeletor.Model.awake.groups
            });
          }
          jQuery('#knowledge-base-nav-btn').addClass('hidden');
          jQuery('#grouping-nav-btn').removeClass('hidden');
          jQuery('#grouping-nav-btn').addClass('active');
          jQuery('#grouping-screen').removeClass('hidden');
        } else if (app.reviewSection === "review4") {
          // if the final report doesn't exist, create it
          if (Skeletor.Model.awake.reports.where({"lesson": "review4"}).length === 0) {
            var parts = app.report.parts;
            _.each(parts, function(part) {
              part.complete = false;
              part.assigned = false;
            });
            report = new Model.Report();
            report.set('group_colour', 'class');
            report.set('lesson', 'review4');
            report.set('parts', parts);
            report.set('pdf', app.report.pdf);
            report.wake(app.config.wakeful.url);
            report.save();
            Skeletor.Model.awake.reports.add(report);
          }
          if (app.groupingJigsawView === null) {
            app.groupingJigsawView = new app.View.GroupingView({
              el: '#grouping-jigsaw-screen',
              collection: Skeletor.Model.awake.groups
            });
          }
          jQuery('#knowledge-base-nav-btn').addClass('hidden');
          jQuery('#grouping-nav-btn').removeClass('hidden');
          jQuery('#grouping-nav-btn').addClass('active');
          jQuery('#grouping-jigsaw-screen').removeClass('hidden');
        } else {
          jQuery('#knowledge-base-nav-btn').addClass('active');
          jQuery('#wall').removeClass('hidden');
        }

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
        // if student, show both progress bars for all homework lessons
        // if teacher, show only community progress bar for all homework lessons

        // if review, make invisible (mostly to make the css easier)
        if (lesson.get('kind') !== "homework") {
          jQuery('#lesson'+lesson.get('number')+'-my-progress-bar').addClass('invisible');
          jQuery('#lesson'+lesson.get('number')+'-community-progress-bar').addClass('invisible');
        }

        // if student
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

        // for students and teachers
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
   **************** HOMEWORK PROGRESS VIEW *******************
   ***********************************************************
   ***********************************************************/

  app.View.HomeworkProgressView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing HomeworkProgressView...');
    },

    render: function () {
      var view = this;
      console.log("Rendering HomeworkProgressView...");

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
          el += '<div class="homework-progress-row-container">';
          el += '<span class="homework-progress-name-container"><h2>'+name+'</h2></span>';
          el += '<span class="homework-progress-bar-container">';
          el += '<span id="'+name+'-progress-bar"></span>';
          el += '</span>';
        } else {
          el += '<span class="homework-progress-name-container"><h2>'+name+'</h2></span>';
          el += '<span class="homework-progress-bar-container">';
          el += '<span id="'+name+'-progress-bar"></span>';
          el += '</span>';
          el += '</div>';
        }

        teacherEl += el;
      });
      // odd number of students, but including maria in the collection
      if (view.collection.length%2 === 0) {
        teacherEl += '<span class="homework-progress-name-container"><h2></h2></span>';
        teacherEl += '<span class="homework-progress-bar-container">';
        teacherEl += '</span>';
        teacherEl += '</div>';
      }
      jQuery('#homework-progress-container').html(teacherEl);

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
   ********************* GROUPING VIEW ***********************
   ***********************************************************
   ***********************************************************/

  app.View.GroupingView = Backbone.View.extend({
    initialize: function() {
      var view = this;

      console.log('Initializing GroupingView...');

      // check if there is an 'absent' group, if not, create for both review lessons (VERY SLOPPY, TODO)
      if (view.collection.where({"kind": "absent", "lesson": "review3"}).length === 0) {
        var group = new Model.Group();
        group.set('lesson', 'review3');
        group.set('colour', "grey");     // length will give us an the next colour in the team colour arrays
        group.set('kind', "absent");
        group.save();
        view.collection.add(group);
      }
      if (view.collection.where({"kind": "absent", "lesson": "review4"}).length === 0) {
        var group = new Model.Group();
        group.set('lesson', 'review4');
        group.set('colour', "grey");     // length will give us an the next colour in the team colour arrays
        group.set('kind', "absent");
        group.save();
        view.collection.add(group);
      }

      // generate the groups containers
      _.each(view.collection.where({"lesson": app.reviewSection}), function(group) {
        var teamName = '';
        if (app.reviewSection === "review3") {
          teamName = group.get('colour').toUpperCase() + ' TEAM';
        } else if (app.reviewSection === "review4") {
          teamName = 'TEAM ' + group.get('colour');
        } else {
          console.error('Cannot assign name - unknown review section');
        }
        var groupEl = ''
        if (group.get('kind') === "absent") {
          groupEl = '<div class="group-container" style="background-color: #BDC3C7;" data-group="'+group.get('_id')+'"><button class="fa fa-minus-square remove-group-btn invisible" data-group="'+group.get('_id')+'"></button><h2>ABSENT</h2></div>'
        } else {
          groupEl = '<div class="group-container" data-group="'+group.get('_id')+'"><button class="fa fa-minus-square remove-group-btn" data-group="'+group.get('_id')+'"></button><h2>'+teamName+'</h2></div>';
        }
        jQuery('#'+jQuery(view.el).attr('id')+' .groups-container').append(groupEl);
      });

      // generate all of the student buttons, and place them in groups as necessary
      Skeletor.Mobile.users.each(function(user) {
        if (user.get('user_role') !== "teacher") {
          // student button border colour *always* determined by review3 (since review4 isn't coloured)
          var studentBtn = '';
          var myGroup = app.getMyGroup(user.get('username'), app.reviewSection);
          if (myGroup) {
            // student button border colour *always* determined by review3 (since review4 isn't coloured)
            if (app.getMyGroup(user.get('username'), "review3")) {
              studentBtn = jQuery('<button class="btn btn-default btn-base student-grouping-button" data-student="'+user.get('username')+'" style="border: 5px solid '+app.getMyGroup(user.get('username'), "review3").get('colour')+'">');
            } else {
              studentBtn = jQuery('<button class="btn btn-default btn-base student-grouping-button" data-student="'+user.get('username')+'">');
            }
            jQuery('#'+jQuery(view.el).attr('id')+' .group-container[data-group="'+myGroup.get('_id')+'"]').append(studentBtn);
          } else {
            studentBtn = jQuery('<button class="btn btn-default btn-base student-grouping-button" data-student="'+user.get('username')+'">');
            jQuery('#'+jQuery(view.el).attr('id')+' .students-container').append(studentBtn);
          }
          studentBtn.text(user.get('username'));
        }
      });
    },

    events: {
      'click .add-group-btn'            : 'addGroup',
      'click .remove-group-btn'         : 'removeGroup',
      'click .student-grouping-button'  : 'selectStudent',
      'click .group-container'          : 'groupSelected',
      'click .students-container'       : 'ungroupSelected',
      'click .reset-students-btn'       : 'resetAll',
      'click .assign-randomly-btn'      : 'groupRandomly',
      'click .assign-by-progress-btn'   : 'assignByProgress',
      'click .assign-by-jigsaw-btn'     : 'assignByJigsaw'
    },

    // only available in review4
    assignByJigsaw: function() {
      var view = this;

      // hard remove all groups. This seems to help the async issue of members going into multiple groups
      _.each(view.collection.where({"lesson": "review4"}), function(group) {
        // update the user model
        group.set('members', []);
        group.save();
      });

      // ungroup all students in UI and set up for the readd
      Skeletor.Mobile.users.each(function(user) {
        if (user.get('user_role') !== "teacher") {
          // update the UI
          jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+user.get('username')+'")')).detach().appendTo(jQuery('#'+jQuery(view.el).attr('id')+' .students-container'));
        }
      });

      // get groups from lesson 3 - note that we're grouping students counting the absent group as a group
      var prevGroupsArr = view.collection.where({"lesson": "review3"});

      // go over each review 4 group
      // choose the first student out of each prevGroupsArr and add to group
      _.each(view.collection.where({"kind": "present", "lesson": "review4"}), function(newGroup, index) {
        _.each(prevGroupsArr, function(prevGroup) {
          var members = prevGroup.get('members');
          if (members.length > index) {
            view.groupStudent(members[index], newGroup.get('_id'));
          }
        });
      });
    },

    assignByProgress: function() {
      var view = this;
      var studentsToGroup = [];

      // hard remove all groups. This seems to help the async issue of members going into multiple groups
      _.each(view.collection.where({"lesson": app.reviewSection}), function(group) {
        // update the user model
        group.set('members', []);
        group.save();
      });

      // ungroup all students in UI and create array for the readd
      Skeletor.Mobile.users.each(function(user) {
        if (user.get('user_role') !== "teacher") {
          // update the UI
          jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+user.get('username')+'")')).detach().appendTo(jQuery('#'+jQuery(view.el).attr('id')+' .students-container'));

          var student = {};
          student.name = user.get('username');
          student.unit_progress = app.getMyContributionPercentForUnit(user.get('username'));

          studentsToGroup.push(student);
        }
      });

      // sort the array by progress to order students based on total % complete
      function compare(a,b) {
        if (a.unit_progress > b.unit_progress)
          return -1;
        if (a.unit_progress < b.unit_progress)
          return 1;
        return 0;
      }
      studentsToGroup.sort(compare);

      // determine number of students per group (excluding absent)
      var numGroups = view.collection.where({"lesson": app.reviewSection}).length;
      var minNumStudentsPerGroup = Math.floor(studentsToGroup.length / (numGroups - 1));
      var numExtraStudents = studentsToGroup.length % (numGroups - 1);

      // populate the groups
      _.each(view.collection.where({"kind":"present", "lesson": app.reviewSection}), function(group, index) {
        // add the min number of students per group
        for (var i = 0; i < minNumStudentsPerGroup; i++) {
          var studentObj = studentsToGroup.shift();
          view.groupStudent(studentObj.name, group.get('_id'));
        }
        // NB: ASSUMPTION - the remainder of students (see the mod above) are added to the first groups
        if (index < numExtraStudents) {
          var studentObj = studentsToGroup.shift();
          view.groupStudent(studentObj.name, group.get('_id'));
        }
      });
    },

    groupRandomly: function() {
      var view = this;
      var studentsToGroup = [];

      // hard remove all groups. This seems to help the async issue of members going into multiple groups
      _.each(view.collection.where({"lesson": app.reviewSection}), function(group) {
        // update the user model
        group.set('members', []);
        group.save();
      });

      // ungroup all students in UI and set up for the readd
      Skeletor.Mobile.users.each(function(user) {
        if (user.get('user_role') !== "teacher") {
          // update the UI
          jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+user.get('username')+'")')).detach().appendTo(jQuery('#'+jQuery(view.el).attr('id')+' .students-container'));
          // create the array for the shuffle
          studentsToGroup.push(user.get('username'));
        }
      });

      // remove the absent group from the possible target groups
      var presentGroupArr = view.collection.where({"kind": "present", "lesson": app.reviewSection});

      // group students randomly into non-absent group containers
      _.each(_.shuffle(studentsToGroup), function(studentName, index) {
        // the group in the collection at this index (mod by collection length for when index gets larger than number of groups)
        view.groupStudent(studentName, presentGroupArr[index%(presentGroupArr.length)].get('_id'));
      });
    },

    resetAll: function() {
      var view = this;

      _.each(view.collection.where({"lesson": app.reviewSection}), function(group) {
        // update the user model
        group.set('members', []);
        group.save();
      });

      Skeletor.Mobile.users.each(function(user) {
        if (user.get('user_role') !== "teacher") {
          jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+user.get('username')+'")'))
          .detach().appendTo(jQuery('#'+jQuery(view.el).attr('id')+' .students-container'));
        }
      });
    },

    addGroup: function() {
      var view = this;

      // this got nasty because of no mockups for Review 4 - apparently Alisa wanted something very different than I had assumed. Hence the groupNumber nonsense below

      // proxy for checking if we have hit max num of groups
      var newGroupName = '';
      if (app.reviewSection === "review3") {
        var usedColours = [];
        _.each(view.collection.where({"lesson": "review3", "kind": "present"}), function(group) {
          usedColours.push(group.get('colour'));
        });
        newGroupName = _.first(_.difference(app.teamColourName, usedColours));
      } else if (app.reviewSection === "review4") {
        var usedNumbers = [];
        _.each(view.collection.where({"lesson": "review4", "kind": "present"}), function(group) {
          usedNumbers.push(group.get('colour'));
        });
        newGroupName = _.first(_.difference(["1", "2", "3", "4", "5"], usedNumbers));
      } else {
        console.error("Unknown review section for grouping (addGroup)");
      }

      var newGroupText = '';
      if (newGroupName) {
        // create a new group
        var group = new Model.Group();
        group.set('lesson', app.reviewSection);
        group.set('colour', newGroupName);
        if (app.reviewSection === "review3") {
          newGroupText = newGroupName.toUpperCase() + ' TEAM';
        } else if (app.reviewSection === "review4") {
          newGroupText = 'TEAM ' + newGroupName;
        } else {
          console.error("Unknown review section for grouping (addGroup)");
        }
        group.set('kind', 'present');
        group.save();
        view.collection.add(group);

        // update UI
        var groupEl = '<div class="group-container" data-group="'+group.get('_id')+'"><button class="fa fa-minus-square remove-group-btn" data-group="'+group.get('_id')+'"></button><h2>'+newGroupText+'</h2></div>';
        jQuery('#'+jQuery(view.el).attr('id')+' .groups-container').append(groupEl);

      } else {
        jQuery().toastmessage('showErrorToast', "Maximum number of groups already created");
      }
    },

    removeGroup: function(ev) {
      var view = this;

      // move the students back to their container
      var group = view.collection.get(jQuery(ev.target).data('group'));
      _.each(group.get('members'), function(member) {
        jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+member+'")')).detach().appendTo(jQuery('#'+jQuery(view.el).attr('id')+' .students-container'));
      });

      // update collection
      group.destroy();

      // update UI
      jQuery('#'+jQuery(view.el).attr('id')+' .group-container[data-group="'+jQuery(ev.target).data('group')+'"]').remove();
    },

    selectStudent: function(ev) {
      var view = this;

      jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button').removeClass('selected');
      jQuery(ev.target).addClass('selected');

      // to prevent propagation. Otherwise jQuery gets confused and removes the element (!) because it can't figure out what to do with the default click event
      return false;
    },

    groupSelected: function(ev) {
      var view = this;

      if (jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button.selected').length > 0) {
        view.groupStudent(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button.selected').text(), jQuery(ev.target).data('group'));
      }
    },

    ungroupSelected: function() {
      var view = this;

      if (jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button.selected').length > 0) {
        view.ungroupStudent(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button.selected').text());
      }
    },

    groupStudent: function(name, targetGroup) {
      var view = this;

      // remove this student from old group, as necessary
      var prevGroup = app.getMyGroup(name, app.reviewSection);
      if (prevGroup) {
        var prevMembersArr = prevGroup.get('members');
        var updatedArr = prevMembersArr.filter(function(member) {
          return member !== name;
        });
        prevGroup.set('members', updatedArr);
        prevGroup.save();
      }

      // update the user model
      var newGroup = view.collection.get(targetGroup);
      var newMembersArr = newGroup.get('members');
      newMembersArr.push(name);
      newGroup.set('members', newMembersArr);
      newGroup.save();

      // update the UI
      jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+name+'")')).detach().appendTo(jQuery('#'+jQuery(view.el).attr('id')+' .group-container[data-group="'+targetGroup+'"]'));
      if (app.getMyGroup(name, "review3")) {
        jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+name+'")')).css('border', '5px solid '+app.getMyGroup(name, "review3").get('colour'));
      }
      jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button').removeClass('selected');
    },

    ungroupStudent: function(name) {
      var view = this;

      // update the user model
      var group = app.getMyGroup(name, app.reviewSection);
      var membersArr = group.get('members');
      var updatedArr = membersArr.filter(function(member) {
        return member !== name;
      });
      group.set('members', updatedArr);
      group.save();

      // update the UI
      jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+name+'")')).detach().appendTo(jQuery('#'+jQuery(view.el).attr('id')+' .students-container'));
      if (app.reviewSection === "review3") {
        jQuery(jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button:contains("'+name+'")')).css('border', 'none');
      }
      jQuery('#'+jQuery(view.el).attr('id')+' .student-grouping-button').removeClass('selected');
    },

    render: function () {
      var view = this;
      console.log('Rendering GroupingView...');
    }
  });


  /***********************************************************
   ***********************************************************
   **************** REVIEW PROGRESS VIEW *********************
   ***********************************************************
   ***********************************************************/

  app.View.ReviewProgressView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing ReviewProgressView...');

      Skeletor.Model.awake.reports.on('change', function () {
        view.render();
      });
    },

    events: {
      'click .review-progress-group-btn' : 'switchToReportView'
    },

    switchToReportView: function(ev) {
      var report = Skeletor.Model.awake.reports.findWhere({"group_colour": jQuery(ev.target).data('colour')});
      // if this group has started their report
      if (report) {
        if (app.teacherReportView === null) {
          app.teacherReportView = new app.View.TeacherReportView({
            el: '#teacher-report-screen',
            model: report
          });
        } else {
          app.teacherReportView.model = report;
        }
        app.teacherReportView.render();
        jQuery('#review-progress-screen').addClass('hidden');
        jQuery('#teacher-report-screen').removeClass('hidden');
      } else {
        jQuery().toastmessage('showErrorToast', "This group has not started their report yet");
      }
    },

    render: function () {
      var view = this;
      console.log("Rendering ReviewProgressView...");

      jQuery('#review-progress-container').html('');
      var el = '';
      _.each(view.collection.where({"lesson": "review3", "kind": "present"}), function(group) {
        el += '<div class="review-progress-group-container">';
        el += '<button class="review-progress-group-btn" data-colour="'+group.get('colour')+'" style="background-color: '+app.getColourForColour(group.get('colour'))+'">'+group.get('colour').toUpperCase()+' TEAM</button>';
        el += '<div class="review-progress-progress-bar-container">';
        el += '<span id="review-progress-'+group.get('colour')+'-progress-bar" class="review-progress-group-progress-bar"/>'
        el += '<span class="review-progress-group-progress-percent"></span>';
        el += '<span class="review-progress-percent"></span>';
        el += '</div>';
        el += '</div>';
      });
      jQuery('#review-progress-container').append(el);

      _.each(view.collection.where({"lesson": "review3", "kind": "present"}), function(group) {
        //var report = Skeletor.Model.awake.reports.findWhere({"lesson": "review3", "group_colour": group.get('colour')});
        var myPercent = app.getReportCompletionPercent("review3", group.get('colour')) + '%';
        var myBar = new ProgressBar.Line('#review-progress-'+group.get('colour')+'-progress-bar',
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
        myBar.set(app.getReportCompletionPercent("review3", group.get('colour')) / 100);
      });
    }
  });


  /***********************************************************
   ***********************************************************
   **************** TEACHER REPORT VIEW **********************
   ***********************************************************
   ***********************************************************/

  app.View.TeacherReportView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing TeacherReportView...');

      view.model.on('change', function () {
        view.render();
      });
    },

    events: {
      'click img'                            : 'openImgModal',
      'click #close-teacher-report-view-btn' : 'switchToProgressView'
    },

    openImgModal: function(ev) {
      var view = this;
      var url = jQuery(ev.target).attr('src');
      jQuery('#teacher-report-modal .photo-content').attr('src', url);
      jQuery('#teacher-report-modal').modal({keyboard: true, backdrop: true});
    },

    switchToProgressView: function() {
      jQuery('#teacher-report-screen').addClass('hidden');
      jQuery('#review-progress-screen').removeClass('hidden');
    },

    render: function () {
      var view = this;
      console.log("Rendering TeacherReportView...");

      jQuery('#teacher-report-container').html('');
      var reportEl = '<h1>' + view.model.get('group_colour').charAt(0).toUpperCase() + view.model.get('group_colour').slice(1) + ' Team Research Proposal Report</h1>';
      reportEl += '<div>';
      _.each(view.model.get('parts'), function(part) {
        // only add text chunks for things the students have written (not intro stuff)
        if (part.kind === 'write') {
          reportEl += '<p><h2>' + part.name + '</h2>';
          if (part.thumbnail.length > 0) {
            reportEl += '<img class="thumb" src="'+part.thumbnail+'"/>';
          }
          reportEl += '</p>'

          _.each(part.entries, function(entry) {
            reportEl += '<p>' + entry + '</p>';
          })
        }
      });
      reportEl += '</div>';

      jQuery('#teacher-report-container').append(reportEl);
    }
  });



  /***********************************************************
   ***********************************************************
   *************** TEACHER FINAL REPORT VIEW *****************
   ***********************************************************
   ***********************************************************/

  app.View.TeacherFinalReportView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing TeacherFinalReportView...');

      view.model.on('change', function () {
        view.render();
      });
    },

    events: {
      'click img' : 'openImgModal'
    },

    openImgModal: function(ev) {
      var view = this;
      var url = jQuery(ev.target).attr('src');
      jQuery('#teacher-final-report-modal .photo-content').attr('src', url);
      jQuery('#teacher-final-report-modal').modal({keyboard: true, backdrop: true});
    },

    render: function () {
      var view = this;
      console.log("Rendering TeacherFinalReportView...");

      jQuery('#teacher-final-report-container').html('');
      var reportEl = '<h1>Research Proposal Review Report to NSF</h1>';
      _.each(view.model.get('parts'), function(part) {
        // only add text chunks for things the students have written (not intro stuff)
        if (part.kind === 'write') {

          // add the part title
          reportEl += '<p><h2>' + part.name + '</h2>';

          // add a thumbnail if it exists
          if (part.thumbnail.length > 0) {
            reportEl += '<img class="thumb" src="'+part.thumbnail+'"/>';
          }
          reportEl += '</p>'

          // add the text entries
          _.each(part.entries, function(entry) {
            reportEl += '<p>' + entry + '</p>';
          })

          // if there are tags, add them
          if (part.tags && part.tags.length > 0) {
            reportEl += '<p><b>Related terms from this unit:</b> ';
            _.each(part.tags, function(tag) {
              reportEl += tag;
              reportEl += ', ';
            });
            reportEl = reportEl.slice(0,-2);
            reportEl += '</p>';
          }
        }
      });

      jQuery('#teacher-final-report-container').append(reportEl);
    }
  });










  /*****************************************************************************************************
   *****************************************************************************************************
   ************************************ STUDENT RELATED VIEWS ******************************************
   *****************************************************************************************************
   *****************************************************************************************************/



  /***********************************************************
   ***********************************************************
   ******************** DEFINITION VIEW **********************
   ***********************************************************
   ***********************************************************/

  app.View.DefinitionView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing DefinitionView...');

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
      console.log('Initializing RelationshipView...');

      app.relBar = new ProgressBar.Line('#relationship-my-progress-bar',
        {
          easing: 'easeInOut',
          color: app.hexDarkPurple,
          trailColor: app.hexLightGrey,
          strokeWidth: 3,
          svgStyle: app.progressBarStyleTask
        });

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

      // special instructions for Unit 2/Lesson 2
      var u2l2Flag = view.collection.findWhere({"lesson": app.lesson, "link": "produces 34"});
      if (u2l2Flag) {
        jQuery('#relationship-screen .instructions').text('Identify the relationship that exists between the following two terms. \b (relationships that specify quantities are net per 1 molecule of glucose)');
      } else {
        jQuery('#relationship-screen .instructions').text('Identify the relationship that exists between the following two terms.');
      }

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
      console.log('Initializing VettingView...');

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












/*****************************************************************************************************
 *****************************************************************************************************
 ************************************* STUDENT REVIEW VIEWS ******************************************
 *****************************************************************************************************
 *****************************************************************************************************/


  /***********************************************************
   ***********************************************************
   ****************** CHOOSE ARTICLE VIEW ********************
   ***********************************************************
   ***********************************************************/

  app.View.ChooseArticleView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing ChooseArticleView...');
    },

    events: {
      'click #choose-article-container img' : 'chooseField'
    },

    chooseField: function(ev) {
      var view = this;

      var article = Skeletor.Model.awake.articles.findWhere({"field": jQuery(ev.target).data('field')});
      article.wake(app.config.wakeful.url);

      if (article.get('users').length < 4) {
        var usersArr = article.get('users');
        usersArr.push(app.username);
        article.set('users', usersArr);
        article.save();

        app.hideAllContainers();

        app.attachTermsView = new app.View.AttachTermsView({
          el: '#attach-terms-screen',
          model: article
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
      console.log('Initializing AttachTermsView...');
    },

    events: {
      'click .submit-attached-terms-btn'    : 'submitTerms',
      'mouseover .multiselect-container li' : 'showTermPopover'
    },

    submitTerms: function() {
      var view = this;

      // doing this here now, as opposed to each click/unclick - my very soul is ashamed of this code
      var termsToAddArr = [];
      jQuery('.terms-container').each(function(index, el) {
        jQuery(el).children().each(function(index, child) {
          termsToAddArr.push(jQuery(child).text());
        });
      });

      var termsArr = view.model.get('user_associated_terms');
      var indecesToRemove = [];

      // remove terms
      _.each(termsArr, function(term, index) {
        if (term.author === app.username) {
          var deleteFlag = true;
          _.each(termsToAddArr, function(name) {
            if (term.name === name) {
              deleteFlag = false;
            }
          });
          if (deleteFlag === true) {
            indecesToRemove.push(index);
          }
        }
      });

      for (var i = indecesToRemove.length - 1; i >= 0; i--) {
        termsArr.splice(indecesToRemove[i], 1);
      }


      // add terms
      _.each(termsToAddArr, function(name) {
        var addFlag = true;
        _.each(termsArr, function(term) {
          // if it already exists in the array
          if (term.name === name && term.author === app.username) {
            addFlag = false;
          }
        });
        if (addFlag === true) {
          // add term
          var d = new Date();
          var dateStr = d.toDateString() + ", " + d.toLocaleTimeString();
          var termObj = {};
          termObj.name = name;
          termObj.author = app.username;
          termObj.explanation = '';
          termObj.complete = false;
          termObj.date = dateStr;
          termObj.removed = false;
          termsArr.push(termObj);
        }
      });
      view.model.set('user_associated_terms', termsArr);
      view.model.save();

      if (app.explainTermsView === null) {
        app.explainTermsView = new app.View.ExplainTermsView({
          el: '#explain-terms-screen',
          model: view.model
        });
      }
      app.explainTermsView.render();

      jQuery('#attach-terms-screen').addClass('hidden');
      jQuery('#explain-terms-screen').removeClass('hidden');
    },

    showTermPopover: function(ev) {
      // if we're mousing over the right area
      if (jQuery(ev.target).find('input').val()) {
        jQuery('#attach-terms-explanation-pane').html('');
        app.buildTermView('#attach-terms-explanation-pane', jQuery(ev.target).find('input').val());
      }
    },

    // updateModel: function(option, checked) {
    //   var view = this;

    //   var termsArr = view.model.get('user_associated_terms');
    //   if (checked) {
    //     // add term
    //     var d = new Date();
    //     var dateStr = d.toDateString() + ", " + d.toLocaleTimeString();
    //     var termObj = {};
    //     termObj.name = option.val();
    //     termObj.author = app.username;
    //     termObj.explanation = '';
    //     termObj.complete = false;
    //     termObj.date = dateStr;
    //     termObj.removed = false;
    //     termsArr.push(termObj);
    //   } else {
    //     // remove term
    //     _.each(termsArr, function(termObj, index) {
    //       if (termObj.name === option.val()) {
    //         termsArr.splice(index, 1);
    //       }
    //     });
    //   }
    //   view.model.set('user_associated_terms', termsArr);
    //   view.model.save();
    // },

    renderTerms: function(containerNum, values) {
      var container = jQuery('#attach-terms-screen [data-term-container="'+containerNum+'"]');
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

      if (app.getMyField()) {
        var el = '<h1>Your article on '+app.getMyField()+'</h1>';
        jQuery('#attach-terms-title-container').html(el);
      } else {
        jQuery().toastmessage('showErrorToast', "Collision error. Please return to home screen and re-choose this field of research.");
      }

      jQuery('#attach-terms-explanation-pane').html('');

      var objEl = '<object id="attach-terms-pdf-content" type="application/pdf" data="'+view.model.get('source')+'?#zoom=82&scrollbar=0&toolbar=0&navpanes=0"><p>PDF cannot be displayed</p></object>'
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
            //view.updateModel(option, checked);
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
        var termsArr = _.where(view.model.get('user_associated_terms'), {"name": name, "author": app.username});
        // if the user has previously selected this term
        if (termsArr.length > 0) {
          // add the option to the dropdown, set to selected
          jQuery('#attach-terms-dropdown-'+term.get('lesson')).append(new Option(name, name, true, true));
          // add to the respective terms container
          var container = jQuery('#attach-terms-screen [data-term-container="'+term.get('lesson')+'"]');
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
      console.log('Initializing ExplainTermsView...');
    },

    events: {
      'click .explain-term-btn'             : 'explainTerm',
      'click .submit-annotated-article-btn' : 'submitArticle'
    },

    explainTerm: function(ev) {
      var view = this;
      var termToExplain = jQuery(ev.target).data('term');
      if (app.explainDetailsView === null) {
        app.explainDetailsView = new app.View.ExplainDetailsView({
          el: '#explain-details-screen',
          model: view.model,
          term: termToExplain
        });
      } else {
        // lordy this is nasty. Can't find a good way to delete backbone views, this prevents the submit button in explain being re-bound each time the view is created
        app.explainDetailsView.options.term = termToExplain;
      }
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

      jQuery('#explain-terms-img-container').append('<img src="'+view.model.get('source_img')+'"/>');

      var myTermsArr = _.where(view.model.get('user_associated_terms'), {"author": app.username});
      _.each(myTermsArr, function(term, index) {
        var el = '';
        if (term.complete === true) {
          el = '<button class="explain-term-btn explain-term-complete-btn" data-term="'+term.name+'">'+term.name+'</button>';
          // check if we should enable the finish button
          if (myTermsArr.length-1 === index) {
            jQuery('.submit-annotated-article-btn').removeClass('disabled');
            jQuery('.submit-annotated-article-btn').css({'background': app.hexLightBlack});
          } else {
            jQuery('.submit-annotated-article-btn').addClass('disabled');
            jQuery('.submit-annotated-article-btn').css({'background': app.hexDarkGrey});
          }
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
      'click .submit-explain-details-btn'    : 'submitExplainDetails',
      'keyup #explain-details-content-entry' : 'checkForAllowedToPublish'
    },

    checkForAllowedToPublish: function() {
      var view = this;

      if (jQuery('#explain-details-content-entry').val().length > 0) {
        jQuery('.submit-explain-details-btn').removeClass('disabled');
        jQuery('.submit-explain-details-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('.submit-explain-details-btn').addClass('disabled');
        jQuery('.submit-explain-details-btn').css({'background': app.hexDarkGrey});
      }
    },

    submitExplainDetails: function() {
      var view = this;

      // lolololol. I guess this is better than what we had before, but still... is there really no better way!?
      // this unparsable nonsense sets the explanation and the complete on this specific user_associated term
      _.where(view.model.get('user_associated_terms'), {"name": view.options.term, "author": app.username})[0].explanation = jQuery('#explain-details-content-entry').val();
      _.where(view.model.get('user_associated_terms'), {"name": view.options.term, "author": app.username})[0].complete = true;
      view.model.save();

      jQuery('#explain-details-screen').addClass('hidden');
      jQuery('#explain-terms-screen').removeClass('hidden');
      app.explainTermsView.render();
    },

    render: function() {
      var view = this;
      console.log("Rendering ExplainDetailsView...");

      // render the term content
      jQuery('#explain-details-term-container').html('');
      app.buildTermView('#explain-details-term-container', view.options.term);

      // render the user gen'd content
      jQuery('#explain-details-content-container').html('');
      var term = app.checkForRepeatTerm(Skeletor.Model.awake.terms.findWhere({"name": view.options.term}));
      var titleEl = '<h3 class="title"><b>'+term.get('name')+'</b> in '+view.model.get('author')+'</h3>';
      jQuery('#explain-details-content-container').append(titleEl);
      var entryEl = '<textarea id="explain-details-content-entry"></textarea>';
      jQuery('#explain-details-content-container').append(entryEl);

      // if the user has previously defined this
      var termObj = _.findWhere(view.model.get('user_associated_terms'), {"name": view.options.term, "author": app.username});
      jQuery('#explain-details-content-entry').val(termObj.explanation);

      view.checkForAllowedToPublish();
    }
  });


  /***********************************************************
   ***********************************************************
   ************** GROUP NEGOTIATE TERMS VIEW *****************
   ***********************************************************
   ***********************************************************/

  app.View.GroupNegotiateTermsView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing GroupNegotiateTermsView...');
    },

    events: {
      'click .group-negotiate-term-btn'            : 'negotiateTerm',
      'change .add-term-dropdown'                  : 'showAddTerm',
      'click .add-term-group-negotiate-terms-btn'  : 'openModal',
      'click .add-term-yes-btn'                    : 'addTerm',
      'click .add-term-no-btn'                     : 'closeModal',
      'click .submit-group-negotiated-article-btn' : 'submitArticle',
    },

    addTerm: function() {
      var view = this;

      var term = jQuery('.add-term-dropdown').val();
      var groupTerms = view.model.get('group_associated_terms');
      var groupTerm = {};
      groupTerm.name = term;
      groupTerm.explanation = "";
      groupTerm.complete = true;
      groupTerms.push(groupTerm);
      view.model.save('group_associated_terms', groupTerms);

      jQuery('#confirm-add-term-modal').modal('hide');
      view.switchToDetailsView(term);
    },

    closeModal: function() {
      var view = this;

      jQuery('#confirm-add-term-modal').modal('hide');
      view.render();          // OVERKILLLLLLLL
    },

    openModal: function() {
      var view = this;

      jQuery('.term-to-add').text(jQuery('.add-term-dropdown').val());
      jQuery('#confirm-add-term-modal').modal({keyboard: false, backdrop: 'static'});
    },

    negotiateTerm: function(ev) {
      var view = this;

      view.switchToDetailsView(jQuery(ev.target).data('term'));
    },

    showAddTerm: function() {
      if (jQuery('.add-term-dropdown').val() === 'Add new term') {
        jQuery('.add-term-group-negotiate-terms-btn').addClass('invisible');
      } else {
        jQuery('.add-term-group-negotiate-terms-btn').removeClass('invisible');
      }
    },

    switchToDetailsView(termToNegotiate) {
      var view = this;

      if (app.groupNegotiateDetailsView === null) {
        app.groupNegotiateDetailsView = new app.View.GroupNegotiateDetailsView({
          el: '#group-negotiate-details-screen',
          model: view.model,
          term: termToNegotiate
        });
      } else {
        // lordy this is nasty. Can't find a good way to delete backbone views, this prevents the submit button in details being rebound each time the view is created
        app.groupNegotiateDetailsView.options.term = termToNegotiate;
      }
      app.groupNegotiateDetailsView.render();

      jQuery('#group-negotiate-terms-screen').addClass('hidden');
      jQuery('#group-negotiate-details-screen').removeClass('hidden');
    },

    checkForAllowedToPublish: function() {
      var view = this;

      var completeFlag = true
      _.each(view.model.get('group_associated_terms'), function(term) {
        if (term.complete === false) {
          completeFlag = false;
        }
      });

      if (completeFlag) {
        jQuery('.submit-group-negotiated-article-btn').removeClass('disabled');
        jQuery('.submit-group-negotiated-article-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('.submit-group-negotiated-article-btn').addClass('disabled');
        jQuery('.submit-group-negotiated-article-btn').css({'background': app.hexDarkGrey});
      }
    },

    submitArticle: function() {
      jQuery().toastmessage('showSuccessToast', "Congratulations! You have completed this section of the unit review.");
      jQuery('#group-negotiate-terms-screen').addClass('hidden');
      jQuery('#home-screen').removeClass('hidden');
    },

    render: function() {
      var view = this;
      console.log("Rendering GroupNegotiateTermsView...");

      // go over each user_assoc term and if it's not already in the group_assoc terms, add it
      // this doesn't really belong here - still thinking about where it best fits
      var nonRemovedTerms = _.where(view.model.get('user_associated_terms'), {"removed": false});
      _.each(nonRemovedTerms, function(myTerm) {
        var presentFlag = false;
        presentFlag = _.some(view.model.get('group_associated_terms'), function(groupTerm) {
          return groupTerm.name === myTerm.name
        });

        if (!presentFlag) {
          var groupTerms = view.model.get('group_associated_terms');
          var groupTerm = {};
          groupTerm.name = myTerm.name;
          groupTerm.explanation = "";
          groupTerm.complete = false;
          groupTerms.push(groupTerm);
          view.model.save('group_associated_terms', groupTerms);
        }
      });

      // populate the add new term dropdown
      jQuery('.add-term-dropdown').html('');
      jQuery('.add-term-dropdown').append(new Option('Add new term', 'Add new term'));
      var termsArr = Skeletor.Model.awake.terms.filter(function(term) {
        return term.get('assigned_to') !== "";
      });
      _.each(termsArr, function(term) {
        // only add terms that are not already in the group_assoc
        if (!_.findWhere(view.model.get('group_associated_terms'), {"name": term.get('name')} )) {
          jQuery('.add-term-dropdown').append(new Option(term.get('name'), term.get('name')));
        }
      });
      jQuery('.add-term-group-negotiate-terms-btn').addClass('invisible');

      view.checkForAllowedToPublish();

      jQuery('#group-negotiate-terms-img-container').html('');
      jQuery('#group-negotiate-terms-terms-container').html('');

      jQuery('#group-negotiate-terms-img-container').append('<img src="'+view.model.get('source_img')+'"/>');

      _.each(view.model.get('group_associated_terms'), function(term, index) {
        // agreementLevel will be btw 1 and 4
        var agreementLevel = _.where(view.model.get('user_associated_terms'), {"name": term.name}).length;

        var el = '';
        if (term.complete === true) {
          el = '<button class="group-negotiate-term-btn" data-term="'+term.name+'" style="background-color:#2ECC71">'+term.name+'</button>';
        } else if (agreementLevel === 4) {
          el = '<button class="group-negotiate-term-btn" data-term="'+term.name+'" style="background-color:#13496c">'+term.name+'</button>';
        } else if (agreementLevel === 3) {
          el = '<button class="group-negotiate-term-btn" data-term="'+term.name+'" style="background-color:#1f74ad">'+term.name+'</button>';
        } else if (agreementLevel === 2) {
          el = '<button class="group-negotiate-term-btn" data-term="'+term.name+'" style="background-color:#3498DB">'+term.name+'</button>';
        } else if (agreementLevel === 1) {
          el = '<button class="group-negotiate-term-btn" data-term="'+term.name+'" style="background-color:#67b2e4">'+term.name+'</button>';
        } else {
          console.error('Cannot determine agreementLevel');
        }

        jQuery('#group-negotiate-terms-terms-container').append(el);
      });
    }
  });


  /***********************************************************
   ***********************************************************
   *************** GROUP NEGOTIATE DETAILS VIEW **************
   ***********************************************************
   ***********************************************************/

  app.View.GroupNegotiateDetailsView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      // passing in the term name with this.options.term. Good idea, bad idea?
      console.log('Initializing GroupNegotiateDetailsView for', this.options.term);
    },

    events: {
      'click .submit-group-negotiate-details-btn'      : 'submitDetails',
      'click .remove-term-group-negotiate-details-btn' : 'openModal',
      'click .remove-term-no-btn'                      : 'closeModal',
      'click .remove-term-yes-btn'                     : 'removeTerm',
      'keyup .details-entry'                           : 'checkForAllowedToPublish'
    },

    openModal: function() {
      jQuery('#confirm-remove-term-modal').modal({keyboard: false, backdrop: 'static'});
    },

    closeModal: function() {
      jQuery('#confirm-remove-term-modal').modal('hide');
    },

    removeTerm: function() {
      var view = this;

      // remove it from the group terms
      var termObj = _.findWhere(view.model.get('group_associated_terms'), {"name": view.options.term});
      var newTermArr = _.without(view.model.get('group_associated_terms'), termObj);
      view.model.set('group_associated_terms', newTermArr);

      // mark as removed from individual terms
      _.each(view.model.get('user_associated_terms'), function(termObj) {
        if (termObj.name === view.options.term) {
          termObj.removed = true;
        }
      });

      view.model.save();

      jQuery('#confirm-remove-term-modal').modal('hide');
      jQuery('#group-negotiate-details-screen').addClass('hidden');
      jQuery('#group-negotiate-terms-screen').removeClass('hidden');
      app.groupNegotiateTermsView.render();
    },

    submitDetails: function() {
      var view = this;

      //lolololol. I guess this is better than what we had before, but still... is there really no better way!?
      //this unparsable nonsense sets the explanation and the complete on this specific user_associated term
      _.where(view.model.get('group_associated_terms'), {"name": view.options.term})[0].explanation = jQuery('.details-entry').val();
      _.where(view.model.get('group_associated_terms'), {"name": view.options.term})[0].complete = true;
      view.model.save();

      jQuery('#group-negotiate-details-screen').addClass('hidden');
      jQuery('#group-negotiate-terms-screen').removeClass('hidden');
      app.groupNegotiateTermsView.render();
    },

    checkForAllowedToPublish: function() {
      var view = this;

      if (jQuery('#group-negotiate-details-entry-container .details-entry').val().length > 0) {
        jQuery('.submit-group-negotiate-details-btn').removeClass('disabled');
        jQuery('.submit-group-negotiate-details-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('.submit-group-negotiate-details-btn').addClass('disabled');
        jQuery('.submit-group-negotiate-details-btn').css({'background': app.hexDarkGrey});
      }
    },

    render: function() {
      var view = this;
      console.log("Rendering GroupNegotiateDetailsView...");

      // render the text entry box
      jQuery('#group-negotiate-details-entry-container').html('');
      jQuery('#group-negotiate-details-entry-container').append('<h3><b>'+view.options.term+'</b> in '+view.model.get('author')+'</h3>');
      jQuery('#group-negotiate-details-entry-container').append('<textarea class="details-entry"></textarea>');
      // // if the user has previously defined this
      var termObj = _.findWhere(view.model.get('group_associated_terms'), {"name": view.options.term});
      jQuery('#group-negotiate-details-entry-container .details-entry').text(termObj.explanation);

      // render the myTerm content
      jQuery('#group-negotiate-details-terms-container').html('');
      var termCounter = 0;
      var termArr = [];
      _.each(view.model.get('user_associated_terms'), function(termObj) {
        if (termObj.name === view.options.term) {
          termCounter++;
          termArr.push(termObj);
        }
      });
      jQuery('#group-negotiate-details-terms-container').append('<h3>'+termCounter+' group members have selected this term</h3>');
      _.each(termArr, function(termObj, index) {
        var el = '';
        if (index%2 === 0) {
          el += '<div class="term-details" style="float:left">';
        } else {
          el += '<div class="term-details" style="float:right">';
        }
        el += '<div><b>'+termObj.author+' - '+termObj.date+':</b></div>';
        el += '<div>'+termObj.explanation+'</div>';
        el += '</div>';
        jQuery('#group-negotiate-details-terms-container').append(el);
      });

      view.checkForAllowedToPublish();
    }
  });






  /***********************************************************
   ***********************************************************
   ********************** REPORT VIEW ************************
   ***********************************************************
   ***********************************************************/


  app.View.ReportView = Backbone.View.extend({
    initialize: function() {
      console.log('Initializing ReportView...');

      app.reportBar = new ProgressBar.Line('#report-my-progress-bar',
        {
          easing: 'easeInOut',
          color: app.hexDarkPurple,
          trailColor: app.hexLightGrey,
          strokeWidth: 3,
          svgStyle: app.progressBarStyleTask
        });
    },

    events: {
      // general functionality
      'click #pdf-modal-btn'           : 'openPdfModal',
      'click #report-step-forward-btn' : 'stepForward',
      'click #report-step-back-btn'    : 'stepBack',
      'keyup textarea'                 : 'checkForAllowedToProceed',
      // unique unit-specific functionality
      'click .unit3-view-sequence-btn' : 'unit3ViewSequence',
      'click .unit3-check-answer'      : 'unit3checkAnswer'
    },

    openPdfModal: function() {
      var view = this;

      var objEl = '<object id="report-pdf-content" type="application/pdf" data="'+view.model.get('pdf')+'?#zoom=60&scrollbar=0&toolbar=0&navpanes=0"><p>PDF cannot be displayed</p></object>';
      jQuery('#pdf-modal .modal-body').html(objEl);

      jQuery('#pdf-modal').modal({keyboard: true, backdrop: true});
    },

    stepForward: function() {
      var view = this;

      view.updateReport();
      view.submitBackups();

      // if we're not at the end of the report
      if (app.currentReportPage < view.model.get('parts').length) {
        app.currentReportPage++;
        $('html,body').scrollTop(0);
        view.render();
      } else {
        jQuery().toastmessage('showSuccessToast', "Congratulations! Your group has completed this section of the unit review.");
        jQuery('#report-screen').addClass('hidden');
        jQuery('#home-screen').removeClass('hidden');
      }
    },

    stepBack: function() {
      var view = this;

      view.updateReport();

      app.currentReportPage--;
      $('html,body').scrollTop(0);
      view.render();
    },

    checkForAllowedToProceed: function() {
      var view = this;

      jQuery('#report-step-forward-btn').removeClass('disabled');
      jQuery('#report-step-forward-btn').css({'background': app.hexLightBlack});

      // TODO: revert me
      jQuery('#report-content-container textarea').each(function(index, el) {
        if (jQuery(el).val() === "") {
          jQuery('#report-step-forward-btn').addClass('disabled');
        }
      });

      // for the unit 3 check answer screen
      if (jQuery('#report-content-container button').hasClass('unit3-check-answer')) {
        view.unit3CheckForAllowedToProceed();
      }
    },

    updateReport: function() {
      var view = this;
      var inputs = [];
      jQuery('#report-content-container textarea').each(function(index, el) {
        // should the entries should be keyed to something? Use objects instead? Depends on output
        inputs.push(jQuery(el).val());
      });
      view.model.setEntries(app.currentReportPage, inputs);
      view.model.save();
    },

    submitBackups: function() {
      var contentArr = [];
      jQuery('#report-content-container textarea').each(function(index, el) {
        contentArr.push(jQuery(el).val())
      });
      if (contentArr.length > 0) {
        var sub = new Model.Submission();
        sub.set('group_colour', app.getMyGroup(app.username, "review3").get('colour'));
        sub.set('lesson', 'review3');
        sub.set('part_number', app.currentReportPage);
        sub.set('user', app.username);
        sub.set('content', contentArr);
        sub.save();
      }
    },

    render: function() {
      var view = this;
      console.log("Rendering ReportView...");

      jQuery('.report-progress-bar-container .icon').attr('src', 'img/'+app.getMyGroup(app.username, "review3").get('colour')+'-team.png');

      jQuery('#report-content-container').html('');
      // create the html
      jQuery('#report-content-container').append(view.model.getPart(app.currentReportPage).html);
      // add the text entries
      jQuery('#report-content-container textarea').each(function(index, el) {
        if (view.model.getPart(app.currentReportPage).entries) {
          jQuery(el).val(view.model.getPart(app.currentReportPage).entries[index]);
        }
      });

      view.checkForAllowedToProceed();

      if (app.currentReportPage === 1) {
        jQuery('#report-step-back-btn').addClass('disabled');
      } else {
        jQuery('#report-step-back-btn').removeClass('disabled');
        jQuery('#report-step-back-btn').css({'background': app.hexLightBlack});
      }

      jQuery('#report-screen .my-progress-percent').text(app.getReportCompletionPercent(view.model.get('lesson'), view.model.get('group_colour')));
      app.reportBar.animate(app.getReportCompletionPercent(view.model.get('lesson'), view.model.get('group_colour')) / 100);
    },


    // UNIT SPECIFIC FUNCTIONALITY
    unit3CheckForAllowedToProceed: function() {
      jQuery('#report-step-forward-btn').removeClass('disabled');
      jQuery('#report-step-forward-btn').css({'background': app.hexLightBlack});

      if (jQuery('.unit3-correct1').hasClass('hidden') || jQuery('.unit3-correct2').hasClass('hidden') || jQuery('.unit3-correct3').hasClass('hidden')) {
        jQuery('#report-step-forward-btn').addClass('disabled');
      }
    },

    unit3ViewSequence: function() {
      jQuery('#view-sequence-modal').modal({keyboard: true, backdrop: true});
    },

    unit3checkAnswer: function(ev) {
      var view = this;

      var num = jQuery(ev.target).data('answer');
      // ignoring whitespace and cap'd letters
      if (jQuery('.unit3-answer'+num).text().toUpperCase().replace(/ /g,'') === jQuery('.unit3-entry'+num).val().toUpperCase().replace(/ /g,'')) {
        jQuery('.unit3-correct'+num).removeClass('hidden');
      } else {
        jQuery('.unit3-correct'+num).addClass('hidden');
        jQuery().toastmessage('showErrorToast', "Sorry, that is incorrect. Please check each character in your response carefully and try again.");
      }

      view.unit3CheckForAllowedToProceed();
    }
  });



  /***********************************************************
   ***********************************************************
   ******************* FINAL REPORT VIEW *********************
   ***********************************************************
   ***********************************************************/


  app.View.FinalReportView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing FinalReportView...');

      jQuery('#final-report-my-team').text('TEAM '+app.getMyGroup(app.username, "review4").get(
        'colour'));

      var teams = Skeletor.Model.awake.groups.where({"lesson": "review3", "kind": "present"});
      var teamNames = '';
      _.each(teams, function(team) {
        var name = team.get('colour');
        name = name[0].toUpperCase() + name.slice(1);
        teamNames += name;
        teamNames += ' Team, ';
      });
      teamNames = teamNames.slice(0,-2);

      var el = '<h2>Introduction</h2><p>So far ';
      el += teams.length;
      el += ' different research teams (the ';
      el += teamNames;
      el += `) have been working on reviewing Dr. Sutherland's grant proposal to the Niño-Soto Foundation (NSF). Today, you will be working in new groups containing at least one representative from each of the other teams. Your task is to discuss several of the items contained in your team's report, with the aim of arriving at the best possible response to deliver to billionaire Niño-Soto.</p>
        <p>Other members of your research team will be discussing different items contained in your team's report. The outcome of these negotiations will be a whole-class report containing the <b>best versions</b> of each answer to submit to the NSF. Each of your answers will be indexed to the content you have learned and contributed to the knowledge base in CK Biology throughout the Molecular Genetics unit.`;

      jQuery('#final-report-content-container').html(el);

      // hide this for the intro screen
      jQuery('#final-report-terms-explanation-pane').addClass('hidden');

      view.setProceed(true);
    },

    events: {
      'click #final-report-step-forward-btn' : 'stepForward',
      'keyup textarea'                       : 'checkForAllowedToProceed',
      'mouseover .multiselect-container li'  : 'showTermPopover',
      // unique unit-specific functionality
      'click .unit3-view-sequence-btn'       : 'unit3ViewSequence',
    },

    stepForward: function() {
      var view = this;

      view.updateReport();
      view.submitBackups();
      view.setNextAvailablePart();

      if (app.finalReportPart) {
        view.setProceed(false);
        view.render();
      } else {
         jQuery('#final-report-my-team').html('');
         jQuery('#final-report-content-container').html('');
         jQuery('#final-report-terms-terms-container').html('');
         jQuery('#final-report-terms-explanation-pane').addClass('hidden');
         jQuery('#final-report-terms-selected-container').html('');
         //jQuery('#final-report-step-forward-btn').addClass('hidden');

         jQuery('#final-report-content-container').html('<h1>Thank you for completing your submission!</h1><p>Please press "Final Report" above to view the final submission to the NSF');
       }
    },

    checkForAllowedToProceed: function() {
      var view = this;

      jQuery('#final-report-step-forward-btn').removeClass('disabled');
      jQuery('#final-report-step-forward-btn').css({'background': app.hexLightBlack});

      jQuery('#final-report-content-container textarea').each(function(index, el) {
        if (jQuery(el).val() === "") {
          view.setProceed(false);
        }
      });
    },

    setProceed: function(permitted) {
      if (permitted) {
        jQuery('#final-report-step-forward-btn').removeClass('disabled');
        jQuery('#final-report-step-forward-btn').css({'background': app.hexLightBlack});
      } else {
        jQuery('#final-report-step-forward-btn').addClass('disabled');

      }
    },

    updateReport: function() {
      var view = this;
      var inputs = [];
      var tagsArr = [];

      // text entries
      jQuery('#final-report-content-container textarea').each(function(index, el) {
        inputs.push(jQuery(el).val());
      });
      // tags
      jQuery('#final-report-screen .terms-container').each(function(index, el) {
        jQuery(el).children().each(function(index, child) {
          tagsArr.push(jQuery(child).text());
        });
      });
      if (inputs.length > 0) {
        var partsArr = view.model.get('parts');
        partsArr[app.finalReportPart.number-1].entries = inputs;
        partsArr[app.finalReportPart.number-1].tags = tagsArr;
        partsArr[app.finalReportPart.number-1].complete = true;
        view.model.set('parts', partsArr);
        view.model.save();
      }
    },

    submitBackups: function() {
      var contentArr = [];
      jQuery('#final-report-content-container textarea').each(function(index, el) {
        contentArr.push(jQuery(el).val())
      });
      if (contentArr.length > 0) {
        var sub = new Model.Submission();
        sub.set('group_colour', app.getMyGroup(app.username, "review4").get('colour'));
        sub.set('lesson', 'review4');
        sub.set('part_number', app.finalReportPart.number);
        sub.set('user', app.username);
        sub.set('content', contentArr);
        sub.save();
      }
    },

    setNextAvailablePart: function() {
      var view = this;

      var nextPart = {};
      var parts = view.model.get('parts');

      // first, check if there is a part assigned to this group that is uncompleted
      nextPart = _.findWhere(parts, {"kind": "write", "complete": false, "assigned": app.getMyGroup(app.username, "review4").get('colour')});

      // if no, then get first unassigned part
      if (!nextPart) {
        nextPart = _.findWhere(parts, {"kind": "write", "assigned": false});
        // set it to assigned if it exists (if doesn't exist, back to home screen in nextStep)
        if (nextPart) {
          nextPart.assigned = app.getMyGroup(app.username, "review4").get('colour');
          view.model.set('parts', parts);
          view.model.save();
        }
      }

      app.finalReportPart = nextPart;
    },

    showTermPopover: function(ev) {
      // if we're mousing over the right area
      if (jQuery(ev.target).find('input').val()) {
        jQuery('#final-report-terms-explanation-pane').html('');
        app.buildTermView('#final-report-terms-explanation-pane', jQuery(ev.target).find('input').val());
      }
    },

    // UNIT 3 SPECIFIC
    unit3ViewSequence: function() {
      jQuery('#view-sequence-modal').modal({keyboard: true, backdrop: true});
    },

    renderTerms: function(containerNum, values) {
      var container = jQuery('[data-term-container="'+containerNum+'"]');
      jQuery(container).html('');
      _.each(values, function(value) {
        jQuery(container).append('<div>'+value+'</div>');
      });
    },

    renderDropdowns: function() {
      var view = this;

      jQuery('#final-report-terms-explanation-pane').html('');
      jQuery('#final-report-terms-terms-container').html('');
      jQuery('#final-report-terms-selected-container').html('');

      jQuery('#final-report-terms-explanation-pane').removeClass('hidden');

      jQuery('#final-report-terms-terms-container').append("<h2>Tag any terms or concepts that you learned throughout the unit that are relevant to answering this question</h2>");
      // set up the dropdown types by eaching over the lessons
      _.each(Skeletor.Model.awake.lessons.where({"kind": "homework"}), function(lesson) {
        var el = '<select id="final-report-terms-dropdown-'+lesson.get('number')+'" class="lesson-dropdown" multiple="multiple"></select>';
        jQuery('#final-report-terms-terms-container').append(el);
        jQuery('#final-report-terms-dropdown-'+lesson.get('number')).multiselect({
          nonSelectedText: lesson.get('title'),
          onChange: function(option, checked, select) {
            view.renderTerms(lesson.get('number'), jQuery('#final-report-terms-dropdown-'+lesson.get('number')).val());
          }
        });

        // set up the containers that this terms will be shown in
        jQuery('#final-report-terms-selected-container').append('<div class="terms-container" data-term-container="'+lesson.get('number')+'"></div>');
      });

      // each over the terms and add to dropdown based on term.get('lesson')
      Skeletor.Model.awake.terms.comparator = function(model) {
        return model.get('name').toLowerCase();
      };
      Skeletor.Model.awake.terms.sort();
      // add terms to dropdowns
      Skeletor.Model.awake.terms.each(function(term) {
        var name = term.get('name');
        // add the option to the dropdown
        jQuery('#final-report-terms-dropdown-'+term.get('lesson')).append(new Option(name, name));
      });

      // needs a rebuild to show all the terms
      jQuery('.lesson-dropdown').each(function() {
        jQuery(this).multiselect('rebuild');
      });
    },

    render: function() {
      var view = this;
      console.log("Rendering FinalReportView...");

      jQuery('#final-report-my-team').text('TEAM '+app.getMyGroup(app.username, "review4").get(
        'colour'));

      jQuery('#final-report-content-container').html('');
      // create the html
      jQuery('#final-report-content-container').append(app.finalReportPart.html);
      // remove all text areas
      jQuery('#final-report-content-container textarea').before("<p>Using the ideas in each of the teams responses below, decide up on the <b>best response</b> to the above question and enter it in the text box below</p>");

      var otherReportsEl = '<h2>Group Report Responses:</h2>';
      _.each(Skeletor.Model.awake.reports.where({"lesson":"review3"}), function(report) {
        otherReportsEl += '<p><b>' + report.get('group_colour').charAt(0).toUpperCase() + report.get('group_colour').slice(1) + ' Team\'s Response</b></p>';
        // the array of all of the entered text for this report and this section
        var entriesToAppend = report.get('parts')[app.finalReportPart.number - 1].entries;
        _.each(entriesToAppend, function(entry) {
          otherReportsEl += '<p>';
          otherReportsEl += entry;
          otherReportsEl += '</p>';
        });
      });
      jQuery('#final-report-content-container').append(otherReportsEl);

      // UNIT 3 SPECIFIC STUFF
      jQuery('.unit3-check-answer').addClass('hidden');

      view.renderDropdowns();

      view.checkForAllowedToProceed();
    }
  });




  /***********************************************************
   ***********************************************************
   *************** FINAL REPORT DISPLAY VIEW *****************
   ***********************************************************
   ***********************************************************/

  app.View.FinalReportDisplayView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      console.log('Initializing FinalReportDisplayView...');

      view.model.on('change', function () {
        view.render();
      });
    },

    events: {
      'click img' : 'openImgModal'
    },

    openImgModal: function(ev) {
      var view = this;
      var url = jQuery(ev.target).attr('src');
      jQuery('#final-report-display-modal .photo-content').attr('src', url);
      jQuery('#final-report-display-modal').modal({keyboard: true, backdrop: true});
    },

    render: function () {
      var view = this;
      console.log("Rendering FinalReportDisplayView...");

      jQuery('#final-report-display-container').html('');
      var reportEl = '<h1>Research Proposal Review Report to NSF</h1>';
      _.each(view.model.get('parts'), function(part) {
        // only add text chunks for things the students have written (not intro stuff)
        if (part.kind === 'write') {

          // add the part title
          reportEl += '<p><h2>' + part.name + '</h2>';

          // add a thumbnail if it exists
          if (part.thumbnail.length > 0) {
            reportEl += '<img class="thumb" src="'+part.thumbnail+'"/>';
          }
          reportEl += '</p>'

          // add the text entries
          _.each(part.entries, function(entry) {
            reportEl += '<p>' + entry + '</p>';
          })

          // if there are tags, add them
          if (part.tags && part.tags.length > 0) {
            reportEl += '<p><b>Related terms from this unit:</b> ';
            _.each(part.tags, function(tag) {
              reportEl += tag;
              reportEl += ', ';
            });
            reportEl = reportEl.slice(0,-2);
            reportEl += '</p>';
          }
        }
      });

      jQuery('#final-report-display-container').append(reportEl);
    }
  });

  this.Skeletor = Skeletor;
}).call(this);