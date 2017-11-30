var sbgnviz = require('sbgnviz');
var filesaverjs = require('filesaverjs');
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
var cyEdgeBendEditing = require('cytoscape-edge-bend-editing');
var cyViewUtilities = require('cytoscape-view-utilities');

// Register cy extensions
cyPanzoom( cytoscape, $ );
cyQtip( cytoscape, $ );
cyCoseBilkent( cytoscape );
cyUndoRedo( cytoscape );
cyClipboard( cytoscape, $ );
cyContextMenus( cytoscape, $ );
cyExpandCollapse( cytoscape, $ );
cyEdgeBendEditing( cytoscape, $ );
cyViewUtilities( cytoscape, $ );

// Libraries to pass sbgnviz
var libs = {};

libs.filesaverjs = filesaverjs;
libs.jQuery = jQuery;
libs.cytoscape = cytoscape;

$(document).ready(function () {

  // register sbgnviz with the libs
  sbgnviz.register(libs);

  // create the singleton sbgnviz instance
  appUtilities.createSbgnvizInstance(sbgnviz);

  appCy();
  appMenu();

});
