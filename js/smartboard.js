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
