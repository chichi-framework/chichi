// package metadata file for Meteor.js

Package.describe({
  name: 'chichi:chichi', // https://atmospherejs.com/chichi-framework/chichi
  summary: 'The most popular front-end framework for Stylus',
  version: '0.1.0-beta3',
  git: 'https://github.com/chichi-framework/chichi.git'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.addFiles([
    'dist/css/chichi.css',
    'dist/js/chichi.js'
  ], 'client');
});
