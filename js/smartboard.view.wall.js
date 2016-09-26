(function () {
  "use strict";

  this.Skeletor = this.Skeletor || {};
  this.Skeletor.Smartboard = this.Skeletor.Smartboard || {};

  var Smartboard = this.Skeletor.Smartboard;

  Smartboard.View = Smartboard.View || {};

  Smartboard.View.Wall = Smartboard.View.Base.extend({
    initialize: function () {
      var wall = this;

      _.bindAll(this);

      //Smartboard.runState.on('change', this.render);

      wall.tagFilters = [];
      wall.balloons = {};

      // Skeletor.Model.awake.terms.on('add', function(n) {
      //   wall.registerBalloon(n, Smartboard.View.NoteBalloon, wall.balloons);
      // });

      // Skeletor.Model.awake.terms.on('destroy', function(n) {
      //   console.warn("I was destroyed", n.id);
      //   // wall.registerBalloon(n, Smartboard.View.NoteBalloon, wall.balloons);
      // });

      // Skeletor.Model.awake.terms.where({"lesson": Skeletor.Mobile.lesson}).forEach(function(n) {
      //   this.registerBalloon(n, Smartboard.View.NoteBalloon, this.balloons);
      // });

      Skeletor.Model.awake.tags.on('add', function(t) {
        wall.registerBalloon(t, Smartboard.View.TagBalloon, wall.balloons);
      });
      Skeletor.Model.awake.tags.each(function(t) {
        wall.registerBalloon(t, Smartboard.View.TagBalloon, wall.balloons);
      });
      Skeletor.Model.awake.tags.each(function(t) {
        wall.balloons[t.id].renderConnectors();
      });
    },

    events: {
      //'click #add-tag-opener': 'toggleTagInputter'
    },

    ready: function () {
      this.render();
      this.trigger('ready');
    },

    // toggleTagInputter: function () {
    //   var wall = this;
    //   var addTagContainer = this.$el.find('#add-tag-container');
    //   addTagContainer.toggleClass('opened');
    //   if (addTagContainer.hasClass('opened')) {
    //     return setTimeout(function() {
    //       return wall.$el.find('#new-tag').focus();
    //     }, 500);
    //   }
    // },

    registerBalloon: function(term, BalloonView) {
      var wall = this;

      var bv = new BalloonView({
        model: term
      });
      term.wake(Smartboard.config.wakeful.url);

      //bv.$el.css('visibility', 'hidden');
      bv.wall = wall; // FIXME: hmmm...
      bv.render();

      wall.$el.append(bv.$el);
      term.on('change:pos', function() {
        bv.pos = term.getPos();
      });

      term.on('change:z-index', function() {
        bv.$el.zIndex(term.get('z-index'));
      });

      // if (term.hasPos()) {
      //   bv.pos = term.getPos();
      // } else {
        wall.assignRandomPositionToBalloon(term, bv);
      //}

      if (term.has('z-index')) {
        bv.$el.zIndex(term.get('z-index'));
      }

      wall.makeBalloonDraggable(term, bv);
      bv.$el.click(function() {
        wall.moveBalloonToTop(term, bv);
      });

      bv.render();
      term.save().done(function() {
        //bv.$el.css('visibility', 'visible');
        // If it isn't term show it and if it is term only show it on publish
        // if ( !(term instanceof Skeletor.Model.Brainstorm) || ((term instanceof Skeletor.Model.Brainstorm) && term.get('published')) ) {
        //     bv.$el.css('visibility', 'visible');
        // } else {
        //   console.log("Invisible man");
        // }

        //WARNING: IMPLICIT AS HELL DAWG
        // we need a condition to determine if the 'term' is a balloon or a tag. For now, saying that if it has an author, it should be a balloon, if not it is a tag
        // if (term.get('author')) {
        //   // only show balloon if published is true
        //   // if it isn't we listen to change:publish in the balloon view
        //   if (term.get('published')) {
        //     bv.$el.css('visibility', 'visible');
        //   }
        // }
        // // this else is to show the Tag balloons
        // else {
        //   bv.$el.css('visibility', 'visible');
        // }

      });

      this.balloons[term.id] = bv;
    },

    assignStaticPositionToBalloon: function(doc, view) {
      doc.setPos({
        left: 0,
        top: 0
      });
      this.moveBalloonToTop(doc, view);
    },

    assignRandomPositionToBalloon: function(doc, view) {
      var left, top, wallHeight, wallWidth;
      // changed from this.$el.width;   very strange - maybe changed backbone api?
      wallWidth = this.$el.width();
      wallHeight = this.$el.height();
      left = Math.random() * (wallWidth - view.width);
      top = Math.random() * (wallHeight - view.height);
      doc.setPos({
        left: left,
        top: top
      });
      this.moveBalloonToTop(doc, view);
    },

    moveBalloonToTop: function(doc, view) {
      var maxZ;
      maxZ = this.maxBalloonZ();
      maxZ++;
      return doc.set('z-index', maxZ);
    },

    maxBalloonZ: function() {
      return _.max(this.$el.find('.balloon').map(function(el) {
        return parseInt(jQuery(this).zIndex(), 10);
      }));
    },

    makeBalloonDraggable: function(doc, view) {
      var _this = this;
      view.$el.draggable({
        distance: 30,
        containment: '#wall'
      }).css('position', 'absolute');
      view.$el.on('dragstop', function(ev, ui) {
        doc.setPos(ui.position);
        // NOTE: MOVING FROM PATCH TO SAVE
        // patch was flipping published to false, so we had to remove it. No idea why. Probably something in the faye library?
        // follow the .patch() below to faye-browser.js: this._socket.onmessage (~line 1827) to see where it happens
        return doc.save(null, { patch: true });
        // And moving back. When we remove the published: false default from the model the issue seems to disappear
        // Does faye somehow trigger the model init??
        // return doc.save();
      });
      view.$el.on('drag', function(ev, ui) {
        if (view.renderConnectors !== null) {
          return view.renderConnectors();
        }
      });
      return view.$el.on('dragstart', function(ev, ui) {
        return _this.moveBalloonToTop(doc, view);
      });
    },

    addTagFilter: function(tag) {
      if (this.tagFilters.indexOf(tag) < 0) {
        this.tagFilters.push(tag);
        return this.renderFiltered();
      }
    },

    removeTagFilter: function(tag) {
      this.tagFilters.splice(this.tagFilters.indexOf(tag), 1);
      return this.renderFiltered();
    },

    renderFiltered: function(tag) {
      var activeIds, maxZ, selector;
      if (this.tagFilters.length === 0) {
        return this.$el.find(".content, .connector").removeClass('blurred');
      } else {
        activeIds = (function() {
          var _i, _len, _ref, _results;
          _ref = this.tagFilters;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            tag = _ref[_i];
            _results.push(tag.id);
          }
          return _results;
        }).call(this);
        selector = ".tag-" + activeIds.join(", .tag-");
        this.$el.find(".content:not(" + selector + ")").addClass('blurred');
        this.$el.find(".connector:not(" + selector + ")").addClass('blurred');
        maxZ = this.maxBalloonZ();
        this.$el.find(".content").filter("" + selector).removeClass('blurred').css('z-index', maxZ + 1);
        return this.$el.find(".connector").filter("" + selector).removeClass('blurred');
      }
    },

    render: function() {
      var elementsToRemove, fadeoutStyle, hideStyle, ig, paused, phase,
        _this = this;

      this.width = this.$el.outerWidth();
      this.height = this.$el.outerHeight();

      phase = Smartboard.runState.get('phase');
      if (phase !== this.$el.data('phase')) {
        this.$el.data('phase', phase);
      }

      // clear all of the balloons and readd them based on this lesson. There's probably a cleaner way of doing this...
      // TODO: confirm this doesn't blow things up - when else does this render get called?
      jQuery('#wall').html('');
      Skeletor.Model.awake.terms.where({"lesson": Skeletor.Mobile.lesson}).forEach(function(n) {
        _this.registerBalloon(n, Smartboard.View.NoteBalloon, _this.balloons);
      });
    }
  });

}).call(this);
