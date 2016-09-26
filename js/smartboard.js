(function () {
  "use strict";

  var smartboard = new this.Skeletor.App();
  var Model = this.Skeletor.Model;


  smartboard.init = function(className) {
    _.extend(this, Backbone.Events);

    smartboard.config = Skeletor.Mobile.config;

    // TODO: Pick run id
    var app = {};
    app.runId = className;
    // TODO: should ask at startup
    var DATABASE = smartboard.config.drowsy.db+'-'+app.runId;

    Skeletor.Model.init(smartboard.config.drowsy.url, DATABASE)
    .then(function () {
      return Skeletor.Model.wake(smartboard.config.wakeful.url);
    }).done(function () {
      smartboard.ready();
    });
  };

  smartboard.ready = function() {
    // RUNSTATE
    // smartboard.runState = Skeletor.getState('RUN');
    // if (!smartboard.runState) {
    //   smartboard.runState = Skeletor.setState('RUN', {
    //     phase: 'brainstorm'
    //   });
    // }
    // smartboard.runState.wake(smartboard.config.wakeful.url);

    // TAGS
    // Works without these. Why do we keep the instance around here in JS?
    // Most of the collections (runState is special) seem to sit in views
    // smartboard.tags = Skeletor.Model.awake.tags;
    // smartboard.tags.wake(smartboard.config.wakeful.url);

    // WALL
    smartboard.wall = new smartboard.View.Wall({
      el: '#wall'
    });

    smartboard.wall.on('ready', function () {
      smartboard.trigger('ready');
    });

    smartboard.wall.ready();
  };

  this.Skeletor.Smartboard = smartboard;

}).call(this);
