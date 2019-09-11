var jQuery = $ = require('jquery');
var chroma = require('chroma-js');

var appUtilities = {};

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
    sbgnviz.endSpinner('layout-spinner');
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

appUtilities.getColorsFromElements = function (nodes, edges) {
  var colorHash = {};
  var colorID = 0;
  for(var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    var bgValidColor = appUtilities.elementValidColor(node, 'background-color');
    if (!colorHash[bgValidColor]) {
      colorID++;
      colorHash[bgValidColor] = 'color_' + colorID;
    }

    var borderValidColor = appUtilities.elementValidColor(node, 'border-color');
    if (!colorHash[borderValidColor]) {
      colorID++;
      colorHash[borderValidColor] = 'color_' + colorID;
    }
  }
  for(var i=0; i<edges.length; i++) {
    var edge = edges[i];
    var lineValidColor = appUtilities.elementValidColor(edge, 'line-color');
    if (!colorHash[lineValidColor]) {
      colorID++;
      colorHash[lineValidColor] = 'color_' + colorID;
    }
  }
  return colorHash;
};

appUtilities.elementValidColor = function (ele, colorProperty) {
  if (ele.data(colorProperty)) {
    if (colorProperty == 'background-color') { // special case, take in count the opacity
      if (ele.data('background-opacity')) {
        return getXmlValidColor(ele.data('background-color'), ele.data('background-opacity'));
      }
      else {
        return getXmlValidColor(ele.data('background-color'));
      }
    }
    else { // general case
      return getXmlValidColor(ele.data(colorProperty));
    }
  }
  else { // element don't have that property
    return undefined;
  }
};

// accepts short or long hex or rgb color, return sbgnml compliant color value (= long hex)
// can optionnally convert opacity value and return a 8 characer hex color
function getXmlValidColor(color, opacity) {
  var finalColor = chroma(color).hex();
  if (typeof opacity === 'undefined') {
    return finalColor;
  }
  else { // append opacity as hex
    // see http://stackoverflow.com/questions/2877322/convert-opacity-to-hex-in-javascript
    return finalColor + Math.floor(opacity * 255).toString(16);
  }
};

appUtilities.getImagesFromElements = function (nodes) {
  var imageHash = {};
  var imageID = 0;
  for(var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    var validImages = appUtilities.elementValidImages(node);
    if(!validImages)
      continue;
    validImages.forEach(function(img){
      if (!imageHash[img]) {
        imageID++;
        imageHash[img] = 'image_' + imageID;
      }
    });
  }
  
  return imageHash;
};

appUtilities.elementValidImages = function (ele) {
  if (ele.isNode() && ele.data('background-image')) {
    return ele.data('background-image').split(" ");
  }
  else { // element don't have that property
    return undefined;
  }
};

appUtilities.elementValidImageIDs = function (imgs, imagesUsed) {
  if(imgs && imagesUsed && imgs.length > 0){
    var ids = [];
    imgs.forEach(function(img){
      ids.push(imagesUsed[img]);
    });
    return ids.join(" ");
  }
  else{
    return undefined;
  }
};

appUtilities.getAllStyles = function (_cy) {

  // use _cy param if it is set else use the recently active cy instance
//  var cy = _cy || appUtilities.getActiveCy();

  var collapsedChildren = cy.expandCollapse('get').getAllCollapsedChildrenRecursively();
  var collapsedChildrenNodes = collapsedChildren.filter("node");
  var nodes = cy.nodes().union(collapsedChildrenNodes);
  var collapsedChildrenEdges = collapsedChildren.filter("edge");
  var edges = cy.edges().union(collapsedChildrenEdges);

  // first get all used colors and background images, then deal with them and keep reference to them
  var colorUsed = appUtilities.getColorsFromElements(nodes, edges);
  var imagesUsed = appUtilities.getImagesFromElements(nodes);

  var nodePropertiesToXml = {
    'background-color': 'fill',
    'background-opacity': 'background-opacity', // not an sbgnml XML attribute, but used with fill
    'border-color': 'stroke',
    'border-width': 'strokeWidth',
    'font-size': 'fontSize',
    'font-weight': 'fontWeight',
    'font-style': 'fontStyle',
    'font-family': 'fontFamily',
    'background-image': 'backgroundImage',
    'background-fit': 'backgroundFit',
    'background-position-x': 'backgroundPosX',
    'background-position-y': 'backgroundPosY',
    'background-height': 'backgroundHeight',
    'background-width': 'backgroundWidth',
    'background-image-opacity': 'backgroundImageOpacity',
  };
  var edgePropertiesToXml = {
    'line-color': 'stroke',
    'width': 'strokeWidth'
  };

  function getStyleHash (element, properties) {
    var hash = "";
    for(var cssProp in properties){
      if (element.data(cssProp)) {
        if(cssProp === 'background-image'){
          var imgs = appUtilities.elementValidImages(element);
          hash += appUtilities.elementValidImageIDs(imgs, imagesUsed);
        }
        else
          hash += element.data(cssProp).toString();
      }
      else {
        hash += "";
      }
    }
    return hash;
  }

  function getStyleProperties (element, properties) {
    var props = {};
    for(var cssProp in properties){
      if (element.data(cssProp)) {
        //if it is a color property, replace it with corresponding id
        if (cssProp == 'background-color' || cssProp == 'border-color' || cssProp == 'line-color') {
          var validColor = appUtilities.elementValidColor(element, cssProp);
          var colorID = colorUsed[validColor];
          props[properties[cssProp]] = colorID;
        }
        //if it is background image property, replace it with corresponding id 
        else if(cssProp == 'background-image'){
          var imgs = appUtilities.elementValidImages(element);
          props[properties[cssProp]] = appUtilities.elementValidImageIDs(imgs, imagesUsed);
        }
        else{
          props[properties[cssProp]] = element.data(cssProp);
        }
      }
    }
    return props;
  }

  // populate the style structure for nodes
  var styles = {}; // list of styleKey pointing to a list of properties and a list of nodes
  for(var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    var styleKey = "node"+getStyleHash(node, nodePropertiesToXml);
    if (!styles.hasOwnProperty(styleKey)) { // new style encountered, init this new style
      var properties = getStyleProperties(node, nodePropertiesToXml);
      styles[styleKey] = {
        idList: [],
        properties: properties
      };
    }
    var currentNodeStyle = styles[styleKey];
    // add current node id to this style
    currentNodeStyle.idList.push(node.data('id'));
  }

  // populate the style structure for edges
  for(var i=0; i<edges.length; i++) {
    var edge = edges[i];
    var styleKey = "edge"+getStyleHash(edge, edgePropertiesToXml);
    if (!styles.hasOwnProperty(styleKey)) { // new style encountered, init this new style
      var properties = getStyleProperties(edge, edgePropertiesToXml);
      styles[styleKey] = {
        idList: [],
        properties: properties
      };
    }
    var currentEdgeStyle = styles[styleKey];
    // add current node id to this style
    currentEdgeStyle.idList.push(edge.data('id'));
  }

  var containerBgColor = $(cy.container()).css('background-color');
  if (containerBgColor == "transparent") {
    containerBgColor = "#ffffff";
  }
  else {
    containerBgColor = getXmlValidColor(containerBgColor);
  }

  return {
    colors: colorUsed,
    images: imagesUsed,
    background: containerBgColor,
    styles: styles
  };
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

  var qtipContent = sbgnviz.getQtipContent(node);

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
