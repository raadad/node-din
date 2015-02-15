module.exports = function(config) {
    var self = this,

    loader = {};
    loader['x'] = function(name) { return require(name); };
    loader['n'] = function(name) { return require(name); };
    loader['d'] = function(name) { return self.load(name); };
    loader['s'] = function(name) { return name; };

    self.load = function load(alias) {
        var moduleDescriptor = config.graph[alias];
        if (!moduleDescriptor) throw new Error('alias not specified in config configuration');

        var dependencies = config.graph[alias].deps.map(function(item) {
            if (typeof item !== "string") return item;
            var dependencyParts = item.split(':'),
            dependencyType = dependencyParts[0],
            dependencyAlias = dependencyParts[1];
            if (!dependencyType) dependencyType = 'x';

            return loader[dependencyType](dependencyAlias);
        }),

        path = moduleDescriptor.lookup ? moduleDescriptor.lookup : alias;

        return require(process.cwd() + '/' + path).apply(null, dependencies);
    };

    return self;
};

