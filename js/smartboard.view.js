(function () {
  "use strict";

  this.Skeletor = this.Skeletor || {};
  this.Skeletor.Smartboard = this.Skeletor.Smartboard || {};

  var Smartboard = this.Skeletor.Smartboard;

  Smartboard.View = Smartboard.View || {};

  var View = Smartboard.View;

  View.findOrCreate = function(parent, selector, html) {
    var el = jQuery(parent).find(selector);
    if (el.length > 0) {
      return el;
    }
    el = jQuery(html);
    parent.append(el);
    return el;
  };

  View.Base = Backbone.View.extend({
    findOrCreate: function(selector, html) {
      return View.findOrCreate(this.$el, selector, html);
    }
  });

}).call(this);