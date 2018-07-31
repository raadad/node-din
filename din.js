module.exports = function(wiring) {
    var Din = function() {
        var self = this,
            fs = require('fs'),
            prefixDir = wiring.baseDir ? wiring.baseDir : process.cwd();

        if (!process._dinSingletons) process._dinSingletons = {};

        self.wiring = wiring;

        self.resolve = function(path, parentModulePaths) {
            var parentModulePathsCopy = parentModulePaths.map(function(item) { return item; }),
            basePath = (parentModulePaths && parentModulePaths.length) ? parentModulePathsCopy.pop() : prefixDir;

            if (fs.existsSync(basePath + '/' + path)) return basePath + '/' + path;
            if (fs.existsSync(basePath + '/' + path + '.js')) return basePath + '/' + path + '.js';
            if (fs.existsSync(basePath + '/' + path + '.ts')) return basePath + '/' + path + '.ts';
            if (fs.existsSync(basePath + '/' + path + '.es6')) return basePath + '/' + path + '.es6';
            if (fs.existsSync(basePath + '/node_modules/' + path )) return basePath + '/node_modules/' + path;
            
            if (parentModulePaths.length) return self.resolve(path, parentModulePathsCopy);

            return path;
        };

        self.load = function load(alias, parentModulePaths) {
            if (!parentModulePaths && wiring.dirs) parentModulePaths = wiring.dirs; 
            if (!parentModulePaths) parentModulePaths = [];

            if (typeof alias !== "string") return alias; //support for non lookup dependencies
            if (alias.indexOf('s:') !== -1) return alias.spglit(':')[1]; // support for string based dependencies
            if (alias === '_din') return self;

            var moduleDescriptor = wiring.graph[alias]; // Load module from graph

            if(moduleDescriptor && moduleDescriptor.lookup && wiring.graph[moduleDescriptor.lookup])
                return self.load(moduleDescriptor.lookup, parentModulePaths); // recursivly lookup dependencies
            if (process._dinSingletons[alias]) return process._dinSingletons[alias]; // support for singletons
            if (!moduleDescriptor) moduleDescriptor = {}; // handle case where module is not defined in graph

            if (moduleDescriptor.lookup) moduleDescriptor._lookup = moduleDescriptor.lookup; // lookup is used for two things, this is a work around to not make breaking API change
            if (!moduleDescriptor._lookup) moduleDescriptor._lookup = alias;  // as above

            var moduleLocation = self.resolve(moduleDescriptor._lookup, parentModulePaths), //find module
                loadedModule = require(moduleLocation),
                originalModule = loadedModule; // load module
        
            //recursivly load dependencies for module
            if (moduleDescriptor.deps) {
                if(!parentModulePaths.some( a => (a == moduleLocation)) && !moduleLocation.split('.')[1] ) {
                    parentModulePaths.push(moduleLocation);
                }
                var dependencies = moduleDescriptor.deps.map(function(item) {
                    return self.load(item, parentModulePaths);
                });

                if(loadedModule.default) loadedModule = loadedModule.default;

                loadedModule = loadedModule.apply(null, dependencies); // inject dependencies

                if (moduleDescriptor.singleton) process._dinSingletons[alias] = loadedModule; // add to singleton store
                if(!loadedModule) throw new Error("Module did not return an instance "+moduleLocation);
                
            }
            return loadedModule;
        };

        return self;
    };

    return new Din();
};