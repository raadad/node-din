// Load Din Library and co figuration
var Din = require('../din'),
    appWiring = require('./wiring'),
    din = Din(appWiring),

    modulea = din.load('modulea'),
    alternateDeps = din.load('testModule');


