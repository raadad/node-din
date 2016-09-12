module.exports = {
    baseDir : __dirname,
    graph : {
        'modulea' :{ lookup:'lib/testModule', deps:['console',  function() {console.log('inlineFunctionDep');}]},
        'testModule' :{ lookup:'lib/testModule', deps:['lib/anotherTestModule'] },
        'dependentModule' :{ deps:['console', { 'test':'inlineObject' }] },
        'lib/anotherTestModule' :{ deps:['console', 's:stringDep', 123456 ] },
        'redis':{lookup:'redis'}
    },
};
