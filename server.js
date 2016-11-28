var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.port || 3000;

server.listen(port, function(){
  console.log('server listening on port%d', port);
});

app.use(express.static(__dirname + '/public'));
app.use('/node_modules/bootstrap', express.static(__dirname + '/node_modules/bootstrap/'));
app.use('/node_modules/cytoscape-panzoom', express.static(__dirname + '/node_modules/cytoscape-panzoom/'));
app.use('/node_modules/qtip2', express.static(__dirname + '/node_modules/qtip2/'));
app.use('/node_modules/cytoscape-context-menus', express.static(__dirname + '/node_modules/cytoscape-context-menus/'));