var mason = require('../../index');

mason.build(__dirname, {
  'page.js': 'uglify'
}, ['page.js', 'test.html']);