(function () {
  "use strict";

  this.Skeletor = this.Skeletor || {};
  this.Skeletor.Smartboard = this.Skeletor.Smartboard || {};

  var Smartboard = this.Skeletor.Smartboard;

  Smartboard.View = Smartboard.View || {};

  Smartboard.View.Balloon = Smartboard.View.Base.extend({
    className: "balloon",

    initialize: function () {
      var balloon = this;

      Object.defineProperty(this, 'pos', {
        get: function() {
          return balloon.$el.position();
        },
        set: function(pos) {
          return balloon.$el.css({
            left: pos.left + 'px',
            top: pos.top + 'px'
          });
        }
      });
      Object.defineProperty(balloon, 'left', {
        get: function() {
          return balloon.pos.left;
        },
        set: function(x) {
          return balloon.$el.css('left', x + 'px');
        }
      });
      Object.defineProperty(balloon, 'top', {
        get: function() {
          return balloon.pos.top;
        },
        set: function(y) {
          return balloon.$el.css('top', y + 'px');
        }
      });
      Object.defineProperty(balloon, 'width', {
        get: function() {
          return balloon.$el.outerWidth(); // TODO: cache
        },
        set: function(w) {
          return balloon.$el.css('width', w + 'px');
        }
      });
      Object.defineProperty(balloon, 'height', {
        get: function() {
          return balloon.$el.outerHeight(); // TODO: cache
        },
        set: function(h) {
          return balloon.$el.css('height', h + 'px');
        }
      });
      Object.defineProperty(balloon, 'right', {
        get: function() {
          return balloon.left + balloon.width;
        },
        set: function(x) {
          return balloon.$el.css('left', (x - balloon.width) + 'px');
        }
      });
      Object.defineProperty(balloon, 'bottom', {
        get: function() {
          return balloon.top + balloon.height;
        },
        set: function(y) {
          return balloon.$el.css('top', (y - balloon.height) + 'px');
        }
      });

      // balloon.model.on('change:complete', function() {
      //   if (balloon.model.get('complete')) {
      //     // setting visibility once the element is complete = true
      //     //balloon.$el.css('visibility', 'visible');
      //     balloon.$el.addClass('ui-draggable-dragging');
      //     // setTimeout(function() {
      //     //   return balloon.$el.removeClass('new');
      //     // }, 1001);
      //     // return balloon.model.on('wakeful:broadcast:received', function() {
      //     //   if (!balloon.$el.hasClass('glow')) {
      //     //     balloon.$el.addClass('glow');
      //     //     // wait for the glow animation to finish before removing the glow class
      //     //     return setTimeout(function() {
      //     //       return balloon.$el.removeClass('glow');
      //     //     }, 400);
      //     //   }
      //     // });
      //   }
      // });

      balloon.model.on('change', function() {
        if (balloon.wall) { // this balloon has been added to the wall
          return balloon.render();
        }
      });

      // balloon.$el.on('drag', function(ev, ui) {
      //   balloon.adjustForPerspective(ui.position);
      // });
    },

    render: function() {
      var balloon = this;

      if (balloon.model.hasPos()) {
        balloon.pos = balloon.model.getPos();
      }
      if (balloon.model.has('z-index')) {
        return balloon.$el.zIndex(balloon.model.get('z-index'));
      }

      // this.adjustForPerspective();
    },

    // this is currently unused
    adjustForPerspective: function (balloonPos) {
      var wallWidth = this.wall.width;
      var wallHeight = this.wall.height;
      var balloonWidth = this.width;
      var balloonHeight = this.height;

      var pos = balloonPos || this.$el.offset();

      var xMid = wallWidth / 2;
      var perspX = ((pos.left + balloonWidth/2) - xMid) / xMid;

      var yMid = wallHeight / 2;
      var perspY = ((pos.top + balloonHeight/2) - yMid) / yMid;

      var shadowY = Math.round(8 * perspY);
      var shadowX = Math.round(8 * perspX);
      console.log(shadowY, shadowX, "rgba(0, 0, 0, 0.1) "+shadowX+"px "+shadowY+"px 4px");
      this.$el.css('box-shadow', "rgba(0, 0, 0, 0.1) "+shadowX+"px "+shadowY+"px 4px");
    }
  });

  Smartboard.View.ContentBalloon = Smartboard.View.Balloon.extend({
    className: "content balloon",

    initialize: function () {
      // call parent's constructor
      Smartboard.View.Balloon.prototype.initialize.apply(this, arguments);

      var balloon = this;
    },

    // events: {
    //   'dblclick': 'toggleOpen'
    // },

    // toggleOpen: function () {
    //   this.$el.toggleClass('opened');
    // },

    render: function () {
      var balloon = this;

      // call parent's render
      Smartboard.View.Balloon.prototype.render.apply(this, arguments);
    },

    //renderConnectors: function() {
      // var balloon = this;

      // var connector, connectorId, connectorLength, connectorTransform, tag, tagId, tagView, x1, x2, y1, y2;

      // if (!balloon.model.has('tags') || _.isEmpty(balloon.model.get('tags')) || !balloon.$el.is(':visible')) {
      //   return;
      // }

      // _.each(balloon.model.get('tags'), function (tag) {
      //   tagId = tag.id.toLowerCase();
      //   tagView = balloon.wall.balloons[tagId];
      //   if (!tagView) {
      //     return;
      //   }
      //   connectorId = balloon.model.id + "-" + tagId;
      //   connector = CK.Smartboard.View.findOrCreate(balloon.wall.$el, "#" + connectorId, "<div class='connector' id='" + connectorId + "'></div>");
      //   x1 = balloon.left + (balloon.width / 2);
      //   y1 = balloon.top + (balloon.height / 2);
      //   x2 = tagView.left + (tagView.width / 2);
      //   y2 = tagView.top + (tagView.height / 2);
      //   connectorLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      //   connectorTransform = "rotate(" + (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI) + "deg)";
      //   connector.css({
      //     'top': "" + y1 + "px",
      //     'left': "" + x1 + "px",
      //     'width': "" + connectorLength + "px",
      //     '-webkit-transform': connectorTransform,
      //     '-moz-transform': connectorTransform,
      //     'transform': connectorTransform
      //   });
      //   connector.addClass("connects-" + balloon.model.id);
      //   connector.addClass("connects-" + tag.id);
      //   connector.addClass("tag-" + tag.id);
      // });
    //}
  });


  Smartboard.View.NoteBalloon = Smartboard.View.ContentBalloon.extend({
    className: "note content balloon",

    events: {
      'dblclick'        : 'toggleOpen',
      'click .edit-btn' : 'editTerm'
    },

    toggleOpen: function () {
      this.$el.toggleClass('opened');
    },

    editTerm: function(ev) {
      // make it editable
      jQuery(ev.target).parent().children('textarea').prop('readonly', false);        // careful here! Clean me up...
    },

    render: function () {
      var balloon = this;

      // call parent's render
      Smartboard.View.Balloon.prototype.render.apply(this, arguments);

      if (balloon.model.get('complete')) {
        balloon.$el.removeClass('unpublished');
      } else {
        balloon.$el.addClass('unpublished');
      }

      var title = balloon.findOrCreate('.title', "<h3 class='title'></h3>");
      var titleText = '';
      if (balloon.model.get('name')) {
        if (balloon.model.get('name').length > 35) {
          titleText = balloon.model.get('name').slice(0, 32) + '...';
        } else {
          titleText = balloon.model.get('name');
        }
      }
      title.text(titleText);

      // add author and created at
      var noteAuthor = balloon.findOrCreate('.author', "<div class='author'></div>");
      // they're getting rendered even if they aren't complete (could switch to check on complete for all these...)
      if (balloon.model.get('submitted_at')) {
        if (balloon.model.get('edited')) {
          noteAuthor.text(balloon.model.get('assigned_to') + " - " + balloon.model.get("submitted_at").toDateString() + ", " + balloon.model.get("submitted_at").toLocaleTimeString() + "*");
        } else {
          noteAuthor.text(balloon.model.get('assigned_to') + " - " + balloon.model.get("submitted_at").toDateString() + ", " + balloon.model.get("submitted_at").toLocaleTimeString());
        }
      } else {
        noteAuthor.text(balloon.model.get('assigned_to'));
      }

      // add content
      var noteBody = balloon.findOrCreate('.body', "<textarea class='body' readonly></textarea>");
      noteBody.text(balloon.model.get('explanation'));

      // add media
      _.each(balloon.model.get('vettings'), function(vet) {
        var noteVettingAuthor = balloon.findOrCreate('.vetting-author', "<div class='vetting-author'></div>");
        noteVettingAuthor.text(vet.author + " - " + vet.date);
        var noteVettingContent = balloon.findOrCreate('.vetting-content', "<div class='vetting-content'></div>");
        noteVettingContent.text(vet.explanation);
      });

      // add media
      var el = "<div class='media-container'>";
      _.each(balloon.model.get('media'), function(url) {
        el += "<span class='media'><img src='"+Skeletor.Mobile.config.pikachu.url+url+"' class='img-responsive'></img></span>"
      });
      el += "</div>";
      balloon.findOrCreate('.media-container', el);

      // add relationships
      var filteredRelationships = Skeletor.Model.awake.relationships.filter(function(rel) {
        return rel.get('complete') && (rel.get('from') === balloon.model.get('name') || rel.get('to') === balloon.model.get('name'));
      });
      _.each(filteredRelationships, function(rel) {
        // corner case where there is no listed 'link' for pre-populated terms
        if (rel.get('link').length > 0) {
          var noteRelationship = balloon.findOrCreate('.relationship', "<div class='relationship'></div>");
          noteRelationship.text(rel.get('from') + " " + rel.get('link') + " " + rel.get('to'));
        }
        // add complete? FIX ME
      });

      // edit button
      if (balloon.model.get('assigned_to') === Skeletor.Mobile.username) {
        var noteEditButton = balloon.findOrCreate('.edit-btn', "<button class='edit-btn fa fa-pencil-square-o'></button>");
      }
      // START HERE - not sure how to proceed from here... could flip to input view (complete -> false, something with contribution array?)
      // or could edit on this screen. Latter seems cleaner in terms of flow, but worse UI.
      // Either way, need to add an 'edited' true/false to the term model
      // also, can't click while locked...

      balloon.$el.addClass('note');
    }
  });
}).call(this);
