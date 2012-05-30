var path = require('path');

var renderFns = {
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

module.exports = function locals(root, renderers, customRenderFns) {
  customRenderFns = customRenderFns || {};
  var file = path.join(root, 'mason.json');
  var assets = require(file);

  var defaultRenderer = {
    javascript: renderers.javascript || 'uglify',
    stylus: renderers.stylus || 'stylus',
    jade: renderers.jade || 'jade'
  };

  return {
    mason: function(assetName) {
      var asset = assets[assetName];
      if (asset) {
        var renderer = renderers[assetName] || asset.renderer || defaultRenderer[asset.type];
        var renderFn = customRenderFns[renderer] || renderFns[renderer];
        return renderFn(asset.dest, asset.source);
      }
      throw new Error("Unable to find mason asset '" + assetName + "'");
    }
  };
};