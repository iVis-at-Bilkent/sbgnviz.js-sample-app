var jQuery = $ = require('jquery');
var appUtilities = require('./app-utilities');
var bioGeneQtip = require('./biogene-qtip');

module.exports = function () {
  var getExpandCollapseOptions = appUtilities.getExpandCollapseOptions.bind(appUtilities);
  var nodeQtipFunction = appUtilities.nodeQtipFunction.bind(appUtilities);
  var refreshUndoRedoButtonsStatus = appUtilities.refreshUndoRedoButtonsStatus.bind(appUtilities);

  $(document).ready(function ()
  {
    appUtilities.sbgnNetworkContainer = $('#sbgn-network-container');
    // register extensions and bind events when cy is ready
    cy.ready(function () {
      cytoscapeExtensionsAndContextMenu();
      bindCyEvents();
    });
  });

  function cytoscapeExtensionsAndContextMenu() {
    cy.expandCollapse(getExpandCollapseOptions());

    var contextMenus = cy.contextMenus({
    });

    cy.edgeEditing({
      // this function specifies the positions of bend points
      bendPositionsFunction: function (ele) {
        return ele.data('bendPointPositions');
      },
      // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
      undoable: true,
      // title of remove bend point menu item
      removeBendMenuItemTitle: "Delete Bend Point",
      // whether to initilize bend points on creation of this extension automatically
      initBendPointsAutomatically: false
    });

    contextMenus.appendMenuItems([
      {
        id: 'ctx-menu-general-properties',
        content: 'Properties...',
        coreAsWell: true,
        onClickFunction: function (event) {
          $("#general-properties").trigger("click");
        }
      },
      {
        id: 'ctx-menu-delete',
        content: 'Delete',
        selector: 'node, edge',
        onClickFunction: function (event) {
          cy.undoRedo().do("deleteElesSimple", {
            eles: event.target || event.cyTarget
          });
        }
      },
      {
        id: 'ctx-menu-delete-selected',
        content: 'Delete Selected',
        onClickFunction: function () {
          $("#delete-selected-simple").trigger('click');
        },
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'ctx-menu-hide-selected',
        content: 'Hide Selected',
        onClickFunction: function () {
          $("#hide-selected").trigger('click');
        },
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'ctx-menu-show-all',
        content: 'Show All',
        onClickFunction: function () {
          $("#show-all").trigger('click');
        },
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'ctx-menu-expand', // ID of menu item
        content: 'Expand', // Title of menu item
        // Filters the elements to have this menu item on cxttap
        // If the selector is not truthy no elements will have this menu item on cxttap
        selector: 'node.cy-expand-collapse-collapsed-node',
        onClickFunction: function (event) { // The function to be executed on click
          cy.undoRedo().do("expand", {
            nodes: event.target || event.cyTarget
          });
        }
      },
      {
        id: 'ctx-menu-collapse',
        content: 'Collapse',
        selector: 'node:parent',
        onClickFunction: function (event) {
          cy.undoRedo().do("collapse", {
            nodes: event.target || event.cyTarget
          });
        }
      },
      {
        id: 'ctx-menu-perform-layout',
        content: 'Perform Layout',
        onClickFunction: function () {
          $("#perform-layout").trigger('click');
        },
        coreAsWell: true // Whether core instance have this item on cxttap
      },
      {
        id: 'ctx-menu-biogene-properties',
        content: 'BioGene Properties',
        selector: 'node[class="macromolecule"],[class="nucleic acid feature"],[class="unspecified entity"]',
        onClickFunction: function (event) {
          bioGeneQtip(event.target || event.cyTarget);
        }
      }
    ]);

    cy.clipboard({
      clipboardSize: 5, // Size of clipboard. 0 means unlimited. If size is exceeded, first added item in clipboard will be removed.
      shortcuts: {
        enabled: true, // Whether keyboard shortcuts are enabled
        undoable: true // and if undoRedo extension exists
      }
    });

    cy.viewUtilities({
      node: {
        highlighted: { // styles for when nodes are highlighted.
          'border-width': function(ele) {
            return Math.max(parseFloat(ele.data('border-width')) + 2, 3);
          },
          'border-color': '#0B9BCD'
        },
        selected: {
          'border-color': '#d67614',
          'background-color': function (ele) {
            return ele.css('background-color');
          }
        }
      },
      edge: {
        highlighted: {
          'width': function(ele) { // styles for when edges are highlighted.
            return parseFloat(ele.data('width')) + 2;
          },
          'line-color': '#0B9BCD',
          'source-arrow-color': '#0B9BCD',
          'target-arrow-color': '#0B9BCD'
        },
        selected: {
          'line-color': '#d67614',
          'source-arrow-color': '#d67614',
          'target-arrow-color': '#d67614',
          'width': function (ele) {
            return parseFloat(ele.data('width')) + 2;
          }
        }
      },
      neighbor: function(node){ //select and return process-based neighbors
        node.select();
        var neighbors = sbgnviz.elementUtilities.extendNodeList();
        return neighbors;
      },
      neighborSelectTime: 1000 //ms
    });

    var panProps = ({
      fitPadding: 10,
      fitSelector: ':visible',
      animateOnFit: function () {
        return appUtilities.currentGeneralProperties.animateOnDrawingChanges;
      },
      animateOnZoom: function () {
        return appUtilities.currentGeneralProperties.animateOnDrawingChanges;
      }
    });

    cy.panzoom(panProps);
//    appUtilities.sbgnNetworkContainer.cytoscapePanzoom(panProps);
  }

  function bindCyEvents() {
    cy.on("afterDo", function (actionName, args) {
      refreshUndoRedoButtonsStatus();
    });

    cy.on("afterUndo", function (actionName, args) {
      refreshUndoRedoButtonsStatus();
    });

    cy.on("afterRedo", function (actionName, args) {
      refreshUndoRedoButtonsStatus();
    });

    cy.on('mouseover', 'node', function (event) {
      var node = this;

      $(".qtip").remove();

      if (event.originalEvent.shiftKey)
        return;

      node.qtipTimeOutFcn = setTimeout(function () {
        nodeQtipFunction(node);
      }, 1000);
    });

    cy.on('mouseout', 'node', function (event) {
      if (this.qtipTimeOutFcn != null) {
        clearTimeout(this.qtipTimeOutFcn);
        this.qtipTimeOutFcn = null;
      }
    });

    cy.on('tap', function (event) {
      $('input').blur();
    });

    cy.on('tap', 'node', function (event) {
      var node = this;

      $(".qtip").remove();

      if (event.originalEvent.shiftKey)
        return;

      if (node.qtipTimeOutFcn != null) {
        clearTimeout(node.qtipTimeOutFcn);
        node.qtipTimeOutFcn = null;
      }

      nodeQtipFunction(node);
    });
  }
};
