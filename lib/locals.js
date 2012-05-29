var path = require('path');

var defaultName = {
  javascript: 'debug',
  stylus: 'stylus',
  jade: 'jade'
};

var defaultFn = {
  debug: function(dest, source) {
    return source.src.map(function(src) {
      return '<script src="' + src + '"></script>';
    }).join('');
  },
  uglify: function(dest, source) {
    return '<script src="' + dest.src + '"></script>';
  },
  stylus: function(dest, source) {
    return '<link rel="stylesheet" href="' + dest.src + '" />';
  }
};

module.exports = function locals(root, config, handlers) {
  handlers = handlers || {};
  var file = path.join(root, 'mason.json');
  var assets = require(file);

  return {
    mason: function(name) {
      var asset = assets[name];
      if (asset) {
        var handlerName = config[name] || defaultName[asset.type];
        var handlerFn = handlers[handlerName] || defaultFn[handlerName];
        var html = handlerFn(asset.dest, asset.source);
        return html;
      }
      throw new Error("Unable to find mason asset '" + name + "'");
    }
  };
};