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

      wall.tagFilters = [];
      wall.balloons = {};
    },

    ready: function () {
      this.trigger('ready');
    },

    registerBalloon: function(term, BalloonView) {
      var wall = this;

      var bv = new BalloonView({
        model: term
      });
      term.wake(Smartboard.config.wakeful.url);

      bv.wall = wall;
      bv.render();

      wall.$el.append(bv.$el);
      term.on('change:pos', function() {
        bv.pos = term.getPos();
      });

      term.on('change:z-index', function() {
        bv.$el.zIndex(term.get('z-index'));
      });

      // NB: Meagan, if terms do not yet have a position,
      // uncomment wall.assignRandomPosition below to create them
      // (then recomment when done)
      if (term.hasPos()) {
         bv.pos = term.getPos();
      } else {
        wall.assignRandomPositionToBalloon(term, bv);
      }

      if (term.has('z-index')) {
        bv.$el.zIndex(term.get('z-index'));
      }

      wall.makeBalloonDraggable(term, bv);
      bv.$el.click(function() {
        wall.moveBalloonToTop(term, bv);
      });

      bv.render();
      term.save();

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
      return view.$el.on('dragstart', function(ev, ui) {
        return _this.moveBalloonToTop(doc, view);
      });
    },

    render: function() {
      var _this = this;
      var balloons = _this.balloons;

      this.width = this.$el.outerWidth();
      this.height = this.$el.outerHeight();

      // clear all of the balloons and readd them based on this lesson. There's probably a cleaner way of doing this...
      jQuery('#wall').html('');
      Skeletor.Model.awake.terms.where({"lesson": Skeletor.Mobile.lesson}).forEach(function(n) {
        _this.registerBalloon(n, Smartboard.View.NoteBalloon, _this.balloons);
      });
      Skeletor.Model.awake.relationships.where({"lesson": Skeletor.Mobile.lesson, "complete": true}).forEach(function(rel) {
        var connector, connectorId, connectorLength, connectorTransform, tag, tagId, tagView, x1, x2, y1, y2;

        var fromTerm = Skeletor.Model.awake.terms.findWhere({"lesson": Skeletor.Mobile.lesson, "name": rel.get('from')});
        var toTerm = Skeletor.Model.awake.terms.findWhere({"lesson": Skeletor.Mobile.lesson, "name": rel.get('to')});

        if (fromTerm && toTerm) {
          var fromBalloon = _this.balloons[fromTerm.id];
          var toBalloon = _this.balloons[toTerm.id];

          connectorId = fromTerm.id + "-" + toTerm.id;
          connector = Skeletor.Smartboard.View.findOrCreate(_this.$el, "#" + connectorId, "<div class='connector "+fromTerm.get('name')+"-" +toTerm.get('name')+"' id='" + connectorId + "'></div>");
          x1 = fromTerm.get('pos')._.left + (fromBalloon.width / 2);
          y1 = fromTerm.get('pos')._.top + (fromBalloon.height / 2);
          x2 = toTerm.get('pos')._.left + (toBalloon.width / 2);
          y2 = toTerm.get('pos')._.top + (toBalloon.height / 2);
          connectorLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          connectorTransform = "rotate(" + (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI) + "deg)";
          connector.css({
            'top': "" + y1 + "px",
            'left': "" + x1 + "px",
            'width': "" + connectorLength + "px",
            '-webkit-transform': connectorTransform,
            '-moz-transform': connectorTransform,
            'transform': connectorTransform,
            'height': '2px',
            'background': '#000',
            'position': 'absolute',
            'transform-origin': '0 100%'
          });
        }
      });
    }
  });

}).call(this);
