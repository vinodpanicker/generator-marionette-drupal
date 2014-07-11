'use strict';
//var util = require('util');
//var chalk = require('chalk');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var validDir = require('../helpers/validateDirectory');


var MarionetteDrupalGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous Marionette Drupal generator!'));

    this.log('Out of the box I include HTML5 Boilerplate, jQuery, Backbone.js, Backbone.Drupal, Marionette, Require and Modernizr.');

    var prompts = [{
      type: 'string',
      name: 'appDirectory',
      message: 'Where do you want the app installed?',
      default: 'web'
    },
    { type: 'string',
      name: 'bowerDirectory',
      message: 'Where do you want the Bower components installed?',
      default: 'vendor'
    },
    { type: 'string',
      name: 'templatesDirectory',
      message: 'Where do you want the templates generated inside App Directory?',
      default: 'templates'
    }];

    this.prompt(prompts, function (props) {
      this.appDirectory = props.appDirectory;
      this.bowerDirectory = props.bowerDirectory;
      this.templatesDirectory = props.templatesDirectory;

      this.config.set('appDirectory', this.appDirectory);
      this.config.set('bowerDirectory', this.bowerDirectory);
      this.config.set('templatesDirectory', this.appDirectory + '/' + this.templatesDirectory);

      done();
    }.bind(this));
  },

  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function bower() {
    this.template('bowerrc', '.bowerrc');
    this.copy('_bower.json', 'bower.json');
  },

  jshint: function jshint() {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function editorConfig() {
    this.copy('editorconfig', '.editorconfig');
  },

  gruntfile: function gruntfile() {
    this.template('Gruntfile.js');
  },

  packageJSON: function packageJSON() {
    this.template('_package.json', 'package.json');
  },

  mailStylesheet: function mainStylesheet() {
    this.write(this.appDirectory + '/styles/sass/main.scss', '@import \'bootstrap-sass/lib/bootstrap\';\n\n.hero-unit {\n    margin: 50px auto 0 auto;\n    width: 400px;\n}');
  },

  bootstrapJs: function bootstrapJs() {
    this.copy('bootstrap.js',  this.appDirectory + '/scripts/vendor/bootstrap.js');
  },

  app: function () {
    // App templates
    this.mkdir(this.appDirectory + '/' + this.templatesDirectory);
    this.copy('web/main.html.twig', this.appDirectory + '/' + this.templatesDirectory + '/main.html.twig');

    // App Views
    this.mkdir(this.appDirectory + '/views');
    console.log(this.sourceRoot());
    var ext = 'js';
    var mainView = 'main';
    var baseDir = validDir.getValidatedFolder(this.appDirectory);
    this.template('../../view/templates/view.' + ext, path.join(baseDir + '/views', mainView + '.' + ext), {'name': mainView, 'tmpl': 'main'});

    //App Main HTML
    this.template('web/index.html', this.appDirectory + '/index.html');

    // App JS
    this.mkdir(this.appDirectory + '/scripts');
    this.template('web/init.js', this.appDirectory + '/scripts/init.js');
    this.copy('web/main.js', this.appDirectory + '/scripts/main.js');
    this.copy('web/regionManager.js', this.appDirectory + '/scripts/regionManager.js');
    this.copy('web/application.js', this.appDirectory + '/scripts/application.js');
    this.copy('web/communicator.js', this.appDirectory + '/scripts/communicator.js');

    // Marionette JS Structure
    this.mkdir(this.appDirectory + '/views');
    this.mkdir(this.appDirectory + '/models');
    var ext = 'js';
    var emptyModel = 'empty';
    var baseDir = validDir.getValidatedFolder(this.appDirectory);
    this.template('../../model/templates/model.' + ext, path.join(baseDir + '/models', emptyModel + '.' + ext), {'name': emptyModel });

    // App others
    this.mkdir(this.appDirectory + '/styles');
    this.mkdir(this.appDirectory + '/styles/sass');
    this.mkdir(this.appDirectory + '/styles/fonts');

    this.mkdir(this.appDirectory + '/images');
    this.template('web/404.html');
    this.template('web/favicon.ico');
    this.template('web/robots.txt');
    this.copy('web/htaccess', this.appDirectory + '/.htaccess');

  },

});

module.exports = MarionetteDrupalGenerator;
