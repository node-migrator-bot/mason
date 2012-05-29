var fs = require('node-fs');
var path = require('path');
var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglify;
var stylus = require('stylus');
var jade = require('jade');
var _ = require('underscore')._;

var builders = {
  javascript: buildJavaScript,
  stylus: buildStylus,
  jade: buildJade
};

module.exports = function build(root) {
  var file = path.join(root, 'mason.json');
  var assets = require(file);

  console.log('Mason: building assets in ' + file + '...');
  for (var name in assets) {
    var asset = assets[name];
    var builder = asset && builders[asset.type];
    if (builder) builder(root, name, asset);
  }
};

function concatFiles(files) {
  var total = '';
  for (var i = 0; i < files.length; i++) {
    contents = fs.readFileSync(files[i]);
    total += contents;
  }
  return total;
}

function writeFile(file_path, contents) {
  var dir = path.dirname(file_path);
  fs.mkdirSync(dir, 0777, true);
  fs.writeFileSync(file_path, contents);
}

function compressJS(code) {
  // parse the JS code into AST
  var ast = jsp.parse(code);
  // mangle names
  ast = pro.ast_mangle(ast);
  // compress
  ast = pro.ast_squeeze(ast);
  // generate JS from the compressed AST
  return pro.gen_code(ast);
}

function buildJavaScript(root, name, asset) {
  var sourceFiles = _.map(asset.source.src, function(src) {
    return path.join(root, asset.source.base, src);
  });
  var destFile = path.join(root, asset.dest.base, asset.dest.src);

  console.log(' -> ' + destFile);
  var code = concatFiles(sourceFiles);
  var compressed = compressJS(code);
  writeFile(destFile, compressed);
}

function buildStylus(root, name, asset) {
  var sourceFile = path.join(root, asset.source);
  var destFile = path.join(root, asset.dest.base, asset.dest.src);

  console.log(' -> ' + destFile);
  var contents = fs.readFileSync(sourceFile, 'utf-8');
  stylus(contents)
    .set('filename', sourceFile)
    .render(function(err, css) {
      if (err) throw err;
      writeFile(destFile, css);
    });
}

function buildJade(root, name, asset) {
  var sourceFile = path.join(root, asset.source);
  var destFile = path.join(root, asset.dest.base, asset.dest.src);

  console.log(' -> ' + destFile);
  var contents = fs.readFileSync(sourceFile, 'utf-8');
  var fn = jade.compile(contents, {
    filename: sourceFile
  });
  writeFile(destFile, fn());
}