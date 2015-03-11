module.exports = function(config) {
    var Din = function() {
        var self = this,
            fs = require('fs'),
            prefixDir = config.baseDir ? config.baseDir : process.cwd(),


            loader = {};
        loader['x'] = function(name) { return require(name); };
        loader['n'] = function(name) { return require(name); };
        loader['d'] = function(name) { return self.load(name); };
        loader['s'] = function(name) { return name; };
        loader['j'] = function(name) { return config.evals[name](); };

        if (!config.singletons) config.singletons = {};

        // TODO: consider package.json entry point in this logic.
        self.resolve = function(path) {
            if (fs.existsSync(prefixDir + '/' + path)) {
                return prefixDir + '/' + path;
            }

            if (fs.existsSync(prefixDir + '/' + path + '.js')) {
                return prefixDir + '/' + path + '.js';
            }

            return path;
        };

        self.load = function load(alias) {
            var moduleDescriptor = config.graph[alias];
            if (!moduleDescriptor) throw new Error('alias: ' + alias + ' not specified in configuration');

            if (config.singletons[alias]) return config.singletons[alias];

            var dependencies = moduleDescriptor.deps.map(function(item) {
                    if (typeof item !== "string") return item;
                    var dependencyParts = item.split(':'),
                        dependencyType = dependencyParts[0],
                        dependencyAlias = dependencyParts[1];
                    if (!dependencyType) dependencyType = 'x';

                    return loader[dependencyType](dependencyAlias);
                }),

                path = moduleDescriptor.lookup ? moduleDescriptor.lookup : alias,
                moduleLocation = self.resolve(path),
                loadedModule = require(moduleLocation).apply(null, dependencies);

            if (moduleDescriptor.singleton) config.singletons[alias] = loadedModule;

            return loadedModule;
        };

        return self;
    };

    return new Din();
};

