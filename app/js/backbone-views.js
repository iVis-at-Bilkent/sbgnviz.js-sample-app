var jQuery = $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var appUtilities = require('./app-utilities');
var setFileContent = appUtilities.setFileContent.bind(appUtilities);

/**
 * Backbone view for the BioGene information.
 */
var BioGeneView = Backbone.View.extend({
  /*
   * Copyright 2013 Memorial-Sloan Kettering Cancer Center.
   *
   * This file is part of PCViz.
   *
   * PCViz is free software: you can redistribute it and/or modify
   * it under the terms of the GNU Lesser General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * PCViz is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   * GNU Lesser General Public License for more details.
   *
   * You should have received a copy of the GNU Lesser General Public License
   * along with PCViz. If not, see <http://www.gnu.org/licenses/>.
   */

  render: function () {
    // pass variables in using Underscore.js template
    var variables = {
      geneDescription: this.model.geneDescription,
      geneAliases: this.parseDelimitedInfo(this.model.geneAliases, ":", ",", null),
      geneDesignations: this.parseDelimitedInfo(this.model.geneDesignations, ":", ",", null),
      geneLocation: this.model.geneLocation,
      geneMim: this.model.geneMim,
      geneId: this.model.geneId,
      geneUniprotId: this.extractFirstUniprotId(this.model.geneUniprotMapping),
      geneUniprotLinks: this.generateUniprotLinks(this.model.geneUniprotMapping),
      geneSummary: this.model.geneSummary
    };

    // compile the template using underscore
    var template = _.template($("#biogene-template").html());
    template = template(variables);

    // load the compiled HTML into the Backbone "el"
    this.$el.html(template);

    // format after loading
    this.format(this.model);

    return this;
  },
  format: function ()
  {
    // hide rows with undefined data
    if (this.model.geneDescription == undefined)
      this.$el.find(".biogene-description").hide();

    if (this.model.geneAliases == undefined)
      this.$el.find(".biogene-aliases").hide();

    if (this.model.geneDesignations == undefined)
      this.$el.find(".biogene-designations").hide();

    if (this.model.geneChromosome == undefined)
      this.$el.find(".biogene-chromosome").hide();

    if (this.model.geneLocation == undefined)
      this.$el.find(".biogene-location").hide();

    if (this.model.geneMim == undefined)
      this.$el.find(".biogene-mim").hide();

    if (this.model.geneId == undefined)
      this.$el.find(".biogene-id").hide();

    if (this.model.geneUniprotMapping == undefined)
      this.$el.find(".biogene-uniprot-links").hide();

    if (this.model.geneSummary == undefined)
      this.$el.find(".node-details-summary").hide();

    var expanderOpts = {slicePoint: 150,
      expandPrefix: ' ',
      expandText: ' (...)',
      userCollapseText: ' (show less)',
      moreClass: 'expander-read-more',
      lessClass: 'expander-read-less',
      detailClass: 'expander-details',
      // do not use default effects
      // (see https://github.com/kswedberg/jquery-expander/issues/46)
      expandEffect: 'fadeIn',
      collapseEffect: 'fadeOut'};

    $(".biogene-info .expandable").expander(expanderOpts);

    expanderOpts.slicePoint = 2; // show comma and the space
    expanderOpts.widow = 0; // hide everything else in any case
  },
  generateUniprotLinks: function (mapping) {
    var formatter = function (id) {
      return _.template($("#uniprot-link-template").html(), {id: id});
    };

    if (mapping == undefined || mapping == null)
    {
      return "";
    }

    // remove first id (assuming it is already processed)
    if (mapping.indexOf(':') < 0)
    {
      return "";
    }
    else
    {
      mapping = mapping.substring(mapping.indexOf(':') + 1);
      return ', ' + this.parseDelimitedInfo(mapping, ':', ',', formatter);
    }
  },
  extractFirstUniprotId: function (mapping) {
    if (mapping == undefined || mapping == null)
    {
      return "";
    }

    var parts = mapping.split(":");

    if (parts.length > 0)
    {
      return parts[0];
    }

    return "";
  },
  parseDelimitedInfo: function (info, delimiter, separator, formatter) {
    // do not process undefined or null values
    if (info == undefined || info == null)
    {
      return info;
    }

    var text = "";
    var parts = info.split(delimiter);

    if (parts.length > 0)
    {
      if (formatter)
      {
        text = formatter(parts[0]);
      }
      else
      {
        text = parts[0];
      }
    }

    for (var i = 1; i < parts.length; i++)
    {
      text += separator + " ";

      if (formatter)
      {
        text += formatter(parts[i]);
      }
      else
      {
        text += parts[i];
      }
    }

    return text;
  }
});

