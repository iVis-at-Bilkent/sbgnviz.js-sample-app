var jQuery = $ = require('jquery');

var appUtilities = {};

// Singleton sbgnviz instance for the application, to be created through appUtilities.createSbgnvizInstance
appUtilities.sbgnvizInstance = undefined;

// Creates a singleton sbgnviz instance for the application
appUtilities.createSbgnvizInstance = function (sbgnviz) {

  // If this function is called though an sbgnviz.js instance is already created throw an error
  if ( this.sbgnvizInstance !== undefined ) {
    throw "A singleton sbgnviz.js instance is already created";
  }

  // use self variable instead of this where the scope changes
  var self = this;

  // options to create sbgnviz instance
  var options = {
    networkContainerSelector: '#sbgn-network-container',
    imgPath: 'node_modules/sbgnviz/src/img',
    // whether to fit label to nodes
    fitLabelsToNodes: function () {
      return self.currentGeneralProperties.fitLabelsToNodes;
    },
    // dynamic label size it may be 'small', 'regular', 'large'
    dynamicLabelSize: function () {
      return self.currentGeneralProperties.dynamicLabelSize;
    },
    // percentage used to calculate compound paddings
    compoundPadding: function () {
      return self.currentGeneralProperties.compoundPadding;
    },
    undoable: true
  }

  // create the instance
  this.sbgnvizInstance = sbgnviz(options);

  // return the new instance
  return this.sbgnvizInstance;
};

// Gets the singleton sbgnviz instance of the application
appUtilities.getSbgnvizInstance = function () {

  // If the sbgnviz.js instance is not created yet throw an error
  if ( this.sbgnvizInstance === undefined ) {
    throw "The singleton sbgnviz.js instance is not created yet";
  }

  // return the new sbgnviz instance
  return this.sbgnvizInstance;
};

// Get the cy instance that is associated with the singleton sbgnviz instance created for the application
appUtilities.getCy = function () {

  return this.getSbgnvizInstance().getCy();

};

appUtilities.defaultLayoutProperties ={
  name: 'cose-bilkent',
  nodeRepulsion: 4500,
  idealEdgeLength: 50,
  edgeElasticity: 0.45,
  nestingFactor: 0.1,
  gravity: 0.25,
  numIter: 2500,
  tile: true,
  animationEasing: 'cubic-bezier(0.19, 1, 0.22, 1)',
  animate: 'end',
  animationDuration: 1000,
  randomize: true,
  tilingPaddingVertical: 20,
  tilingPaddingHorizontal: 20,
  gravityRangeCompound: 1.5,
  gravityCompound: 1.0,
  gravityRange: 3.8,
  initialEnergyOnIncremental:0.8,
  stop: function () {
    appUtilities.getSbgnvizInstance().endSpinner('layout-spinner');
  }
};

appUtilities.currentLayoutProperties = jQuery.extend(true, {}, appUtilities.defaultLayoutProperties);

appUtilities.defaultGeneralProperties = {
  compoundPadding: 10,
  dynamicLabelSize: 'regular',
  fitLabelsToNodes: false,
  rearrangeAfterExpandCollapse: true,
  animateOnDrawingChanges: true
};

appUtilities.currentGeneralProperties = jQuery.extend(true, {}, appUtilities.defaultGeneralProperties);

appUtilities.setFileContent = function (fileName) {
  var span = document.getElementById('file-name');
  while (span.firstChild) {
    span.removeChild(span.firstChild);
  }
  span.appendChild(document.createTextNode(fileName));
};

appUtilities.triggerIncrementalLayout = function () {
  // If 'animate-on-drawing-changes' is false then animate option must be 'end' instead of false
  // If it is 'during' use it as is. Set 'randomize' and 'fit' options to false
  var preferences = {
    randomize: false,
    animate: this.currentGeneralProperties.animateOnDrawingChanges ? 'end' : false,
    fit: false
  };
  if (this.currentLayoutProperties.animate === 'during') {
    delete preferences.animate;
  }

  this.layoutPropertiesView.applyLayout(preferences, true); // layout must not be undoable
};

appUtilities.getExpandCollapseOptions = function () {
  var self = this;
  return {
    fisheye: function () {
      return self.currentGeneralProperties.rearrangeAfterExpandCollapse;
    },
    animate: function () {
      return self.currentGeneralProperties.animateOnDrawingChanges;
    },
    layoutBy: function () {
      if (!self.currentGeneralProperties.rearrangeAfterExpandCollapse) {
        return;
      }

      self.triggerIncrementalLayout();
    },
    expandCollapseCueSize: 12,
    expandCollapseCuePosition: function (node) {

       // access the singleton cy instance
       var cy = self.getCy();

       var offset = 1, rectSize = 12; // this is the expandCollapseCueSize;
       var size = cy.zoom() < 1 ? rectSize / (2*cy.zoom()) : rectSize / 2;
       var x = node.position('x') - node.width() / 2 - parseFloat(node.css('padding-left'))
           + parseFloat(node.css('border-width')) + size + offset;
       if (node.data("class") == "compartment"){
           var y  = node.position('y') - node.outerHeight() / 2  + Math.min(15, node.outerHeight()*0.05)
               + parseFloat(node.css('border-width'))+ size;
       } else {
           var y = node.position('y') - node.height() / 2 - parseFloat(node.css('padding-top'))
               + parseFloat(node.css('border-width')) + size + offset;
       };

       return {'x': x, 'y': y};
    },
  };
};

appUtilities.dynamicResize = function () {
  var win = $(window);//$(this); //this = window

  var windowWidth = win.width();
  var windowHeight = win.height();
  var canvasWidth = 1000;
  var canvasHeight = 680;
  if (windowWidth > canvasWidth)
  {
    var w = windowWidth * 0.9;
    $("#sbgn-network-container").width(w);
    $(".nav-menu").width(w);
    $(".navbar").width(w);
    $("#sbgn-toolbar").width(w);
  }

  if (windowHeight > canvasHeight)
  {
    $("#sbgn-network-container").height(windowHeight * 0.85);
  }
};

appUtilities.nodeQtipFunction = function (node) {
  if (node.renderedStyle("label") == node.data("label") && node.data("statesandinfos").length == 0 && node.data("class") != "complex") {
    return;
  }

  var qtipContent = this.getSbgnvizInstance().getQtipContent(node);

  if (!qtipContent) {
    return;
  }

  node.qtip({
    content: function () {
      return qtipContent;
    },
    show: {
      ready: true
    },
    position: {
      my: 'top center',
      at: 'bottom center',
      adjust: {
        cyViewport: true
      }
    },
    style: {
      classes: 'qtip-bootstrap',
      tip: {
        width: 16,
        height: 8
      }
    }
  });
};

appUtilities.refreshUndoRedoButtonsStatus = function () {

  // access the singleton cy instance
  var cy = this.getCy();

  var ur = cy.undoRedo();
  if (ur.isUndoStackEmpty()) {
    $("#undo-last-action").parent("li").addClass("disabled");
  }
  else {
    $("#undo-last-action").parent("li").removeClass("disabled");
  }

  if (ur.isRedoStackEmpty()) {
    $("#redo-last-action").parent("li").addClass("disabled");
  }
  else {
    $("#redo-last-action").parent("li").removeClass("disabled");
  }
};

appUtilities.resetUndoRedoButtons = function () {
  $("#undo-last-action").parent("li").addClass("disabled");
  $("#redo-last-action").parent("li").addClass("disabled");
};

module.exports = appUtilities;
