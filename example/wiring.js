module.exports = {
    baseDir : __dirname,
    graph : {
        'modulea' :{ lookup:'lib/testModule', deps:['n:console', 'j:computedDep', function() {console.log('inlineFunctionDep');}]},
        'testModule' :{ lookup:'lib/testModule', deps:['d:lib/anotherTestModule'] },
        'dependentModule' :{ deps:['n:console', { 'test':'inlineObject' }] },
        'lib/anotherTestModule' :{ deps:['n:console', 's:stringDep', 123456 ] }
    },
    evals: {
        'computedDep': function(name) { return require('fs').readFileSync; }
    }
};
