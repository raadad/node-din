module.exports = function(config) {
    var Din = function() {
        var self = this,
            fs = require('fs'),
            prefixDir = config.baseDir ? config.baseDir : process.cwd();

        if (!config.singletons) config.singletons = {};

        // TODO: consider package.json entry point in this logic.
        // TODO: strip file name from parentModulePath
        self.resolve = function(path, parentModulePath) {
            var basePath = parentModulePath ? parentModulePath : prefixDir;

            if (fs.existsSync(basePath + '/' + path)) return basePath + '/' + path;
            if (fs.existsSync(basePath + '/' + path + '.js')) return basePath + '/' + path + '.js';
            if (fs.existsSync(basePath + '/node_modules/' + path )) return basePath + '/node_modules/' + path;

            if (parentModulePath) return self.resolve(path);

            return path;
        };

        self.load = function load(alias, parentModulePath) {
            if (typeof alias !== "string") return alias;
            if (alias.indexOf('s:') !== -1) return alias.split(':')[1];

            var moduleDescriptor = config.graph[alias];
            if (config.singletons[alias]) return config.singletons[alias];
            if (!moduleDescriptor) moduleDescriptor = {};
            if (!moduleDescriptor.lookup) moduleDescriptor.lookup = alias;

            var moduleLocation = self.resolve(moduleDescriptor.lookup, parentModulePath),
                loadedModule = require(moduleLocation);

            if (moduleDescriptor.deps) {
                dependencies = moduleDescriptor.deps.map(function(item) {
                    return self.load(item, moduleLocation);
                });
                loadedModule = loadedModule.apply(null, dependencies);
                if (moduleDescriptor.singleton) config.singletons[alias] = loadedModule;
            }

            return loadedModule;
        };

        return self;
    };

    return new Din();
};
