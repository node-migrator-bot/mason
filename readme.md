# Mason

Simple static-file build system for jade, stylus, and JavaScript.

- Express plugin for easily rendering built-or-debug HTML, CSS, and JS.
- Command-line `mason` executable for easily building projects.
- JavaScript API for building from within your own code.

### Why?

You have a dozen site-wide platform dependencies that you want to package in `platform.js`.
You have per-page JS assets that you want to package in `page-name.js` files.
During development, you need all of these assets to be included as separate, uncompiled files with line numbers.
During production, you need to flip a switch to minify all these files and include them in the right places.
You want to easily generate static html and css from jade and stylus.

## Install mason

```shell
  $ npm install -g mason
```
or use package.json's devDependencies:
```json
  "dependencies":{
    "mason":"latest"
  }
```

## Build static files
use the settings in mason.json:
```shell
  $ mason build
```
or using devDependencies:
```shell
  $ node_modules/.bin/mason build
```

## Watch your files
```shell
  $ mason watch
```
(mason is smart about recompiling - it performs the minimum possible build for each file change)
```shell
  $ mason watch -j debug
```

## Render a mason asset within a view
```jade
!!! 5
html
  head
    != mason('platform.js')
```
By default, `mason build` injects compressed (uglified) script tags via the `!= mason()` local.

To inject individual scripts for debugging, use:
```shell
  $ mason build -j debug
```

## mason.json

**base:** Tells mason.build() where to put your compiled files

**src:** Used by mason.locals() to render URLs (eg, /compiled/platform.js instead of /work/project/public/compiled/platform.js)

**renderer:** Specify the default renderer for this asset

**javascript:"** Specify the default renderer for this type of asset

```json
{
  "views": {
    "type": "jade",
    "sourceRoot": "views",
    "sourcePaths": ["test.jade"],
    "destRoot": "public",
    "destPath": "test.html"
  },

  "platform.js": {
    "type": "javascript",
    "sourceRoot": "public",
    "sourcePaths": [
      "vendor/underscore-1.3.3.js",
      "vendor/knockout-2.0.0.js"
    ],
    "destRoot": "public",
    "destPath": "compiled/platform.js"
  },

  "page.js": {
    "type": "javascript",
    "sourceRoot": "public",
    "sourcePaths": [
      "js/a.js",
      "js/b.js"
    ],
    "destRoot": "public",
    "destPath": "compiled/page.js"
  },

  "global.css": {
    "type": "stylus",
    "sourceRoot": "styles",
    "sourcePaths": [ "global.styl" ],
    "destRoot": "public",
    "destPath": "compiled/global.css"
  }
}
```

## JavaScript API

### Build static files
```javascript
  var mason = require('mason');
  mason.build(__dirname, {
    'page.js': 'uglify'
  });
```
(mason.json resides in __dirname)

### Use mason in an express app
```javascript
  var app = express();
  app.locals(mason.locals(__dirname));
```
By default, mason.locals will inject a compressed (uglified) script into your view.

To control how specific assets are injected, use:
```javascript
  var app = express(),
      config = {
        'platform.js': 'uglify',
        'page.js': 'debug'
      };
  app.locals(mason.locals(__dirname, config));
```