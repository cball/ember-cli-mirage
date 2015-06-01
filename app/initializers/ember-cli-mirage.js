import Ember from 'ember';
import ENV from '../config/environment';
import baseConfig, { developmentConfig, testConfig } from '../mirage/config';
import Server from 'ember-cli-mirage/server';
import readModules from 'ember-cli-mirage/utils/read-modules';

let env = ENV.environment;
let isDevelopment = env === 'development';
let isTest = env === 'test';

export default {
  name: 'ember-cli-mirage',
  initialize: function() {
    let addonConfig = ENV['ember-cli-mirage'];

    if (_shouldUseMirage(env, addonConfig)) {
      let server = new Server({
        environment: env
      });

      _loadServerConfig(server);
      _loadServerData(server);
    }
  }
};

/*
  Loads the Mirage server config.
*/
function _loadServerConfig(server) {
  server.loadConfig(baseConfig);

  _loadEnvironmentConfig(server);
}

/*
  Loads an environment specific Mirage config.
*/
function _loadEnvironmentConfig(server) {
  if (isDevelopment) {
    server.loadConfig(developmentConfig);
  } else if (isTest) {
    server.loadConfig(testConfig);
  }
}

/*
  Loads factories or fixtures as server data depending on the
  environment.
*/
function _loadServerData(server) {
  let modulesMap = readModules(ENV.modulePrefix);
  let hasFactories = !Ember.isEmpty(modulesMap['factories']);
  let hasDefaultScenario = modulesMap['scenarios'].hasOwnProperty('default');

  if (isTest && hasFactories) {
    server.loadFactories(modulesMap['factories']);
  } else if (!isTest && hasDefaultScenario && hasFactories) {
    server.loadFactories(modulesMap['factories']);
    modulesMap['scenarios']['default'](server);
  } else {
    server.db.loadData(modulesMap['fixtures']);
  }
}

function _shouldUseMirage(env, addonConfig) {
  let userDeclaredEnabled = typeof addonConfig.enabled !== 'undefined';
  let defaultEnabled = _defaultEnabled(env, addonConfig);

  return userDeclaredEnabled ? addonConfig.enabled : defaultEnabled;
}

/*
  Returns a boolean specifying the default behavior for whether
  to initialize Mirage.
*/
function _defaultEnabled(env, addonConfig) {
  let usingInDev = isDevelopment && !addonConfig.usingProxy;

  return usingInDev || isTest;
}
