# Din
Razor thin Dependency Injection for node.js

### Why?
This library helps you achieve and enforce true inversion of control of your modules, using require - to load modules directly makes it difficult to control what dependencies your modules use , when it comes time for testing, or swapping out implementations of dependencies, it becomes difficult without having to change the module internally or hack the require cache.

This library aims to be as thin as possible as well as completley unobtrusive to the modules themselevs, as opposed to most DI libraries which require modules are written in a specific way or depend on a global variable such as 'define'.

### Usage
Din is constructed with a config, which is used to specify what dependencies each module requires and how a module should be loaded, there are multiple ways to load a dependency, depending on the requirment.


The following example shows how to load multiple dependencies in many supported usage scenarios.

#### Example module - lib/testModule.js
        module.exports =  function(normalModule, computed, inlineFunction, string, number) {
            console.log(arguments);
        }


#### App module wiring config - wiring.js

    module.exports = {
        baseDir : __dirname, //alternative to relative path names
        graph : {
            'modulea' :{  // key used to load module
                lookup:'lib/testModule',  //actual name of js file
                deps:[ // array containing dependencies required to load module
                    'n:console', // n denotes it is a normal module that can be required
                    'j:computedDep', // j denotes a lookup in the evals object (shown below)
                    function() {console.log('inlineFunctionDep'); // functions can be inlined as dependencies
                    's:stringDep', // s dentoes a string literal
                    123456, // numbers are passed straight through
                    'd:libAnotherTestModule' // d denotes the loading of another module through the din library
                    }
                ]
            },
            'lib/anotherTestModule' :{  // modules dont require loojup if their keys match an actual file
                deps:['n:fs'] }
        },
        evals: {
            'computedDep': function(name) { return require('fs').readFileSync; }
            // will return a reference to readFileSync as a Dependency
        }
};

#### Load DI - app.js

    var Din = require('../din'),
    appWiring = require('./wiring'), // config
    din = Din(appWiring),

    modulea = din.load('modulea');


