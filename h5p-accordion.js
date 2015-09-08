/**
 * Accordion module
 *
 * @param {jQuery} $
 */
H5P.Accordion = (function ($) {
  
  var nextIdPrefix = 0;
  /**
   * Initialize a new Accordion
   * 
   * @class H5P.InteractiveVideo
   * @extends H5P.EventDispatcher
   * @param {Object} params Behavior settings
   * @param {Number} contentId Content identification
   * @param {Object} contentData Object containing task specific content data
   */
  function Accordion(params, contentId, contentData) {
    this.contentId = contentId;
    H5P.EventDispatcher.call(this);

    // Set default behavior.
    this.params = $.extend({}, {
      hTag: "h2",
      panels: []
    }, params);

    this.contentData = contentData;

    this.instances = [];

    for (var i = 0; i < this.params.panels.length; i++) {
      this.instances[i] = H5P.newRunnable(this.params.panels[i].content, contentId);
    }

    this.idPrefix = (nextIdPrefix++) + '-';
  }

  Accordion.prototype = Object.create(H5P.EventDispatcher.prototype);
  Accordion.prototype.constructor = Accordion;

  /**
   * Append field to wrapper.
   * @param {jQuery} container the jQuery object which this module will attach itself to.
   */
  Accordion.prototype.attach = function ($container) {
    $($container)
      .html('')
      .addClass('h5p-accordion')
      .attr({
        'class': 'h5p-accordion',
        'role': 'tablist',
        'multiselectable': true
      });
      
    var self = this;

    for (var i = 0; i < this.params.panels.length; i++) {
      var targetId = 'h5p-panel-content-' + this.idPrefix + i;

      var $h =  $('<' + this.params.hTag + '>', {
        'class': 'h5p-panel-title'
      }).appendTo($container);

      var $a = $('<a>', {
        'href': '#' + targetId,
        'aria-expanded': false,
        'aria-controls': targetId,
        'id': 'h5p-panel-link-' + this.idPrefix + i,
        'html': this.params.panels[i].title
      })
      .click(function () {
        var $clicked = $(this);
        var $clickedPanel = $clicked.parent().next(".h5p-panel-content");

        if (self.$expandedTitle === undefined || !self.$expandedTitle.is($clicked)) {
          self.collapseExpandedPanels();
          self.expandPanel($clicked, $clickedPanel);
        }
        else {
          self.collapsePanel($clicked, $clickedPanel);
        }
        // We're running in an iframe, so we must animate the iframe height
        self.animateResize();
        return false;
      })
      // Append the link to the panel title
      .appendTo($h);

      // Add an icon to the link
      var $icon = $('<span>', {
        'class': 'h5p-expand-icon'
      }).prependTo($a);

      // Add the content section below the title
      var $content = $('<div>', {
        'class': 'h5p-panel-content',
        'aria-labelledby': 'h5p-panel-link-' + this.idPrefix + i,
        'id': targetId,
        'aria-hidden': true,
        'role': 'tabpanel'
      }).appendTo($container);

      // Add the content itself to the content section
      this.instances[i].attach($content);
    }
  };
  
  /**
   * Collapse all expanded panels
   */
  Accordion.prototype.collapseExpandedPanels = function () {
    var self = this;
    if (this.$expandedTitle !== undefined) {
      this.$expandedTitle
        .attr('aria-expanded', false )
        .removeClass('h5p-panel-expanded');
    }
    if (this.$expandedPanel !== undefined) {
      this.$expandedPanel
        .stop(false, true)
        .slideUp(200, function () {
          clearInterval(self.resizing);
          self.trigger('resize');
        })
        .attr('aria-hidden', true);
    }
  };
  
  /**
   * Expand a panel
   * 
   * @param {jQuery} $title The title of the panel that is to be expanded
   * @param {jQuery} $panel The panel that is to be expanded
   */
  Accordion.prototype.expandPanel = function($title, $panel) {
    var self = this;
    $title.attr('aria-expanded', true)
      .addClass('h5p-panel-expanded');
    $panel
      .stop(false, true)
      .slideDown(200, function () {
        clearInterval(self.resizing);
        self.trigger('resize');
      })
      .attr('aria-hidden', false);
    self.$expandedTitle = $title;
    self.$expandedPanel = $panel;
  };
  
  /**
   * Collapse a panel
   * 
   * @param {jQuery} $title The title of the panel that is to be collapsed
   * @param {jQuery} $panel The panel that is to be collapsed
   */
  Accordion.prototype.collapsePanel = function($title, $panel) {
    var self = this;
    $title.attr('aria-expanded', false)
      .removeClass('h5p-panel-expanded');
    $panel
      .stop(false, true)
      .slideUp(200, function () {
        clearInterval(self.resizing);
        self.trigger('resize');
      })
      .attr('aria-hidden', true);
     self.$expandedTitle = self.$expandedPanel = undefined;
  }

  /**
   * Makes sure that the heigt of the iframe gets animated
   */
  Accordion.prototype.animateResize = function () {
    var self = this;
    clearInterval(this.resizing);
    this.resizing = setInterval(function () {
      self.trigger('resize');
    }, 40);
  };

  return Accordion;
})(H5P.jQuery);
