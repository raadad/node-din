module.exports = function(config) {
    var Din = function() {
        var self = this,
            fs = require('fs'),
            prefixDir = config.baseDir ? config.baseDir : process.cwd();

        if (!process._dinSingletons) process._dinSingletons = {};

        // TODO: consider package.json entry point in this logic.
        // TODO: strip file name from parentModulePaths

        self.resolve = function(path, parentModulePaths) {
            var parentModulePathsCopy = parentModulePaths.map(function(item) { return item; }),
            basePath = (parentModulePaths && parentModulePaths.length) ? parentModulePathsCopy.pop() : prefixDir;

            if (fs.existsSync(basePath + '/' + path)) return basePath + '/' + path;
            if (fs.existsSync(basePath + '/' + path + '.js')) return basePath + '/' + path + '.js';
            if (fs.existsSync(basePath + '/node_modules/' + path )) return basePath + '/node_modules/' + path;

            if (parentModulePaths.length) return self.resolve(path, parentModulePathsCopy);

            return path;
        };

        self.load = function load(alias, parentModulePaths) {
            if (!parentModulePaths) parentModulePaths = [];
            if (typeof alias !== "string") return alias;
            if (alias.indexOf('s:') !== -1) return alias.split(':')[1];

            var moduleDescriptor = config.graph[alias];
            if (process._dinSingletons[alias]) return process._dinSingletons[alias];
            if (!moduleDescriptor) moduleDescriptor = {};
            if (!moduleDescriptor.lookup) moduleDescriptor.lookup = alias;

            var moduleLocation = self.resolve(moduleDescriptor.lookup, parentModulePaths),
                loadedModule = require(moduleLocation);

            if (moduleDescriptor.deps) {
                parentModulePaths.push(moduleLocation);
                dependencies = moduleDescriptor.deps.map(function(item) {
                    return self.load(item, parentModulePaths);
                });
                loadedModule = loadedModule.apply(null, dependencies);
                if (moduleDescriptor.singleton) process._dinSingletons[alias] = loadedModule;
            }

            return loadedModule;
        };

        return self;
    };

    return new Din();
};
