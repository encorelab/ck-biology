/*jshint debug:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, curly:true, browser: true, devel: true, jquery:true, strict:true */
/*global  Backbone, Skeletor, _, jQuery, Rollcall, google, Paho */

(function() {
  "use strict";
  var Skeletor = this.Skeletor || {};
  this.Skeletor.Mobile = this.Skeletor.Mobile || new Skeletor.App();
  var Model = this.Skeletor.Model;
  Skeletor.Model = Model;
  var app = this.Skeletor.Mobile;


  app.config = null;
  app.requiredConfig = {
    drowsy: {
      url: 'string',
      db: 'string',
      username: 'string',
      password: 'string'
    },
    wakeful: {
      url: 'string'
    },
    login_picker:'boolean',
    runs:'object'
  };

  var DATABASE = null;

  app.rollcall = null;
  app.runId = null;
  app.users = null;
  app.username = null;
  app.currentUser = null;
  app.userIP = null;
  app.lesson = null;
  app.contributions = [];
  app.shownContinueFlag = false;          // PUUUUUUKE

  app.homeView = null;
  app.teacherView = null;
  app.definitionView = null;
  app.relationshipView = null;
  app.vettingView = null;
  app.chooseArticleView = null;
  app.attachTermsView = null;
  app.explainTermsView = null;
  app.explainDetailsView = null;

  app.keyCount = 0;
  app.autoSaveTimer = window.setTimeout(function() { }, 10);

  app.state = [];

  app.numVettingTasks = [];


  app.init = function() {
    /* CONFIG */
    app.loadConfig('../config.json');
    app.verifyConfig(app.config, app.requiredConfig);

    // Adding BasicAuth to the XHR header in order to authenticate with drowsy database
    // this is not really big security but a start
    var basicAuthHash = btoa(app.config.drowsy.username + ':' + app.config.drowsy.password);
    Backbone.$.ajaxSetup({
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('Authorization',
          // 'Basic ' + btoa(username + ':' + password));
          'Basic ' + basicAuthHash);
      }
    });

    // hide all rows initially
    app.hideAllContainers();

    app.handleLogin();
  };

  app.handleLogin = function () {
    if (jQuery.url().param('runId') && jQuery.url().param('username')) {
      console.log ("URL parameter correct :)");
      app.runId = jQuery.url().param('runId');
      app.username = jQuery.url().param('username');
    } else {
      // retrieve user name from cookie if possible otherwise ask user to choose name
      app.runId = jQuery.cookie('brainstorm_mobile_runId');
      app.username = jQuery.cookie('brainstorm_mobile_username');
    }

    if (app.username && app.runId) {
      // We have a user in cookies so we show stuff
      console.log('We found user: '+app.username);

      // this needs runId
      setDatabaseAndRollcallCollection();

      // make sure the app.users collection is always filled
      app.rollcall.usersWithTags([app.runId])
      .done(function (usersInRun) {
        console.log(usersInRun);

        if (usersInRun && usersInRun.length > 0) {
          app.users = usersInRun;

          // sort the collection by username
          app.users.comparator = function(model) {
            return model.get('username');
          };
          app.users.sort();

          app.currentUser = app.users.findWhere({username: app.username});

          if (app.currentUser) {
            jQuery('.username-display a').text(app.runId+" - "+app.currentUser.get('display_name'));

            hideLogin();
            showUsername();

            app.setup();
          } else {
            console.log('User '+usersInRun+' not found in run '+app.runId+'. Show login picker!');
            logoutUser();
          }
        } else {
          console.log("Either run is wrong or run has no users. Wrong URL or Cookie? Show login");
          // fill modal dialog with user login buttons
          logoutUser();
        }
      });
    } else {
      console.log('No user or run found so prompt for username and runId');
      hideUsername();
      // fill modal dialog with user login buttons
      if (app.config.login_picker) {
        hideLogin();
        showRunPicker();
      } else {
        showLogin();
        hideUserLoginPicker();
      }
    }

    // click listener that sets username
    jQuery('#login-button').click(function() {
      app.loginUser(jQuery('#username').val());
      // prevent bubbling events that lead to reload
      return false;
    });
  };

  app.setup = function() {
    Skeletor.Model.init(app.config.drowsy.url, DATABASE)
    .then(function () {
      console.log('Model initialized - now waking up');
      return Skeletor.Model.wake(app.config.wakeful.url);
    })
    .then(function() {
      Skeletor.Smartboard.init(app.runId);
    })
    .done(function () {
      ready();
      console.log('Models are awake - now calling ready...');
    });
  };

  var ready = function() {
    pullIPInformation();
    checkDBValidity();
    buildConstants();
    setUpUI();
    setUpClickListeners();
    wireUpViews();
    app.hideAllContainers();
    jQuery('#home-screen').removeClass('hidden');
  };

  var pullIPInformation = function() {
    jQuery.getJSON("https://jsonip.com/?callback=?", function (data) {
      app.userIP = data.ip;
      var ipAddrArr = app.currentUser.get('ip_addrs');
      ipAddrArr.push(app.userIP);
      app.currentUser.set('ip_addrs', _.uniq(ipAddrArr));
      app.currentUser.save();
    });
  };

  var checkDBValidity = function() {
    var validFlag = true;
    var name, type, num;
    // for each lesson
    Skeletor.Model.awake.lessons.each(function(lesson) {
      var lessonNum = lesson.get('number');
      // skipping lesson 1, since that lesson is just for testing...
      if (lessonNum !== 1) {
        // go through all of the terms, check that each user has been assigned to is spelled correctly
        _.each(Skeletor.Model.awake.terms.where({"lesson": lessonNum}), function(term) {
          // if (term.get('assigned_to') === "" || app.users.findWhere({"username": term.get('assigned_to')}) == null) {
          //   validFlag = false;
          //   name = term.get('name');
          //   type = "unassigned";
          //   num = lessonNum;
          // }
          if (term.get('name') === "") {
            validFlag = false;
            name = term.get('name');
            type = "blank";
            num = lessonNum;
          }
          // make sure it exists in the relationships
          if (Skeletor.Model.awake.relationships.findWhere({"lesson": lessonNum, "from": term.get('name')}) == null &&
              Skeletor.Model.awake.relationships.findWhere({"lesson": lessonNum, "to": term.get('name')}) == null) {
            validFlag = false;
            name = term.get('name');
            type = "missing from relationships";
            num = lessonNum;
          }
        });
        // go through all of the relationships, check that each user has been assigned to is spelled correctly
        _.each(Skeletor.Model.awake.relationships.where({"lesson": lessonNum}), function(relationship) {
          if (relationship.get('assigned_to') === "" || app.users.findWhere({"username": relationship.get('assigned_to')}) == null) {
            validFlag = false;
            name = relationship.get('from');
            type = "unassigned";
            num = lessonNum;
          }
          if (relationship.get('from') === "" || relationship.get('to') === "") {
            validFlag = false;
            name = relationship.get('from');
            type = "blank";
            num = lessonNum;
          }
          // make sure it exists in the terms
          if (Skeletor.Model.awake.terms.findWhere({"name": relationship.get('from')}) == null ||
              Skeletor.Model.awake.terms.findWhere({"name": relationship.get('to')}) == null) {
            validFlag = false;
            name = relationship.get('from');
            type = "missing from terms";
            num = lessonNum;
          }
        });
      }
    });

    if (validFlag) {
      console.log('DB validation passed!');
    } else {
      console.error('Did not pass DB validation. ' + name + ' is ' + type + ' in lesson ' + num);
    }
  };

  var buildConstants = function() {
    Skeletor.Model.awake.lessons.each(function(lesson) {
      app.numVettingTasks.push(lesson.get('vetting_tasks'));
    });
  };

  var setUpUI = function() {
    /* MISC */
    jQuery().toastmessage({
      position : 'middle-center'
    });

    jQuery('.brand').text("CK Biology 2016");

    jQuery('#tasks-completed-confirmation').dialog({ autoOpen: false });
  };

  var setUpClickListeners = function () {
    // click listener that logs user out
    jQuery('#logout-user').click(function() {
      logoutUser();
    });

    jQuery('#report-bug-btn').click(function() {
      showBugReporter();
    });

    jQuery('.top-nav-btn').click(function() {
      if (app.username) {
        jQuery('.top-nav-btn').removeClass('hidden');
        jQuery('.top-nav-btn').removeClass('active');     // unmark all nav items
        // if the user is sitting on the confirm screen and hits home
        if (jQuery('#tasks-completed-confirmation').dialog('isOpen') === true) {
          jQuery('#tasks-completed-confirmation').dialog('close');
        }
        if (jQuery(this).hasClass('goto-home-btn')) {
          app.shownContinueFlag = false;
          app.hideAllContainers();
          jQuery('.top-nav-btn').addClass('hidden');
          jQuery('#home-screen').removeClass('hidden');
          app.homeView.render();
        } else if (jQuery(this).hasClass('goto-contribution-btn')) {
          app.hideAllContainers();
          jQuery('#contribution-nav-btn').addClass('active');
          app.determineNextStep();
        } else if (jQuery(this).hasClass('goto-teacher-btn')) {
          app.hideAllContainers();
          jQuery('#teacher-nav-btn').addClass('active');
          jQuery('#teacher-screen').removeClass('hidden');
          app.teacherView.render();
        } else if (jQuery(this).hasClass('goto-knowledge-base-btn')) {
          app.hideAllContainers();
          jQuery('#knowledge-base-nav-btn').addClass('active');
          Skeletor.Smartboard.wall.render();                            // NB: experimental. Heavy load?
          jQuery('#wall').removeClass('hidden');
        } else {
          console.log('ERROR: unknown nav button');
        }
      }
    });
  };

  var wireUpViews = function() {
    /* ======================================================
     * Setting up the Backbone Views to render data
     * coming from Collections and Models.
     * This also takes care of making the nav items clickable,
     * so these can only be called when everything is set up
     * ======================================================
     */

     if (app.homeView === null) {
       app.homeView = new app.View.HomeView({
         el: '#home-screen',
         collection: Skeletor.Model.awake.lessons
       });
     }

    if (app.teacherFlag === false) {
      if (app.definitionView === null) {
        app.definitionView = new app.View.DefinitionView({
          el: '#definition-screen',
          collection: Skeletor.Model.awake.terms
        });
      }

      if (app.vettingView === null) {
        app.vettingView = new app.View.VettingView({
          el: '#vetting-screen',
          collection: Skeletor.Model.awake.terms
        });
      }

      if (app.chooseArticleView === null) {
        app.chooseArticleView = new app.View.ChooseArticleView({
          el: '#choose-article-screen',
          collection: Skeletor.Model.awake.articles
        });
      }
    }
    else {
      if (app.teacherView === null) {
        app.teacherView = new app.View.TeacherView({
          el: '#teacher-screen',
          collection: Skeletor.Mobile.users
        });
      }
    }

    app.homeView.render();
  };


  //*************** HELPER FUNCTIONS ***************//

  app.buildContributionArray = function() {
    app.contributions = [];

    var sortedTerms = Skeletor.Model.awake.terms.clone();
    sortedTerms.comparator = function(model) {
      return model.get('name');
    };
    sortedTerms.sort();

    // get all terms, push those with app.lesson and assigned_to === app.username
    sortedTerms.each(function(term) {
      if (term.get('lesson') === app.lesson && term.get('assigned_to') === app.username && !term.get('complete')) {
        var obj = {};
        obj.kind = 'term';
        obj.content = term;
        app.contributions.push(obj);
      }
    });

    var sortedRelationships = Skeletor.Model.awake.relationships.clone();
    sortedRelationships.comparator = function(model) {
      return model.get('from');
    };
    sortedRelationships.sort();

    // get all relationships with app.lesson and assigned_to === app.username
    sortedRelationships.each(function(relationship) {
      if (relationship.get('lesson') === app.lesson && relationship.get('assigned_to') === app.username && !relationship.get('complete')) {
        var obj = {};
        obj.kind = 'relationship';
        obj.content = relationship;
        app.contributions.push(obj);
      }
    });

    var remainingVettings = getMyTotalVettings(app.lesson) - getMyCompleteVettings(app.username, app.lesson);     // can be negative
    for (var i = 0; i < remainingVettings; i++) {
      var obj = {};
      obj.kind = 'vetting';
      app.contributions.push(obj);
    }
  };

  app.determineNextStep = function() {
    console.log('Determining next step...');

    // if taskType is null, they are at 100%
    var taskType = null;
    if (app.nextContribution()) {
      taskType = app.nextContribution().kind;
    } else {
      taskType = "completed";
    }

    //0. it's complete
    //1. you didn't author that term
    //2. you haven't already vetted that term
    //3. it's in this lesson
    //4. it has the lowest number in terms of 'vetted count'. If tied, first alphabetically
    // we'll need to set a lock on the term so that nobody else can do it, so also
    //5. it is unlocked or locked to this user

    var myVettings = Skeletor.Model.awake.terms.filter(function(term) {
      return term.get('lesson') === app.lesson && term.get('complete') === true && term.get('assigned_to') !== app.username && !_.contains(term.get('vetted_by'), app.username) && term.isUnlocked();
    });

    // To determine the least vetted item:
    // if myVettings.length > 0
    // loop i = 0
    // loop through myVettings
    // if vet.vetted_by.length == i, myVet = vet, break
    // if leastVetted.length > 0 then break
    // else i ++
    var leastVetted = [];
    if (myVettings.length > 0) {
      for (var i = 0; i < app.users.length; i++) {
        _.each(myVettings, function(vet) {
          if (vet.get('vetted_by').length == i) {
            leastVetted.push(vet);
          }
        });
        if (leastVetted.length > 0) {
          break;
        }
      }
    } else {
      console.log('No vettings available for you');
    }

    // check if there's a vet locked to this user, otherwise they get the first in the queue
    var myVet = null;
    _.each(leastVetted, function(vet) {
      if (vet.get('locked') === app.username) {
        myVet = vet;
      }
    });
    if (myVet === null) {
      myVet = _.first(leastVetted);
    }

    app.hideAllContainers();
    if (taskType === "term") {
      jQuery('#definition-screen').removeClass('hidden');
      var definition = app.nextContribution().content;
      app.definitionView.model = definition;
      app.definitionView.model.wake(app.config.wakeful.url);
      app.definitionView.render();

    } else if (taskType === "relationship") {
      jQuery('#relationship-screen').removeClass('hidden');
      var relationship = app.nextContribution().content;
      app.relationshipView.model = relationship;
      app.relationshipView.model.wake(app.config.wakeful.url);
      app.relationshipView.render();

    } else if (taskType === "vetting" && leastVetted.length > 0) {
      jQuery('#vetting-screen').removeClass('hidden');
      app.vettingView.model = myVet;
      app.vettingView.model.wake(app.config.wakeful.url);
      app.vettingView.model.lock();
      app.vettingView.model.save();
      app.vettingView.render();

    } else if (taskType === "vetting" && leastVetted.length <= 0) {
      jQuery().toastmessage('showWarningToast', "There are currently no terms for you to vet. Please return later after the community has provided more definitions");
      jQuery('.top-nav-btn').addClass('hidden');
      jQuery('#home-screen').removeClass('hidden');
      app.homeView.render();

    } else if (taskType === "completed" && app.shownContinueFlag === false) {
      jQuery('#tasks-completed-confirmation').dialog({
        resizable: false,
        height: 'auto',
        width: 'auto',
        modal: true,
        dialogClass: 'no-close',
        autoOpen: true,
        buttons: {
          Yes: function() {
            jQuery(this).dialog('close');
            app.shownContinueFlag = true;
            showNextVetIfPossible(leastVetted, myVet);
          },
          No: function() {
            jQuery(this).dialog('close');
            jQuery('.top-nav-btn').addClass('hidden');
            jQuery('#home-screen').removeClass('hidden');
            app.homeView.render();
          }
        }
      });
    } else if (taskType === "completed" && app.shownContinueFlag === true) {
      showNextVetIfPossible(leastVetted, myVet);
    } else {
      jQuery().toastmessage('showErrorToast', "Something went wrong determining next step...");
    }
  }

  var showNextVetIfPossible = function(leastVetted, myVet) {
    if (leastVetted.length > 0) {
      jQuery('#vetting-screen').removeClass('hidden');
      app.vettingView.model = myVet;
      app.vettingView.model.wake(app.config.wakeful.url);
      app.vettingView.model.lock();
      app.vettingView.model.save();
      app.vettingView.render();
    } else {
      // damn, this is getting gnarly. I think they have finally settled on a flow, so this needs a big refactor
      jQuery('#tasks-completed-confirmation').dialog({
        resizable: false,
        height: 'auto',
        width: 'auto',
        modal: true,
        dialogClass: 'no-close',
        autoOpen: true,
        buttons: {
          Yes: function() {
            jQuery(this).dialog('close');
            app.shownContinueFlag = true;
            if (getMyCompleteVettings(app.username, app.lesson) === getMyAllPossibleVettings(app.lesson)) {
              jQuery().toastmessage('showSuccessToast', "Thank you. You have completed all possible tasks!");
            } else {
              jQuery().toastmessage('showWarningToast', "There are currently no terms for you to vet. Please return later after the community has provided more definitions");
            }
            jQuery('.top-nav-btn').addClass('hidden');
            jQuery('#home-screen').removeClass('hidden');
            app.homeView.render();
          },
          No: function() {
            jQuery(this).dialog('close');
            jQuery('.top-nav-btn').addClass('hidden');
            jQuery('#home-screen').removeClass('hidden');
            app.homeView.render();
          }
        }
      });
    }
  }

  app.nextContribution = function() {
    return _.first(app.contributions);
  };

  app.markAsComplete = function() {
    app.contributions.shift();
    // bit of a hack, required to do the fact that the save() is async and the new model will be updated by wakeful to include the old media contributions
    if (app.contributions[0]) {
      if (app.contributions[0].kind === "term") {
        app.contributions[0].content.set('media', []);
      }
    }
  }

  app.getMyContributionPercent = function(username, lessonNum, noMax) {
    var myTotalTerms = Skeletor.Model.awake.terms.where({lesson: lessonNum, assigned_to: username}).length;
    var myCompleteTerms = Skeletor.Model.awake.terms.where({lesson: lessonNum, assigned_to: username, complete: true}).length;

    var myTotalRelationships = Skeletor.Model.awake.relationships.where({lesson: lessonNum, assigned_to: username}).length;
    var myCompleteRelationships = Skeletor.Model.awake.relationships.where({lesson: lessonNum, assigned_to: username, complete: true}).length;

    //console.log('My Totals: ' + myTotalTerms + ', ' + myTotalRelationships + ', ' + getMyTotalVettings(lessonNum));
    //console.log('My Completes: ' + myCompleteTerms + ', ' + myCompleteRelationships + ', ' + getMyCompleteVettings(username, lessonNum));

    var percent = (myCompleteTerms + myCompleteRelationships + getMyCompleteVettings(username, lessonNum)) / (myTotalTerms + myTotalRelationships + getMyTotalVettings(lessonNum)) * 100;

    if (!noMax && percent > 100) {
      percent = 100;
    } else if (Number.isNaN(Number(percent))) {
      // for those collections that have not yet been populated
      percent = 0;
    }
    return Math.round(percent);
  };

  app.getCommunityContributionPercent = function(lessonNum) {
    var totalStudents = app.users.where({user_role: "student"}).length;

    var totalTerms = Skeletor.Model.awake.terms.where({lesson: lessonNum}).length;
    var completeTerms = Skeletor.Model.awake.terms.where({lesson: lessonNum, complete: true}).length;

    var totalRelationships = Skeletor.Model.awake.relationships.filter(function(rel) {
      return rel.get('lesson') === lessonNum && rel.get('link').length > 0;
    }).length;
    var completeRelationships = Skeletor.Model.awake.relationships.filter(function(rel) {
      return rel.get('lesson') === lessonNum && rel.get('complete') === true && rel.get('link').length > 0;
    }).length;

    var totalVettings = totalTerms * app.numVettingTasks[lessonNum - 1];

    //console.log('Community Totals: ' + totalTerms + ', ' + totalRelationships + ', ' + totalVettings);
    //console.log('Community Completes: ' + completeTerms + ', ' + completeRelationships + ', ' + getCommunityCompleteVettings(lessonNum));

    var percent = (completeTerms + completeRelationships + getCommunityCompleteVettings(lessonNum)) / (totalTerms + totalRelationships + totalVettings) * 100;

    if (percent > 100) {
      percent = 100;
    } else if (Number.isNaN(Number(percent))) {
      // for those collections that have not yet been populated
      percent = 0;
    }
    return Math.round(percent);
  };

  var getMyTotalVettings = function(lessonNum) {
    var totalTerms = Skeletor.Model.awake.terms.where({lesson: lessonNum}).length;
    var totalStudents = app.users.where({user_role: "student"}).length;
    return Math.ceil(totalTerms * app.numVettingTasks[lessonNum - 1] / totalStudents);        // round up
  };

  var getMyCompleteVettings = function(username, lessonNum) {
    var myCompletedVettings = _.filter(Skeletor.Model.awake.terms.where({lesson: lessonNum}), function(term) {
      return _.contains(term.get('vetted_by'), username);
    });
    return myCompletedVettings.length;
  };

  var getMyAllPossibleVettings = function(lessonNum) {
    var allPossibleVets = _.filter(Skeletor.Model.awake.terms.where({lesson: lessonNum}), function(term) {
      return term.get('assigned_to') !== app.username
    });
    return allPossibleVets.length
  };

  var getCommunityCompleteVettings = function(lessonNum) {
    // var completedVettings = _.filter(Skeletor.Model.awake.terms.where({lesson: lessonNum}), function(term) {
    //   return term.get('vetted_by').length >= app.numVettingTasks[lessonNum - 1]
    // });
    // return completedVettings.length;
    var count = 0;
    _.each(Skeletor.Model.awake.terms.where({lesson: lessonNum}), function(term) {
      count += term.get('vetted_by').length;
    });
    return count;
  };

  app.getMyField = function(username) {
    var myArticle = Skeletor.Model.awake.articles.filter(function(article) {
      return _.contains(article.get('users'), app.username)
    });

    if (_.first(myArticle)) {
      return _.first(myArticle).get('field');
    } else {
      return null;
    }
  };

  app.parseExtension = function(url) {
    return url.substr(url.lastIndexOf('.') + 1).toLowerCase();
  };


  //*************** LOGIN FUNCTIONS ***************//

  app.loginUser = function (username) {
    // retrieve user with given username
    app.rollcall.user(username)
    .done(function (user) {
      if (user) {
        console.log(user.toJSON());

        app.username = user.get('username');
        app.currentUser = app.users.findWhere({username: app.username});

        jQuery.cookie('brainstorm_mobile_username', app.username, { expires: 1, path: '/' });
        jQuery('.username-display a').text(app.runId+" - "+app.username);

        hideLogin();
        hideUserLoginPicker();
        showUsername();

        app.setup();
      } else {
        console.log('User '+username+' not found!');
        if (confirm('User '+username+' not found! Do you want to create the user to continue?')) {
          // Create user and continue!
          console.log('Create user and continue!');
        } else {
          // Do nothing!
          console.log('No user logged in!');
        }
      }
    });
  };

  var logoutUser = function () {
    // unlock all of the user's terms
    _.each(Skeletor.Model.awake.terms.where({"locked":app.username}), function(term) {
      term.unlock();
      term.save();
    });

    jQuery.removeCookie('brainstorm_mobile_username',  { path: '/' });
    jQuery.removeCookie('brainstorm_mobile_runId',  { path: '/' });

    // to make reload not log us in again after logout is called we need to remove URL parameters
    if (window.location.search && window.location.search !== "") {
      var reloadUrl = window.location.origin + window.location.pathname;
      window.location.replace(reloadUrl);
    } else {
      window.location.reload();
    }
    return true;
  };

  var showLogin = function () {
    jQuery('#login-button').removeAttr('disabled');
    jQuery('#username').removeAttr('disabled');
  };

  var hideLogin = function () {
    jQuery('#login-button').attr('disabled','disabled');
    jQuery('#username').attr('disabled','disabled');
  };

  var hideUserLoginPicker = function () {
    // hide modal dialog
    jQuery('#login-picker').modal('hide');
  };

  var showUsername = function () {
    jQuery('.username-display').removeClass('hidden');
  };

  var hideUsername = function() {
    jQuery('.username-display').addClass('hidden');
  };

  var showBugReporter = function() {
    jQuery('#report-bug-modal').modal();
  };

  var showRunPicker = function(runs) {
    jQuery('.login-buttons').html(''); //clear the house
    console.log(app.config.runs);

    // change header
    jQuery('#login-picker .modal-header h3').text("Choose your class and unit");

    _.each(app.config.runs, function(run) {
      var button = jQuery('<button class="btn btn-default login-button">');
      button.val(run);
      button.text(run);
      jQuery('.login-buttons').append(button);
    });

    // register click listeners
    jQuery('.login-button').click(function() {
      app.runId = jQuery(this).val();
      setDatabaseAndRollcallCollection();

      jQuery.cookie('brainstorm_mobile_runId', app.runId, { expires: 1, path: '/' });
      // jQuery('#login-picker').modal("hide");
      showUserLoginPicker(app.runId);
    });

    // show modal dialog
    jQuery('#login-picker').modal({keyboard: false, backdrop: 'static'});
  };

  var showUserLoginPicker = function(runId) {
    // change header
    jQuery('#login-picker .modal-header h3').text('Please login with your username');

    // retrieve all users that have runId
    // TODO: now that the users collection is within a run... why are the users being tagged with a run? Superfluous...
    app.rollcall.usersWithTags([runId])
    .done(function (availableUsers) {
      jQuery('.login-buttons').html(''); //clear the house
      app.users = availableUsers;

      if (app.users.length > 0) {
        // sort the collection by username
        app.users.comparator = function(model) {
          return model.get('display_name');
        };
        app.users.sort();

        // yucky - TODO: clean me up
        if (app.teacherFlag) {
          app.users.each(function(user) {
            if (user.get('user_role') === 'teacher') {
              var button = jQuery('<button class="btn btn-default login-button">');
              button.val(user.get('username'));
              button.text(user.get('display_name'));
              jQuery('.login-buttons').append(button);
            }
          });
        } else {
          app.users.each(function(user) {
            if (user.get('user_role') !== 'teacher') {
              var button = jQuery('<button class="btn btn-default login-button">');
              button.val(user.get('username'));
              button.text(user.get('display_name'));
              jQuery('.login-buttons').append(button);
            }
          });
        }

        // register click listeners
        jQuery('.login-button').click(function() {
          var clickedUserName = jQuery(this).val();
          app.loginUser(clickedUserName);
        });
      } else {
        console.warn('Users collection is empty! Check database: '+DATABASE);
      }
    });
  };

  var setDatabaseAndRollcallCollection = function() {
    // set both of these globals. This function called from multiple places
    DATABASE = app.config.drowsy.db+'-'+app.runId;
    if (app.rollcall === null) {
      app.rollcall = new Rollcall(app.config.drowsy.url, DATABASE);
    }
  };

  app.hideAllContainers = function() {
    jQuery('.container-fluid').each(function (){
      jQuery(this).addClass('hidden');
    });
  };

  app.autoSave = function(model, inputKey, inputValue, instantSave, nested) {
    app.keyCount++;
    if (instantSave || app.keyCount > 20) {
      console.log('Autosaved...');
      model.set(inputKey, inputValue);
      model.set('modified_at', new Date());
      model.save(null, {silent:true});
      app.keyCount = 0;
    }
  };

  app.clearAutoSaveTimer = function () {
    if (app.autoSaveTimer) {
      window.clearTimeout(app.autoSaveTimer);
    }
  };

  /**
    Function that is called on each keypress on username input field (in a form).
    If the 'return' key is pressed we call loginUser with the value of the input field.
    To avoid further bubbling, form submission and reload of page we have to return false.
    See also: http://stackoverflow.com/questions/905222/enter-key-press-event-in-javascript
  **/
  app.interceptKeypress = function(e) {
    if (e.which === 13 || e.keyCode === 13) {
      app.loginUser(jQuery('#username').val());
      return false;
    }
  };

  this.Skeletor = Skeletor;

}).call(this);
