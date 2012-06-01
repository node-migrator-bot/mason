var path = require('path');
var fs = require('fs');
var _ = require('underscore')._;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var build = require('./build');
var log = require('./log');

function FileTree(data, file) {
  this.onChange = _.bind(this.onChange, this);
  this.onChange = _.debounce(this.onChange, 3000, true);
  this.onChildChange = _.bind(this.onChildChange, this);
  EventEmitter.call(this);
  this.data = data;
  this.file = file;
  this.children = [];
  this.watch();
  this.branch();
}

util.inherits(FileTree, EventEmitter);

FileTree.prototype.fileExists = function() {
  return path.existsSync(this.file);
};

FileTree.prototype.watch = function() {
  var self = this;
  if (this.file) {
    if(this.fileExists()) {
      createWatcher();
    }
    else {
      buildDirectoryWatcher(getDirectoryToWatch());
      // Get the closest directory to the file that actually exists
      function getDirectoryToWatch() {
        var dirname = path.dirname(self.file);
        while(!path.existsSync(dirname)) dirname = path.dirname(dirname);
        return dirname;
      }
      function buildDirectoryWatcher(dirname) {
        // watch parent directory, start watching the file once it exists
        self.watcher = fs.watch(dirname, function() {
          if(self.fileExists()) {
            // close the directory watcher and start watching the actual file
            self.watcher.close();
            createWatcher();
            return self.onChange();
          }
          if(dirname != getDirectoryToWatch()) {
            // the directory we should be watching has changed, stop watching this one and
            // start watching the new one
            self.watcher.close();
            return buildDirectoryWatcher(getDirectoryToWatch());
          }
        });
      }
    }
  }
  function createWatcher() {
    self.watcher = fs.watch(self.file, self.onChange);
  }
};
FileTree.prototype.onChange = function(event) {
  // update everything below this level of the tree
  log('changed', this.file);
  this.emit('change', this);
  this.branch();
};
FileTree.prototype.onChildChange = function(tree) {
  this.emit('change', this);
},
FileTree.prototype.stop = function() {
  if (this.watcher) this.watcher.close();
  this.removeAllListeners();
};
FileTree.prototype.addChild = function(child) {
  child.on('change', this.onChildChange);
  this.children.push(child);
};
FileTree.prototype.removeAllChildren = function() {
  this.children.forEach(function(child) {
    child.stop();
  });
  this.children = [];
};
FileTree.prototype.branch = function() {
  var self = this,
      newChild;
  this.removeAllChildren();
  if (this.file) {
    // File asset
    if(!this.fileExists()) return;
    this[this.data.type]();
  }
  else {
    // Non-file asset
    this.data.sourcePaths.forEach(function(sourcePath) {
      var fileName = path.join(self.data.dir, self.data.sourceRoot, sourcePath);
      newChild = new FileTree(self.data, fileName);
      self.addChild(newChild);
    });
  }
};
FileTree.prototype.javascript = function() {
  // JS doesn't branch
};
FileTree.prototype.stylus = function() {
  var self = this;
  var dir = path.dirname(this.file);
  var file = fs.readFileSync(this.file, 'utf-8');
  var imports = file.match(/@import '(.*)'/g);
  imports && imports.forEach(function(imported) {
    var first = imported.indexOf("'") + 1;
    var last = imported.lastIndexOf("'");
    var fileName = imported.slice(first, last);
    fileName += (path.extname(fileName) === '') ? '.styl' : '';
    fileName = path.join(dir, fileName);
    self.addChild(new FileTree(self.data, fileName));
  });
};
FileTree.prototype.jade = function() {
  var self = this;
  var dir = path.dirname(this.file);
  var file = fs.readFileSync(this.file, 'utf-8');
  var extended = file.match(/extends (.*)/g);
  extended && extended.forEach(function(extend) {
    var fileName = extend.slice(8);
    fileName += (path.extname(fileName) === '') ? '.jade' : '';
    fileName = path.join(dir, fileName);
    self.addChild(new FileTree(self.data, fileName));
  });
  var included = file.match(/include (.*)/g);
  included && included.forEach(function(include) {
    var fileName = include.slice(8);
    fileName += (path.extname(fileName) === '') ? '.jade' : '';
    fileName = path.join(dir, fileName);
    self.addChild(new FileTree(self.data, fileName));
  });
};


function Asset(name, data) {
  var self = this;
  this.rebuild = _.debounce(this.rebuild, 2000, true);
  EventEmitter.call(this);
  this.name = name;
  this.data = data;
  this.fileTree = new FileTree(this.data);
  this.fileTree.on('change', function() {
    self.emit('change', self.name);
  });
}

util.inherits(Asset, EventEmitter);


function Root(file) {
  this.onChange = _.bind(this.onChange, this);
  this.onJsonChange = _.bind(this.onJsonChange, this);
  EventEmitter.call(this);
  this.file = file;
  this.children = [];
  this.watch();
  this.branch();
}

util.inherits(Root, EventEmitter);

Root.prototype.watch = function() {
  try {
    fs.watch(this.file, this.onJsonChange);
  }
  catch (e) {
    log('error', 'unable to access ' + this.file);
    process.exit();
  }
};

Root.prototype.onChange = function(name) {
  names = name ? [name] : undefined;
  this.emit('change', names);
};

Root.prototype.onJsonChange = function() {
  this.emit('change');
};

Root.prototype.addChild = function(child) {
  child.on('change', this.onChange);
  this.children.push(child);
};

Root.prototype.removeAllChildren = function() {
  this.children.forEach(function(child) {
    child.removeAllListeners();
  });
  this.children = [];
};

Root.prototype.branch = function() {
  var self = this;
  this.removeAllListeners();
  var dir = path.dirname(this.file);
  var assets = require(this.file);
  Object.keys(assets).forEach(function(name) {
    var asset = assets[name];
    asset.dir = dir;
    self.addChild(new Asset(name, asset));
  });
};


module.exports = function watch(root, config) {
  config = config || {};
  var file = path.join(root, 'mason.json');

  var rootWatcher = new Root(file);
  rootWatcher.on('change', rebuild);
  rebuild();

  function rebuild(names) {
    try {
      build(root, config, names);
    } catch(e) {
      var fileName = (names && names.length > 0) ? names[0] : '';
      log('error', 'building file ' + fileName);
      console.log(e.stack);
    }
  }
};

