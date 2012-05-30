# Mason

Simple static-file build system for jade, stylus, and JavaScript.

Includes express plugin for easily rendering built-or-debug HTML, CSS, and JS.

### Why?

You have a dozen site-wide platform dependencies that you want to package in `platform.js`.
You have per-page JS assets that you want to package in `page-name.js` files.
During development, you need all of these assets to be included as separate, uncompiled files with line numbers.
During production, you need to flip a switch to minify all these files and include them in the right places.
You want to easily generate static html and css from jade and stylus.

## Add mason to your project
```shell
  $ npm install mason
```

## Build static files
```javascript
  var mason = require('mason');
  mason.build(__dirname, {
    'page.js': 'uglify'
  });
```
(mason.json resides in __dirname)

## Use mason in an express app
```javascript
  var app = express(),
      config = {
        'platform.js': 'uglify',
        'page.js': 'debug'
      };
  app.locals(mason.locals(__dirname, config));
```

## Render a mason asset within a view
```jade
!!! 5
html
  head
    != mason('platform.js')
```

## Specify build targets (mason.json)

**base:** Tells mason.build() where to put your compiled files

**src:** Used by mason.locals() to render URLs (eg, /compiled/platform.js instead of /work/project/public/compiled/platform.js)

```json
{
  "platform.js": {
    "type": "javascript",
    "source": {
      "base": "public",
      "src": [
        "vendor/underscore-1.3.3.js",
        "vendor/knockout-2.0.0.js"
      ]
    },
    "dest": {
      "base": "public",
      "src": "compiled/platform.js"
    }
  },

  "page.js": {
    "type": "javascript",
    "source": {
      "base": "public",
      "src": [
        "js/a.js",
        "js/b.js"
      ]
    },
    "dest": {
      "base": "public",
      "src": "compiled/page.js"
    }
  },

  "global.css": {
    "type": "stylus",
    "source": "styles/global.styl",
    "dest": {
      "base": "public",
      "src": "compiled/global.css"
    }
  },

  "test.html": {
    "type": "jade",
    "source": "views/test.jade",
    "dest": {
      "base": "public",
      "src": "test.html"
    }
  }
}
```