# Din
Razor thin Dependency Injection for node.js
### Why?
This library helps you achieve and enforce true inversion of control of your modules.

When you are dealing with large code bases in node.js which is common place as small applications grow very large, the code
base increasingly difficult to manage, update and test.

Using require to load modules directly makes it difficult to control what dependencies your modules use and when it comes time for testing or swapping out implementations of dependencies, it becomes difficult without having to change the module internally or hack the require cache.

This library aims to be as thin as possible as well as completley unobtrusive to the modules themselevs, as opposed to most DI libraries which require modules are written in a specific way or depend on a global variable such as 'define'.

### Usage
Din is constructed with a wiring file, which is used to specify what dependencies each module requires and how a module should be loaded, there are multiple ways to load a dependency, depending on the requirment.

The following example shows how to load multiple dependencies in many supported usage scenarios.

#### Example module - lib/testModule.js
```javscript
module.exports =  function(normalModule, computed, inlineFunction, string, number) {
        console.log(arguments);
}
```

#### App module wiring config - wiring.js
```javscript
module.exports = {
        baseDir : __dirname, //alternative to relative path names
        graph : {
            'modulea' :{  // key used to load module
                lookup:'lib/testModule',  //actual name of js file
                deps:[ // array containing dependencies required to load module
                    console.log,  // injects the console.log function
                    function() {console.log('inlineFunctionDep');}, // functions can be inlined as dependencies
                    's:stringDep', // s dentoes a string literal
                    123456, // numbers are passed straight through
                    'libAnotherTestModule', // loads a module refernced in the wiring
                    '_din' // injects the instance of din to allow for modules to be loaded on demand
                ]
            }
        }
};
```
#### Load DI - app.js
```javscript
var Din = require('../din'),
appWiring = require('./wiring'), // config
din = Din(appWiring),

modulea = din.load('modulea');
```

