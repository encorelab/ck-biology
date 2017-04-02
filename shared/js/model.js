(function() {
  "use strict";

  var Backbone, Skeletor, Drowsy, Wakeful, jQuery, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty;

  if (typeof exports !== "undefined" && exports !== null) {
    jQuery = require("jquery");
    _ = require("underscore");
    Backbone = require("backbone");
    Backbone.$ = jQuery;
    Drowsy = require("backbone.drowsy.encorelab").Drowsy;
    Wakeful = require('backbone.drowsy.encorelab/wakeful').Wakeful;
    Skeletor = {};
    exports.Skeletor = Skeletor;
  } else {
    window.Skeletor = window.Skeletor || {};
    Skeletor = window.Skeletor;
    jQuery = window.$;
    _ = window._;
    Drowsy = window.Drowsy;
    Wakeful = window.Wakeful;
  }

  Skeletor.Model = (function() {
    function Model() {}

    Model.requiredCollections = ['terms', 'relationships', 'articles', 'lessons', 'groups', 'reports', 'submissions', 'conferences'];

    Model.init = function(url, db) {
      var dfrInit,
        _this = this;
      dfrInit = jQuery.Deferred();
      if (!url) {
        throw new Error("Cannot configure model because no DrowsyDromedary URL was given!");
      }
      if (!db) {
        throw new Error("Cannot configure model because no database name was given!");
      }
      this.baseURL = url;
      this.dbURL = "" + url + "/" + db;
      this.server = new Drowsy.Server(url);

      this.checkThatDatabaseExists(db)
      .then(function () {
        _this.db = _this.server.database(db);
        return _this.createNecessaryCollections(_this.requiredCollections);
      })
      .then(function() {
          _this.defineModelClasses();
          dfrInit.resolve();
      });

      return dfrInit.promise();
    };

    Model.checkThatDatabaseExists = function(dbName) {
      var _this = this;
      var dfrCheck = jQuery.Deferred();

      this.server.databases()
      .done(function (dbs) {
        if (_.pluck(dbs, 'name').indexOf(dbName) < 0) {
          throw new Error("Database '"+dbName+"' does not exist in '"+_this.baseURL+"'!");
        }
        dfrCheck.resolve();
      });

      return dfrCheck.promise();
    };

    Model.createNecessaryCollections = function(requiredCollections) {
      var df, dfs,
        _this = this;
      dfs = [];
      df = jQuery.Deferred();

      this.db.collections(function(colls) {
        var col, existingCollections, _i, _len;
        existingCollections = _.pluck(colls, 'name');
        _.each(requiredCollections, function (coll) {
          if (existingCollections.indexOf(coll) < 0) {
            console.log("Creating collection '" + coll + "' under " + Skeletor.Model.dbURL);
            dfs.push(_this.db.createCollection(coll));
          }
        });
      });

      jQuery.when.apply(jQuery, dfs).done(function() {
        return df.resolve();
      });
      return df.promise();
    };

    Model.defineModelClasses = function() {
      // Locking of terms to users, *not* locking the board
      var LockingTrait = {
        lock: function() {
          this.set('locked', Skeletor.Mobile.username);
          // since nested dates are such a pain
          this.set('locked_at', new Date());
        },
        unlock: function() {
          this.set('locked', "");
          this.set('locked_at', "");
        },
        isUnlocked: function() {
          // we allow access after 30 minutes has passed (30 min == 1800000 milliseconds)
          var interval = new Date() - this.get('locked_at');
          if (this.get('locked') === "" || this.get('locked') === Skeletor.Mobile.username || interval > 1800000) {
            return true;
          } else {
            return false;
          }
        }
      };

      /** Multipos Trait **/

      // Allows a balloon to have multiple sets of positions, for different contexts
      var MultiposTrait = {
        getPos: function(context) {
          var ctx = context || "_";
          var positions = this.get('pos') || {};
          // need to clone to ensure that changes aren't unintentionally written back if return value is manipulated
          return _.clone(positions[ctx]);
        },
        setPos: function(pos, context) {
          if (_.isNull(pos.left) || _.isUndefined(pos.left) ||
              _.isNull(pos.top)  || _.isUndefined(pos.top)) {
            console.error("Invalid position for setPos:", pos, context, this);
            throw new Error("Cannot setPos() because the given position is invalid.");
          }
          var ctx = context || "_";
          var positions = this.has('pos') ? _.clone(this.get('pos')) : {};
          positions[ctx] = pos;
          this.set('pos', positions);
          return this;
        },
        hasPos: function(context) {
          var ctx = context || "_";
          return this.has('pos') &&
            !_.isUndefined(this.get('pos')[ctx]);
        }
      };

      var PartsTrait = {
        getPart: function(pageNum) {
          var partObj;
          _.each(this.get('parts'), function(part) {
            if (part.number === pageNum) {
              partObj = part;
            };
          });
          return partObj;
        },
        // inputs is expected to be an array
        setEntries: function(pageNum, inputs) {
          var partsArr = this.get('parts');
          partsArr[pageNum-1].entries = inputs;
          this.set('parts', partsArr);
        }
      };

      this.Term = this.db.Document('terms').extend({
        defaults: {
          'created_at': new Date(),
          'modified_at': new Date()
        }
      })
      .extend(MultiposTrait)
      .extend(LockingTrait);

      this.Terms = this.db.Collection('terms').extend({
        model: Skeletor.Model.Term
      });

      this.Relationship = this.db.Document('relationships').extend({
        defaults: {
          'created_at': new Date(),
          'modified_at': new Date(),
          'complete': false
        }
      });

      this.Relationships = this.db.Collection('relationships').extend({
        model: Skeletor.Model.Relationship
      });

      this.Article = this.db.Document('articles').extend({
        defaults: {
          'created_at': new Date(),
          'modified_at': new Date()
        }
      });

      this.Articles = this.db.Collection('articles').extend({
        model: Skeletor.Model.Article
      });

      this.Lesson = this.db.Document('lessons').extend({
        defaults: {
          'created_at': new Date(),
          'modified_at': new Date()
        }
      });

      this.Lessons = this.db.Collection('lessons').extend({
        model: Skeletor.Model.Lesson
      });

      this.Group = this.db.Document('groups').extend({
        defaults: {
          'created_at': new Date(),
          'modified_at': new Date(),
          'members': []
        }
      });

      this.Groups = this.db.Collection('groups').extend({
        model: Skeletor.Model.Group
      });

      this.Report = this.db.Document('reports').extend({
        defaults: {
          'created_at': new Date(),
          'modified_at': new Date()
        }
      })
      .extend(PartsTrait);

      this.Reports = this.db.Collection('reports').extend({
        model: Skeletor.Model.Report
      });

      this.Submission = this.db.Document('submissions').extend({
        defaults: {
          'created_at': new Date(),
          'modified_at': new Date()
        }
      })

      this.Submissions = this.db.Collection('submissions').extend({
        model: Skeletor.Model.Submission
      });

      this.Conference = this.db.Document('conferences').extend({
        defaults: {
          'created_at': new Date(),
          'modified_at': new Date()
        }
      })

      this.Conferences = this.db.Collection('conferences').extend({
        model: Skeletor.Model.Conference
      });
    };

    Model.wake = function(wakefulUrl) {
      var dfrWake = jQuery.Deferred();
      Wakeful.loadFayeClient(wakefulUrl).then(function () {
        return Model.initWakefulCollections(wakefulUrl);
      }).then(function () {
        dfrWake.resolve();
      });

      return dfrWake.promise();
    };

    Model.initWakefulCollections = function(wakefulUrl) {
      var camelCase, coll, collName, deferreds, _i, _len, _ref;
      deferreds = [];
      camelCase = function(str) {
        return str.replace(/([\-_][a-z]|^[a-z])/g, function($1) {
          return $1.toUpperCase().replace(/[\-_]/, '');
        });
      };
      this.awake = {};
      _.each(this.requiredCollections, function (collName) {
        coll = new Skeletor.Model[camelCase(collName)]();
        coll.wake(wakefulUrl);
        Skeletor.Model.awake[collName] = coll;
        deferreds.push(coll.fetch());
      });
      return jQuery.when.apply(jQuery, deferreds);
    };

    return Model;

  })();

}).call(this);
