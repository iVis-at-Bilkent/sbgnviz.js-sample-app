var sbgnviz = require('sbgnviz');
var filesaverjs = require('filesaverjs');
var tippy = require('tippy.js');
window.jQuery = window.$ = require('jquery'); // jQuery should be global because jQuery.qtip extension is not compatible with commonjs
var cytoscape = require('cytoscape');

require('jquery-expander')($);
require('bootstrap');

var appUtilities = require('./js/app-utilities');
var appCy = require('./js/app-cy');
var appMenu = require('./js/app-menu');

// Get cy extension instances
var cyPanzoom = require('cytoscape-panzoom');
var cyQtip = require('cytoscape-qtip');
var cyCoseBilkent = require('cytoscape-cose-bilkent');
var cyUndoRedo = require('cytoscape-undo-redo');
var cyClipboard = require('cytoscape-clipboard');
var cyContextMenus = require('cytoscape-context-menus');
var cyExpandCollapse = require('cytoscape-expand-collapse');
var cyViewUtilities = require('cytoscape-view-utilities');

// Register cy extensions
cyPanzoom( cytoscape, $ );
cyQtip( cytoscape, $ );
cyCoseBilkent( cytoscape );
cyUndoRedo( cytoscape );
cyClipboard( cytoscape, $ );
cyContextMenus( cytoscape, $ );
cyExpandCollapse( cytoscape, $ );
cyViewUtilities( cytoscape, $ );

// Libraries to pass sbgnviz
var libs = {};

libs.filesaverjs = filesaverjs;
libs.jQuery = jQuery;
libs.cytoscape = cytoscape;
libs.tippy = tippy;

var options = {
  networkContainerSelector: '#sbgn-network-container',
  imgPath: 'node_modules/sbgnviz/src/img',
  // whether to fit label to nodes
  fitLabelsToNodes: function () {
    return appUtilities.currentGeneralProperties.fitLabelsToNodes;
  },
  // dynamic label size it may be 'small', 'regular', 'large'
  dynamicLabelSize: function () {
    return appUtilities.currentGeneralProperties.dynamicLabelSize;
  },
  // percentage used to calculate compound paddings
  compoundPadding: function () {
    return appUtilities.currentGeneralProperties.compoundPadding;
  },
  undoable: true
};

$(document).ready(function () {
sbgnviz.register(libs);

var s = sbgnviz(options);

window.sbgnviz = s;
window.cy = s.getCy();

appCy();
appMenu();

});