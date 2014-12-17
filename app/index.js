'use strict';
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

    this.backendServer = this.config.get('backendServer');
    this.backendPort = this.config.get('backendPort');
    this.backendCORS = this.config.get('backendCORS');

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
    },
    { type: 'string',
      name: 'modelsDirectory',
      message: 'Where do you want the models generated inside App Directory?',
      default: 'models'
    },
    { type: 'string',
      name: 'collectionsDirectory',
      message: 'Where do you want the collections generated inside App Directory?',
      default: 'collections'
    },
    { type: 'string',
      name: 'viewsDirectory',
      message: 'Where do you want the views generated inside App Directory?',
      default: 'views'
    },
    { type: 'string',
      name: 'formsDirectory',
      message: 'Where do you want the forms generated inside App Directory?',
      default: 'forms'
    },
    { type: 'string',
      name: 'actionsDirectory',
      message: 'Where do you want the controller actions generated inside App Directory?',
      default: 'actions'
    },
    { type: 'confirm',
      name: 'backendVersion',
      message: 'Your Backend server is Drupal 8 ?',
    },
    { type: 'string',
      name: 'backendServer',
      message: 'What is your Drupal Backend URL (include protocol)?',
      default: this.backendServer ? this.backendServer: 'http://example.com'
    },
    { type: 'string',
      name: 'backendPort',
      message: 'What is your Drupal Backend Port?',
      default: this.backendPort ? this.backendPort: '80'
    },
    { type: 'confirm',
      name: 'backendCORS',
      message: 'Enable Cross-origin resource sharing (CORS)?',
      default: this.backendCORS
    },
    { when: function (response) {
        return response.backendCORS;
      },
      type: 'string',
      name: 'backendUser',
      message: 'What is your Backend user?',
    },
    {when: function (response) {
        return response.backendCORS;
      },
      type: 'password',
      name: 'backendPassword',
      message: 'What is your Backend password?',
    }
    ];

    this.prompt(prompts, function (props) {
      this.appDirectory = props.appDirectory;
      this.bowerDirectory = props.bowerDirectory;
      this.templatesDirectory = props.templatesDirectory;
      this.viewsDirectory = props.viewsDirectory;
      this.formsDirectory = props.formsDirectory;
      this.modelsDirectory = props.modelsDirectory;
      this.collectionsDirectory = props.collectionsDirectory;
      this.actionsDirectory = props.actionsDirectory;
      this.backendVersion = props.backendVersion;
      this.backendServer = props.backendServer;
      this.backendPort = props.backendPort;
      this.backendCORS = props.backendCORS;
      this.backendUser = props.backendUser;
      this.backendPassword = props.backendPassword;

      var authToken = new Buffer(this.backendUser + ':' + this.backendPassword).toString('base64');
      this.config.set('backendServer', this.backendServer);
      this.config.set('backendAuthToken', authToken);
      this.config.set('backendPort', this.backendPort);
      this.config.set('backendCORS', this.backendCORS);
      this.config.set('appDirectory', this.appDirectory);
      this.config.set('bowerDirectory', this.bowerDirectory);
      this.config.set('templatesDirectory', this.appDirectory + '/' + this.templatesDirectory);
      this.config.set('modelsDirectory', this.appDirectory + '/' + this.modelsDirectory);
      this.config.set('collectionsDirectory', this.appDirectory + '/' + this.collectionsDirectory);
      this.config.set('viewsDirectory', this.appDirectory + '/' + this.viewsDirectory);
      this.config.set('formsDirectory', this.appDirectory + '/' + this.formsDirectory);
      this.config.set('actionsDirectory', this.appDirectory + '/' + this.actionsDirectory);

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

  jasmine: function jasmine() {
    this.mkdir(this.appDirectory + '/test/lib');
    this.copy('run-jasmine.js', 'test/lib/run-jasmine.js');
  },

  packageJSON: function packageJSON() {
    this.template('_package.json', 'package.json');
  },

  mailStylesheet: function mainStylesheet() {
    this.write(this.appDirectory + '/styles/sass/main.scss', '@import \'bootstrap-sass/lib/bootstrap\';\n\n.hero-unit {\n    margin: 50px auto 0 auto;\n    width: 400px;\n}');
  },

  app: function () {
    // App templates
    this.mkdir(this.appDirectory + '/' + this.templatesDirectory);
    this.copy('web/home.html.twig', this.appDirectory + '/' + this.templatesDirectory + '/home.html.twig');

    // App Views
    this.mkdir(this.appDirectory + '/views');
    console.log(this.sourceRoot());
    var ext = 'js';
    var mainView = 'home';
    var baseDir = validDir.getValidatedFolder(this.appDirectory);
    this.template('../../view/templates/view.' + ext, path.join(baseDir + '/views', mainView + '.' + ext), {'name': mainView, 'tmpl': 'home'});

    //App Main HTML
    this.template('web/index.html', this.appDirectory + '/index.html');

    // App JS
    this.mkdir(this.appDirectory + '/scripts');
    this.template('web/init.js', this.appDirectory + '/scripts/init.js');
    this.copy('web/main.js', this.appDirectory + '/scripts/main.js');
    this.copy('web/regionManager.js', this.appDirectory + '/scripts/regionManager.js');
    this.template('web/application.js', this.appDirectory + '/scripts/application.js');
    this.copy('web/communicator.js', this.appDirectory + '/scripts/communicator.js');
    this.copy('web/router.js', this.appDirectory + '/scripts/router.js');

    // Marionette JS Structure
    this.mkdir(this.appDirectory + '/' + this.viewsDirectory);
    this.mkdir(this.appDirectory + '/' + this.formsDirectory);
    this.mkdir(this.appDirectory + '/' + this.modelsDirectory);
    this.mkdir(this.appDirectory + '/' + this.collectionsDirectory);
    this.mkdir(this.appDirectory + '/' + this.actionsDirectory);

    var emptyModel = 'empty';
    baseDir = validDir.getValidatedFolder(this.appDirectory);
    this.template('../../model/templates/model.' + ext, path.join(baseDir + '/' + this.modelsDirectory, emptyModel + '.' + ext), {'name': emptyModel, 'backbone_model': ''});

    // App others
    this.mkdir(this.appDirectory + '/styles');
    this.mkdir(this.appDirectory + '/styles/sass');
    this.mkdir(this.appDirectory + '/styles/fonts');

    this.mkdir(this.appDirectory + '/images');
    this.template('web/404.html');
    this.template('web/favicon.ico');
    this.template('web/robots.txt');
    this.copy('web/htaccess', this.appDirectory + '/.htaccess');

    // Store actions controllers with his route
    this.routes = [
      {route: '', action: 'home', 'regions': ['contentRegion'], 'views': ['home']}
    ];
    this.config.set('actions', this.routes);

    // Store regions
    this.regions = [
      {name: 'mainMenuRegion', id: '#main-menu-region'},
      {name: 'contentRegion', id: '#content-region'},
      {name: 'footerRegion', id: '#footer-region'}
    ];
    this.config.set('regions', this.regions);

    // Generate regions for application
    this.template('../../region/templates/regions.js', this.appDirectory + '/scripts/regions.js');

    // Generate home controller action
    this.Action = {'action': 'home', 'views': ['home'], 'regions': ['contentRegion']};
    this.template('../../action/templates/action.' + ext, path.join(baseDir + '/' + this.actionsDirectory, this.Action.action + '.' + ext));

    // Generate controller for application
    this.template('web/controller.js', this.appDirectory + '/scripts/controller.js');

    // Generate routes for application
    this.template('web/routes.js', this.appDirectory + '/scripts/routes.js');

    // Jasmine Test unit folders
    this.mkdir(this.appDirectory + '/test/spec/models');
    this.mkdir(this.appDirectory + '/test/spec/collections');
    this.mkdir(this.appDirectory + '/test/spec/templates');
    this.mkdir(this.appDirectory + '/test/spec/views');
  },

});

module.exports = MarionetteDrupalGenerator;
