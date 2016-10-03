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

    render: function () {
      var balloon = this;

      // call parent's render
      Smartboard.View.Balloon.prototype.render.apply(this, arguments);
    },
  });


  Smartboard.View.NoteBalloon = Smartboard.View.ContentBalloon.extend({
    className: "note content balloon",

    events: {
      'dblclick'                  : 'toggleOpen',
      'click .close-term-btn'     : 'closeTerm',
      'click .open-comment-btn'   : 'openCommentInputBox',
      'click .comment-submit-btn' : 'submitComment',
      'click .comment-cancel-btn' : 'cancelComment'
    },

    toggleOpen: function(ev) {
      if (!jQuery('#wall').children().hasClass('opened')) {
        this.$el.addClass('opened');
      }
    },

    closeTerm: function(ev) {
      if (jQuery(ev.target).parent().children('.comment-container') && jQuery(ev.target).parent().children('.comment-container').children('.comment-input').val().length > 0) {
        jQuery().toastmessage('showErrorToast', "Please cancel or submit your comment before closing...");
      } else {
        jQuery(ev.target).parent().children('.comment-container').removeClass('opened');
        jQuery(ev.target).parent().children('.open-comment-btn').removeClass('hidden');
        this.$el.removeClass('opened');
      }
    },

    openCommentInputBox: function(ev) {
      var lockedTo = this.model.get('locked');
      if (lockedTo === "" || lockedTo === Skeletor.Mobile.username) {
        jQuery(ev.target).parent().children('.comment-container').toggleClass('opened');
        jQuery(ev.target).parent().children('.open-comment-btn').addClass('hidden');
        this.model.set('locked', Skeletor.Mobile.username);
        this.model.save();
      } else {
        jQuery().toastmessage('showErrorToast', lockedTo + " is currently working on this term...");
      }
    },

    submitComment: function(ev) {
      // if condition to check for text length
      if (jQuery(ev.target).parent().children('.comment-input').val().length > 0) {
        // get comments array
        var commentsArr = this.model.get('comments');
        // push this comment to array
        var comment = {};
        comment.explanation = jQuery(ev.target).parent().children('.comment-input').val();
        comment.author = Skeletor.Mobile.username;
        var d = new Date();
        comment.date = d.toDateString() + ", " + d.toLocaleTimeString();
        comment.ip_addr = Skeletor.Mobile.userIP;
        commentsArr.push(comment);
        // set comments array
        this.model.set('comments', commentsArr);

        // append the comment, since calling a full render is overkill (and won't work since findOrCreate)
        // this is sketchy in it's own way, desyncing the view from the model,
        // but better than the mega hack of .remove() in the smartboard.view. I think...
        var appendEl = "<div class='comments'>";
        appendEl += "<div class='comments-author'>" + comment.author + " - " + comment.date + "</div>";
        appendEl += "<div class='comments-content'>" + comment.explanation + "</div>"
        appendEl += "</div>";
        jQuery(ev.target).parent().parent().children('.comments').append(appendEl);
      }

      // close, unlock, save
      jQuery(ev.target).parent().children('.comment-input').val("");
      jQuery(ev.target).parent().parent().children('.comment-container').removeClass('opened');
      jQuery(ev.target).parent().parent().children('.open-comment-btn').removeClass('hidden');
      this.model.set('locked', "");
      this.model.save();
    },

    cancelComment: function(ev) {
      // clear text, close and unlock
      jQuery(ev.target).parent().children('.comment-input').val("");
      jQuery(ev.target).parent().parent().children('.comment-container').removeClass('opened');
      jQuery(ev.target).parent().parent().children('.open-comment-btn').removeClass('hidden');
      this.model.set('locked', "");
      this.model.save();
    },

    render: function() {
      var balloon = this;

      // call parent's render
      Smartboard.View.Balloon.prototype.render.apply(this, arguments);

      if (balloon.model.get('complete')) {
        balloon.$el.removeClass('unpublished');
      } else {
        balloon.$el.addClass('unpublished');
      }

      var conflictFlag = false;
      _.each(balloon.model.get('vettings'), function(vet) {
        if (vet.correct === false) {
          conflictFlag = true;
        }
      });
      if (conflictFlag) {
        balloon.findOrCreate('.conflict-indicator', "<div class='conflict-indicator'></div>");
      }

      var title = balloon.findOrCreate('.close-term-btn', "<button class='close-term-btn fa fa-times'></button>");

      // add title
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
        noteAuthor.text(balloon.model.get('assigned_to') + " - " + balloon.model.get("submitted_at").toDateString() + ", " + balloon.model.get("submitted_at").toLocaleTimeString());
      } else {
        noteAuthor.text(balloon.model.get('assigned_to'));
      }

      // add content
      var noteBody = balloon.findOrCreate('.body', "<div class='body'></div>");
      noteBody.text(balloon.model.get('explanation'));

      // add vetting
      var vetEl = "<div class='vetting'>";
      _.each(balloon.model.get('vettings'), function(vet) {
        vetEl += "<div class='vetting-author'>" + vet.author + " - " + vet.date + "</div>";
        if (vet.correct === true) {
          vetEl += "<div class='vetting-content'>This explanation is complete and correct</div>";
        } else {
          vetEl += "<div class='vetting-content'>"+vet.explanation+"</div>";
        }
      });
      vetEl += "</div>"
      balloon.findOrCreate('.vetting', vetEl)

      // add media
      var mediaEl = "<div class='media-container'>";
      _.each(balloon.model.get('media'), function(url) {
        mediaEl += "<span class='media'><img src='"+Skeletor.Mobile.config.pikachu.url+url+"' class='img-responsive'></img></span>"
      });
      mediaEl += "</div>";
      balloon.findOrCreate('.media-container', mediaEl);

      // add relationships
      var filteredRelationships = Skeletor.Model.awake.relationships.filter(function(rel) {
        return rel.get('lesson') === Skeletor.Mobile.lesson && rel.get('complete') && (rel.get('from') === balloon.model.get('name') || rel.get('to') === balloon.model.get('name'));
      });
      var relEl = "<div class='relationship'>";
      _.each(filteredRelationships, function(rel) {
        // corner case for where there is no listed 'link' for pre-populated terms, we don't want to display the text
        if (rel.get('link').length > 0) {
          relEl += "<div>" + rel.get('from') + " " + rel.get('link') + " " + rel.get('to') + "</div>"
        }
      });
      relEl += "</div>"
      balloon.findOrCreate('.relationship', relEl);

      // all comments
      var comEl = "<div class='comments'>";
      _.each(balloon.model.get('comments'), function(comment) {
        comEl += "<div class='comments-author'>" + comment.author + " - " + comment.date + "</div>";
        comEl += "<div class='comments-content'>" + comment.explanation + "</div>"
      });
      comEl += "</div>";
      balloon.findOrCreate('.comments', comEl);

      // add comments input stuff
      balloon.findOrCreate('.open-comment-btn', "<button class='open-comment-btn fa fa-pencil-square-o'></button>");
      balloon.findOrCreate('.comment-input', "<div class='comment-container'><textarea class='comment-input'></textarea><button class='comment-submit-btn'>Submit</button><button class='comment-cancel-btn'>Cancel</button></div>");

      balloon.$el.addClass('note');
    }
  });
}).call(this);