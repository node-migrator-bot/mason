# Mason

Simple static-file build system for jade, stylus, and JavaScript.

Includes express plugin for easily rendering HTML, CSS, and JS in both development and production.

Express middleware for rendering the HTML, CSS, and JS (debug or compiled).

## Build static files (mason.json resides in __dirname)
```javascript
  var mason = require('mason');
  mason.build(__dirname);
```

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
    ...
```

## Specify build targets (in mason.json)
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