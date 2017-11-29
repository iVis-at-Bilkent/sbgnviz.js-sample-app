var jQuery = $ = require('jquery');
var BackboneViews = require('./backbone-views');
var appUtilities = require('./app-utilities');

// Handle sbgnviz menu functions which are to be triggered on events
module.exports = function () {

  // access the singleton sbgnviz instance
  var sbgnvizInstance = appUtilities.getSbgnvizInstance();

  // access the singleton cy instance
  var cy = appUtilities.getCy();

  var dynamicResize = appUtilities.dynamicResize.bind(appUtilities);
  
  var layoutPropertiesView, generalPropertiesView, pathsBetweenQueryView;

  function loadSample(filename) {
    return sbgnvizInstance.loadSample(filename, 'app/samples/');
  }
  
  // TODO consider using a library for keyboard events
  $(document).keydown(function (e) {
    if ( ( e.ctrlKey || e.metaKey ) && e.target.nodeName === 'BODY') {
      if (e.which === 90) { // ctrl + z
        cy.undoRedo().undo();
      }
      else if (e.which === 89) { // ctrl + y
        cy.undoRedo().redo();
      }
    }
  });

  console.log('init the sbgnviz template/page');

  $(window).on('resize', dynamicResize);
  dynamicResize();

  layoutPropertiesView = appUtilities.layoutPropertiesView = new BackboneViews.LayoutPropertiesView({el: '#layout-properties-table'});
  generalPropertiesView = appUtilities.generalPropertiesView = new BackboneViews.GeneralPropertiesView({el: '#general-properties-table'});
  pathsBetweenQueryView = appUtilities.pathsBetweenQueryView = new BackboneViews.PathsBetweenQueryView({el: '#query-pathsbetween-table'});

  toolbarButtonsAndMenu();

  // loadSample is called before the container is resized in dynamicResize function, so we need to wait
  // wait until it is resized before loading the default sample. As the current solution we set a 100 ms
  // time out before loading the default sample.
  // TODO search for a better way.
  setTimeout(function(){
    loadSample('neuronal_muscle_signaling.xml');
  }, 100);

  // Events triggered by sbgnviz module
  $(document).on('sbgnvizLoadSample sbgnvizLoadFile', function(event, filename) {
    appUtilities.setFileContent(filename);
  });
  
  $(document).on('updateGraphEnd', function(event) {
    appUtilities.resetUndoRedoButtons();
  });

  function toolbarButtonsAndMenu() {

    $("#load-file, #load-file-icon").click(function () {
      $("#file-input").trigger('click');
    });

    $("#file-input").change(function () {
      if ($(this).val() != "") {
        var file = this.files[0];
        sbgnvizInstance.loadSBGNMLFile(file);
        $(this).val("");
      }
    });

    $("#PD-legend").click(function (e) {
      e.preventDefault();
      $("#PD_legend_modal").modal('show');
    });

    $("#AF-legend").click(function (e) {
      e.preventDefault();
      $("#AF_legend_modal").modal('show');
    });

    $("#quick-help").click(function (e) {
      e.preventDefault();
      $("#quick_help_modal").modal('show');
    });

    $("#about").click(function (e) {
      e.preventDefault();
      $("#about_modal").modal('show');
    });

    var selectorToSampleFileName = {
      "#load-sample1" : 'neuronal_muscle_signaling.xml',
      "#load-sample2" : 'cam-camk_dependent_signaling_to_the_nucleus.xml',
      "#load-sample3" : 'atm_mediated_phosphorylation_of_repair_proteins.xml',
      "#load-sample4" : 'activated_stat1alpha_induction_of_the_irf1_gene.xml',
      "#load-sample5" : 'vitamins_b6_activation_to_pyridoxal_phosphate.xml',
      "#load-sample6" : 'insulin-like_growth_factor_signaling.xml',
      "#load-sample7" : 'polyq_proteins_interference.xml',
      "#load-sample8" : 'glycolysis.xml',
      "#load-sample9" : 'mapk_cascade.xml',
      "#load-sample10" : 'transforming_growth_factor_beta_signaling.xml',
      "#load-sample11" : 'repressilator.xml',
      "#load-sample12" : 'epidermal_growth_factor_receptor.xml',
      "#load-sample13" : 'regulation_of_tgfbeta-induced_metastasis.xml'
    };

    for ( var selector in selectorToSampleFileName ) {
      (function(selector){
        $(selector).click(function (e) {
          loadSample(selectorToSampleFileName[selector]);
        });
      })(selector);
    }

    $("#hide-selected, #hide-selected-icon").click(function(e) {
      sbgnvizInstance.hideNodesSmart(cy.nodes(":selected"));
    });
    
    $("#show-selected, #show-selected-icon").click(function(e) {
      sbgnvizInstance.showNodesSmart(cy.nodes(":selected"));
    });

    $("#show-all").click(function (e) {
      sbgnvizInstance.showAll();
    });

    $("#delete-selected-smart, #delete-selected-smart-icon").click(function (e) {
      sbgnvizInstance.deleteNodesSmart(cy.nodes(':selected'));
    });

    $("#highlight-neighbors-of-selected, #highlight-neighbors-of-selected-icon").click(function (e) {
      sbgnvizInstance.highlightNeighbours(cy.nodes(':selected'));
    });

    $("#search-by-label-icon").click(function (e) {
      var label = $("#search-by-label-text-box").val().toLowerCase();
      sbgnvizInstance.searchByLabel(label);
    });

    $("#search-by-label-text-box").keydown(function (e) {
      if (e.which === 13) {
        $("#search-by-label-icon").trigger('click');
      }
    });

    $("#highlight-search-menu-item").click(function (e) {
      $("#search-by-label-text-box").focus();
    });
    
    $("#highlight-selected").click(function (e) {
      sbgnvizInstance.highlightSelected(cy.elements(':selected'));
    });

    $("#highlight-processes-of-selected").click(function (e) {
      sbgnvizInstance.highlightProcesses(cy.nodes(':selected'));
    });

    $("#remove-highlights, #remove-highlights-icon").click(function (e) {
      sbgnvizInstance.removeHighlights();
    });

    $("#layout-properties, #layout-properties-icon").click(function (e) {
      layoutPropertiesView.render();
    });

    $("#delete-selected-simple, #delete-selected-simple-icon").click(function (e) {
      sbgnvizInstance.deleteElesSimple(cy.elements(':selected'));
    });

    $("#general-properties, #properties-icon").click(function (e) {
      generalPropertiesView.render();
    });

    $("#query-pathsbetween").click(function (e) {
      pathsBetweenQueryView.render();
    });

    $("#collapse-selected,#collapse-selected-icon").click(function (e) {
      sbgnvizInstance.collapseNodes(cy.nodes(":selected"));
    });

    $("#expand-selected,#expand-selected-icon").click(function (e) {
      sbgnvizInstance.expandNodes(cy.nodes(":selected"));
    });

    $("#collapse-complexes").click(function (e) {
      sbgnvizInstance.collapseComplexes();
    });
    $("#expand-complexes").click(function (e) {
      sbgnvizInstance.expandComplexes();
    });

    $("#collapse-all").click(function (e) {
      sbgnvizInstance.collapseAll();
    });

    $("#expand-all").click(function (e) {
      sbgnvizInstance.expandAll();
    });

    $("#perform-layout, #perform-layout-icon").click(function (e) {
      // TODO think whether here is the right place to start the spinner
      sbgnvizInstance.startSpinner("layout-spinner");

      // If 'animate-on-drawing-changes' is false then animate option must be 'end' instead of false
      // If it is 'during' use it as is 
      var preferences = {
        animate: appUtilities.currentGeneralProperties.animateOnDrawingChanges ? 'end' : false
      };
      if (appUtilities.currentLayoutProperties.animate == 'during') {
        delete preferences.animate;
      }
      layoutPropertiesView.applyLayout(preferences);
    });

    $("#undo-last-action, #undo-icon").click(function (e) {
      cy.undoRedo().undo();
    });

    $("#redo-last-action, #redo-icon").click(function (e) {
      cy.undoRedo().redo();
    });

    $("#save-as-png").click(function (evt) {
      sbgnvizInstance.saveAsPng(); // the default filename is 'network.png'
    });

    $("#save-as-jpg").click(function (evt) {
      sbgnvizInstance.saveAsJpg(); // the default filename is 'network.jpg'
    });

    $("#save-as-svg").click(function (evt) {
      sbgnvizInstance.saveAsSvg(); // the default filename is 'network.jpg'
    });

    //TODO: could simply keep/store original input SBGN-ML data and use it here instead of converting from JSON
    $("#save-as-sbgnml, #save-icon").click(function (evt) {
      var filename = document.getElementById('file-name').innerHTML;
      sbgnvizInstance.saveAsSbgnml(filename);
    });

    appUtilities.sbgnNetworkContainer.on("click", ".biogene-info .expandable", function (evt) {
      var expanderOpts = {slicePoint: 150,
        expandPrefix: ' ',
        expandText: ' (...)',
        userCollapseText: ' (show less)',
        moreClass: 'expander-read-more',
        lessClass: 'expander-read-less',
        detailClass: 'expander-details',
        expandEffect: 'fadeIn',
        collapseEffect: 'fadeOut'
      };
      $(".biogene-info .expandable").expander(expanderOpts);
      expanderOpts.slicePoint = 2;
      expanderOpts.widow = 0;
    });
  }
};
