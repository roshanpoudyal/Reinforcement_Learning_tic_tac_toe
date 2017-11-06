const express = require('express');
const expressapp = express();

/* register all static directories to be used by express */
expressapp.use(express.static('libraries'));
expressapp.use(express.static('scripts'));
expressapp.use(express.static('stylesheets'));
expressapp.use(express.static('views'));

expressapp.get('/index.html', function(req, res){
    res.sendFile(__dirname + "/" + "index.html");
});

var expressServer = expressapp.listen(3000, function(){
    var host = expressServer.address().address;
    var port = expressServer.address().port;

    console.log("Tic Tac Toe app listening at http://%s:%s", host, port);
});
  