/*jshint laxcomma:true */
var express = require('express')
  , app = module.exports = express()
  , ServerFiles = require('./serverfiles.js').ServerFiles
  , config = ServerFiles.config
  , fs = require('fs')
  , glob = require('glob')
  , exec = require('child_process').exec
  , path = require('path');

var import_server_files = function(req, res){
  glob(config.docs_base_path + "/!(node_modules|dillinger)**/*.md", function(err, files){
    glob(config.docs_base_path + "/*.md", function(err, file){
      res.send({
        files:file.concat(files).map(function(mdFile){
          return mdFile.replace(config.docs_base_path + "/", "");
        })
      });
    });
  });
};

var load_server_file = function(req, res){
  var path = config.docs_base_path + "/" +  req.body.filename;

  fs.readFile(path, function(err, file){
    return res.send("text/text", file.toString().replace("(/media", "(" + config.docs_base_url + "/media"));
  });
};

var save_server_file = function(req, res){
  var data = req.body.data.replace(config.docs_base_url, "");
  var filename = req.body.filename;
  fs.writeFile(config.docs_base_path + "/" +  filename, data, function(err){
    res.send(200);
  });
};

var delete_server_file = function(req, res){
  fs.unlink(config.docs_base_path + "/" +  req.body.filename, function(err){
    res.send(200);
  });
};

var import_media_files = function(req, res){
  glob(config.docs_base_path + "/media/**/*.!(md|yaml)", function(err, files){
    res.send({
      files:files.map(function(mdFile){
        return mdFile.replace(config.docs_base_path + "/", "");
      })
    });
  });
};

var upload_media_file = function(req, res){
  fs.readFile(req.files.uploadImage.path, function (err, data) {
    var newPath = config.docs_base_path + "/media/" + req.files.uploadImage.name;
    fs.writeFile(newPath, data, function (err) {
      res.send(200, "media/" + req.files.uploadImage.name);
    });
  });
};

var custom_action = function(req, res){
  var customAction = req.body.custom_action;
  if (!config.custom_actions){
    return res.send(500, "No custom actions defined");
  }
  if (!customAction){
    return res.send(500, "Custom action not given");
  }
  if (!config.custom_actions[customAction]){
    return res.send(500, "Custom action '" + customAction + "' not defined");
  }
  var filename = config.docs_base_path + "/" + req.body.filename;
  exec(config.custom_actions[customAction] + " " + filename, function(error, stdout, stderr){
    if (error){
      return res.send(500, error.toString());
    }
    if (stderr){
      return res.send(500, stderr);
    }

    res.send(200, stdout);
  });
};



/* Begin ServerFiles */
app.post('/import/server_files', import_server_files);

app.post('/import/server_file', load_server_file);

app.post('/save/server_file', save_server_file);

app.post('/delete/server_file', delete_server_file);

app.post('/import/media_files', import_media_files);

app.post('/save/media_file', upload_media_file);

app.post('/server_files/custom_action', custom_action);

app.get('/js/serverfiles.js', function(req, res) {
  fs.readFile(path.join(__dirname, 'client.js'), 'utf8', function(err, data) {
    if (err) {
      res.send(500, "Sorry couldn't read file")
    }
    else {
      res.setHeader('content-type', 'text/javascript');
      res.send(200, data)
    }
  })
})
 
/* End ServerFiles */
