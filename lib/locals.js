var path = require('path');

var renderFns = {
  debug: function(asset) {
    return asset.sourcePaths.map(function(sourcePath) {
      return '<script src="' + sourcePath + '"></script>';
    }).join('');
  },
  uglify: function(asset) {
    return '<script src="' + asset.destPath + '"></script>';
  },
  stylus: function(asset) {
    return '<link rel="stylesheet" href="' + asset.destPath + '" />';
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
        return renderFn(asset);
      }
      throw new Error("Unable to find mason asset '" + assetName + "'");
    }
  };
};