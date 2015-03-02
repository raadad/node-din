module.exports = function(config) {
    return new function() {
        var self = this,
        prefixDir = config.baseDir ? config.baseDir : process.cwd(),

        loader = {};
        loader['x'] = function(name) { return require(name); };
        loader['n'] = function(name) { return require(name); };
        loader['d'] = function(name) { return self.load(name); };
        loader['s'] = function(name) { return name; };
        loader['j'] = function(name) { return config.evals[name](); };

        if(!config.singletons) config.singletons = {};
        self.config = config;

        self.load = function load(alias) {
            var moduleDescriptor = config.graph[alias];
            if (!moduleDescriptor) throw new Error('alias: ' + alias + ' not specified in configuration');

            if (config.singletons[alias]) return config.singletons[alias]

            var dependencies = moduleDescriptor.deps.map(function(item) {
                if (typeof item !== "string") return item;
                var dependencyParts = item.split(':'),
                dependencyType = dependencyParts[0],
                dependencyAlias = dependencyParts[1];
                if (!dependencyType) dependencyType = 'x';

                return loader[dependencyType](dependencyAlias);
            }),

            path = moduleDescriptor.lookup ? moduleDescriptor.lookup : alias;
            var loadedModule = require(prefixDir + '/' + path).apply(null, dependencies);
            if(moduleDescriptor.singleton) config.singletons[alias] = loadedModule;

            return loadedModule;
        };

        return self;
    }();
};