/**
 * SBGN Layout view for the Sample Application.
 */
var LayoutPropertiesView = Backbone.View.extend({
  initialize: function () {
    var self = this;
    self.copyProperties();

    self.template = _.template($("#layout-settings-template").html());
    self.template = self.template(appUtilities.currentLayoutProperties);
  },
  copyProperties: function () {
    appUtilities.currentLayoutProperties = _.clone(appUtilities.defaultLayoutProperties);
  },
  applyLayout: function (preferences, notUndoable) {

    // access the singleton sbgnviz instance
    var sbgnvizInstance = appUtilities.getSbgnvizInstance();

    if (preferences === undefined) {
      preferences = {};
    }
    var options = $.extend({}, appUtilities.currentLayoutProperties, preferences);
    var verticalPaddingPercent = options.tilingPaddingVertical;
    var horizontalPaddingPercent = options.tilingPaddingHorizontal;
    // In dialog properties we keep tiling padding vertical/horizontal percentadges to be displayed
    // in dialog, in layout options we use a function using these values
    options.tilingPaddingVertical = function () {
      return sbgnvizInstance.calculatePaddings(verticalPaddingPercent);
    };
    options.tilingPaddingHorizontal = function () {
      return sbgnvizInstance.calculatePaddings(horizontalPaddingPercent);
    };
    sbgnvizInstance.performLayout(options, notUndoable);
  },
  render: function () {
    var self = this;

    self.template = _.template($("#layout-settings-template").html());
    self.template = self.template(appUtilities.currentLayoutProperties);
    $(self.el).html(self.template);

    $(self.el).modal('show');

    $(document).off("click", "#save-layout").on("click", "#save-layout", function (evt) {
      appUtilities.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
      appUtilities.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length").value);
      appUtilities.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity").value);
      appUtilities.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor").value);
      appUtilities.currentLayoutProperties.gravity = Number(document.getElementById("gravity").value);
      appUtilities.currentLayoutProperties.numIter = Number(document.getElementById("num-iter").value);
      appUtilities.currentLayoutProperties.tile = document.getElementById("tile").checked;
      appUtilities.currentLayoutProperties.animate = document.getElementById("animate").checked ? 'during' : 'end';
      appUtilities.currentLayoutProperties.randomize = !document.getElementById("incremental").checked;
      appUtilities.currentLayoutProperties.gravityRangeCompound = Number(document.getElementById("gravity-range-compound").value);
      appUtilities.currentLayoutProperties.gravityCompound = Number(document.getElementById("gravity-compound").value);
      appUtilities.currentLayoutProperties.gravityRange = Number(document.getElementById("gravity-range").value);
      appUtilities.currentLayoutProperties.tilingPaddingVertical = Number(document.getElementById("tiling-padding-vertical").value);
      appUtilities.currentLayoutProperties.tilingPaddingHorizontal = Number(document.getElementById("tiling-padding-horizontal").value);
      appUtilities.currentLayoutProperties.initialEnergyOnIncremental = Number(document.getElementById("incremental-cooling-factor").value);
    
      $(self.el).modal('toggle');
    });

    $(document).off("click", "#default-layout").on("click", "#default-layout", function (evt) {
      self.copyProperties();

      self.template = _.template($("#layout-settings-template").html());
      self.template = self.template(appUtilities.currentLayoutProperties);
      $(self.el).html(self.template);
    });

    return this;
  }
});

/**
 * SBGN Properties view for the Sample Application.
 */
var GeneralPropertiesView = Backbone.View.extend({
  initialize: function () {
    var self = this;
    self.copyProperties();
    self.template = _.template($("#general-properties-template").html());
    self.template = self.template(appUtilities.currentGeneralProperties);
  },
  copyProperties: function () {
    appUtilities.currentGeneralProperties = _.clone(appUtilities.defaultGeneralProperties);
  },
  render: function () {

    // access the singleton sbgnviz instance
    var sbgnvizInstance = appUtilities.getSbgnvizInstance();

    // access the singleton cy instance
    var cy = appUtilities.getCy();

    var self = this;
    self.template = _.template($("#general-properties-template").html());
    self.template = self.template(appUtilities.currentGeneralProperties);
    $(self.el).html(self.template);

    $(self.el).modal('show');

    $(document).off("click", "#save-sbgn").on("click", "#save-sbgn", function (evt) {
      appUtilities.currentGeneralProperties.compoundPadding = Number(document.getElementById("compound-padding").value);
      appUtilities.currentGeneralProperties.dynamicLabelSize = $('select[name="dynamic-label-size"] option:selected').val();
      appUtilities.currentGeneralProperties.fitLabelsToNodes = document.getElementById("fit-labels-to-nodes").checked;
      appUtilities.currentGeneralProperties.rearrangeAfterExpandCollapse =
              document.getElementById("rearrange-after-expand-collapse").checked;
      appUtilities.currentGeneralProperties.animateOnDrawingChanges =
              document.getElementById("animate-on-drawing-changes").checked;

      sbgnvizInstance.refreshPaddings(true); // Refresh paddings and force paddings to be recalculated
      cy.style().update();
      
      $(self.el).modal('toggle');
    });

    $(document).off("click", "#default-sbgn").on("click", "#default-sbgn", function (evt) {
      self.copyProperties();
      self.template = _.template($("#general-properties-template").html());
      self.template = self.template(appUtilities.currentGeneralProperties);
      $(self.el).html(self.template);
    });

    return this;
  }
});

