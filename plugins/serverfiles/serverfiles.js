/*jshint laxcomma:true */
var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , request = require('request');


    //, serverFiles:  false //{ docsBasePath : "/path/to/docs", docsBaseUrl: "absolute|relative base url", customActions: [ {"display_name","action_to_run"}]
var configFile = path.resolve(__dirname, 'serverfiles-config.json')
  , config = {}
  , scopes = ['wl.basic']
  , isConfigEnabled = false
  , client = null;

if (fs.existsSync(configFile)) {
  config = require(configFile);
  isConfigEnabled = config;
} else if(process.env.serverfiles_docs_base_path!== undefined) {
  config = {
    "docs_base_path": process.env.serverfiles_docs_base_path,
    "docs_base_url": process.env.serverfiles_docs_base_url
  };

  isConfigEnabled = true;
  console.log('ServerFiles config found in environment. Plugin enabled.');

} else {
  config = {
    "docs_base_path": "/path/to_docs"
  , "docs_base_url": "absolute|relative base url"
  , "custom_actions": { "display_name": "action", "other_display_name":"other_action"}
  };
  console.warn('ServerFiles config not found at ' + configFile +
      '. Plugin disabled.');
}

var ServerFiles = {
  isConfigured: isConfigEnabled,
  config: config
};

exports.ServerFiles = ServerFiles;