/**
 * Paths Between Query view for the Sample Application.
 */
var PathsBetweenQueryView = Backbone.View.extend({
  defaultQueryParameters: {
    geneSymbols: "",
    lengthLimit: 1
  },
  currentQueryParameters: null,
  initialize: function () {
    var self = this;
    self.copyProperties();
    self.template = _.template($("#query-pathsbetween-template").html());
    self.template = self.template(self.currentQueryParameters);
  },
  copyProperties: function () {
    this.currentQueryParameters = _.clone(this.defaultQueryParameters);
  },
  render: function () {
    var self = this;
    self.template = _.template($("#query-pathsbetween-template").html());
    self.template = self.template(self.currentQueryParameters);
    $(self.el).html(self.template);

    $(self.el).modal('show');
    
    $("#query-pathsbetween-enable-shortest-k-alteration").change(function (e) {
      if (document.getElementById("query-pathsbetween-enable-shortest-k-alteration").checked) {
        $("#query-pathsbetween-shortest-k").prop("disabled", false);
      } else {
        $("#query-pathsbetween-shortest-k").prop("disabled", true);
      }
    });

    $(document).off("click", "#save-query-pathsbetween").on("click", "#save-query-pathsbetween", function (evt) {

      // access the singleton sbgnviz instance
      var sbgnvizInstance = appUtilities.getSbgnvizInstance();

      self.currentQueryParameters.geneSymbols = document.getElementById("query-pathsbetween-gene-symbols").value;
      self.currentQueryParameters.lengthLimit = Number(document.getElementById("query-pathsbetween-length-limit").value);

      if (self.currentQueryParameters.geneSymbols.length === 0) {
        document.getElementById("query-pathsbetween-gene-symbols").focus();
        return;
      }

      var queryURL = "http://www.pathwaycommons.org/pc2/graph?format=SBGN&kind=PATHSBETWEEN&limit="
              + self.currentQueryParameters.lengthLimit;
      
      var sources = "";
      var filename = "";
      var geneSymbolsArray = self.currentQueryParameters.geneSymbols.replace("\n", " ").replace("\t", " ").split(" ");
      
      for (var i = 0; i < geneSymbolsArray.length; i++) {
        var currentGeneSymbol = geneSymbolsArray[i];
        if (currentGeneSymbol.length == 0 || currentGeneSymbol == ' '
                || currentGeneSymbol == '\n' || currentGeneSymbol == '\t') {
          continue;
        }
        sources = sources + "&source=" + currentGeneSymbol;
        if (filename == '') {
          filename = currentGeneSymbol;
        } else {
          filename = filename + '_' + currentGeneSymbol;
        }
      }
      filename = filename + '_PATHSBETWEEN.sbgnml';
      setFileContent(filename);

      sbgnvizInstance.startSpinner('paths-between-spinner');

      queryURL = queryURL + sources;
      $.ajax({
        url: queryURL,
        type: 'GET',
        success: function (data) {
          sbgnvizInstance.updateGraph(sbgnvizInstance.convertSbgnmlToJson(data));
          sbgnvizInstance.endSpinner('paths-between-spinner');
        }
      });

      $(self.el).modal('toggle');
    });

    $(document).off("click", "#cancel-query-pathsbetween").on("click", "#cancel-query-pathsbetween", function (evt) {
      $(self.el).modal('toggle');
    });

    return this;
  }
});

module.exports = {
  BioGeneView: BioGeneView,
  LayoutPropertiesView: LayoutPropertiesView,
  GeneralPropertiesView: GeneralPropertiesView,
  PathsBetweenQueryView: PathsBetweenQueryView
};