/*jshint laxcomma:true */
var server_files = {};
// ServerFiles Module
var ServerFiles = (function() {

  // Sorting regardless of upper/lowercase
  // TODO: Let's be DRY and merge this with the
  // sort method in Github module.
  function _alphaNumSort(m,n) {
    var a = m.toLowerCase();
    var b = n.toLowerCase();
    if (a === b) { return 0; }
    if (isNaN(m) || isNaN(n)) { return (a > b ? 1 : -1); }
    else { return m-n; }
  }

  function _listServerMdFiles(files) {

    var list = '<ul>';

    // Sort alpha
    files.sort(_alphaNumSort);

    files.forEach(function(item) {
      // var name = item.path.split('/').pop()
      list += '<li data-file-name="' + item + '"><a class="delete_server_file"><i class="icon-remove"></i></a><a class="server_file" href="#">' + item + '</a></li>';
    });

    list += '</ul>';

    $('.modal-header h3').text('Your Server Files');

    $('.modal-body').html(list);

    $('#modal-generic').modal({
      keyboard: true
      , backdrop: false
      , show: true
    });

    return false;
  }

  function _listServerMediaFiles(files) {

    var list = '<div><form><input type="file" accept="image/*"><button type="button" class="server_media_file_upload">Upload</button></form></div><ul>';

    // Sort alpha
    files.sort(_alphaNumSort);

    files.forEach(function(item) {
      // var name = item.path.split('/').pop()
      list += '<li data-file-name="' + item + '" ><img class="server_media_file" src="' + window.docs_base_url + item + '" alt="'+ item + '" height="40px" width="40px" /></li>';
    });

    list += '</ul>';

    $('.modal-header h3').text('Your Media Files');

    $('.modal-body').html(list);

    $('#modal-generic').modal({
      keyboard: true
      , backdrop: false
      , show: true
    });

    return false;
  }

  var uploadImage = function(form){
    function _doneHandler(a, b, response) {
      a = b = null;
      response = response.responseText;
      var li =  '<li data-file-name="' + response+ '" ><img class="server_media_file" src="' + window.docs_base_url + response + '" alt="'+ response + '" height="40px" width="40px" /></li>';
      setTimeout(function(){
        $(form).parents("div").next("ul").append(li);
      }, 1000);
    }
    var formData = new FormData();

    var input = $("input[type='file']", form)[0];     
    formData.append("uploadImage", input.files[0]);
    var config = {
      type: 'POST'
      , dataType: 'text'
      , url: '/save/media_file'
      , success: _doneHandler
      , data: formData
      , processData: false
      , contentType: false
    };

    $.ajax(config);
  };
  var getImages = function(){
    function _doneHandler(a, b, response) {
      a = b = null;
      response = JSON.parse(response.responseText);
      // Don't throw error if user has no orgs, still has individual user.
      _listServerMediaFiles(response.files);
    } // end done handler
    var config = {
      type: 'POST'
      , dataType: 'text'
      , url: '/import/media_files'
      , success: _doneHandler
    };

    $.ajax(config);

  };
  var newFile = function() {
    updateFilename("");
    setCurrentFilenameField();
    editor.getSession().setValue("");
  };
  var search = function() {
    function _beforeSendHandler() {
      Notifier.showMessage('Fetching Server files...');
    }

    function _doneHandler(a, b, response) {
      a = b = null;
      response = JSON.parse(response.responseText);
      // Don't throw error if user has no orgs, still has individual user.
      _listServerMdFiles(response.files);

      server_files = response.files;
    } // end done handler

    function _failHandler(resp, err) {
      alert(resp.responseText || "Roh-roh. Something went wrong. :(");
    }

    var config = {
      type: 'POST'
      , dataType: 'text'
      , url: '/import/server_files'
      , beforeSend: _beforeSendHandler
      , error: _failHandler
      , success: _doneHandler
    };

    $.ajax(config);
  };
  var loadFile = function(fileName) {
    function _beforeSendHandler() {
      Notifier.showMessage('Loading Markdown from server...');
    }

    function _doneHandler(a, b, response) {
      a = b = null;
      server_files[fileName] = response.responseText;
      // Don't throw error if user has no orgs, still has individual user.
      editor.getSession().setValue(server_files[fileName]);
      previewMd();
      Github.clear();
      $('#modal-generic').modal('hide');

    } // end done handler

    updateFilename(fileName);
    setCurrentFilenameField();
    var config = {
      type: 'POST'
      , dataType: 'text'
      , url: '/import/server_file'
      , beforeSend: _beforeSendHandler
      , success: _doneHandler
      , data: {
    'filename': fileName
      }
    };

    $.ajax(config);

  };
  var saveFile = function(showNotice) {
    function _doneHandler(a, b, response) {
      a = b = null;
      updateUserProfile(saveObj);

      if((typeof showNotice !== 'object') || showNotice.show !== false) {
        Notifier.showMessage("Markdown saved on server");
      }  
      //$('#modal-generic').modal('hide')
    }
    var fileName = getCurrentFilenameFromField();
    var md = editor.getSession().getValue();
    var saveObj = { server_files: { } };
    saveObj.server_files[fileName] = md;

    var config = {
      type: 'POST'
      , dataType: 'text'
      , url: '/save/server_file'
      , success: _doneHandler
      , data: {
    'filename': fileName,
    data:       md
      }
    };

    $.ajax(config);

  };
  var deleteFile = function(fileName) {
    function _doneHandler(a, b, response) {
      a = b = null;
      updateUserProfile();
      delete server_files[fileName];
      Notifier.showMessage("Document deleted on server");
      //$('#modal-generic').modal('hide')
    }
    var config = {
      type: 'POST'
      , dataType: 'text'
      , url: '/delete/server_file'
      , success: _doneHandler
      , data: {
    'filename': fileName
      }
    };

    $.ajax(config);
  };

  var customAction = function(action) {
    function _failHandler(resp, err) {
      alert(resp.responseText || "Roh-roh. Something went wrong. :(");
    }


    function _doneHandler(a, b, response) {
      a = b = null;
      if((typeof showNotice !== 'object') || showNotice.show !== false) {
        Notifier.showMessage(action + " Executed on server...");
      }  
    }
    var fileName = getCurrentFilenameFromField();
    var config = {
      type: 'POST'
      , dataType: 'text'
      , url: '/server_files/custom_action'
      , success: _doneHandler
      , error: _failHandler
      , data: {
    'filename': fileName,
    'custom_action':  action
      }
    };

    $.ajax(config);

  };
 
  return {
    bindNav: function(){
      $('#new_server_file')
      .on('click', function() {
        $('.dropdown').removeClass('open');
        newFile();
        return false;
      });

      $('#import_media_files')
      .on('click', function() {
        $('.dropdown').removeClass('open');
        getImages();
        return false;
      });

      $('#import_server_file')
      .on('click', function() {
        $('.dropdown').removeClass('open');
        search();
        return false;
      });

      $('#save_server_file')
      .on('click', function() {
        $('.dropdown').removeClass('open');
        saveFile();
        return false;
      });
      $('.server_files-run_custom_action')
      .on('click', function() {
        $('.dropdown').removeClass('open');
        customAction($(this).data("action"));
        return false;
      });
      $(document)
      .on('click', '.server_file', function() {
        var fileName = $(this).parent('li').attr('data-file-name');
        profile.current_filename = $(this).html();
        loadFile(fileName);
        return false;
      })
      .on('click', '.delete_server_file', function() {
        var $parentLi = $(this).parent('li');
        var fileName = $parentLi.attr('data-file-name');
        deleteFile(fileName);
        $parentLi.remove();
        return false;
      })
      .on('click', '.server_media_file', function() {
        var fileName = $(this).parent('li').attr('data-file-name')
        window.ace.edit('editor').insert("![" + fileName + "](" + window.docs_base_url + fileName + ")\n");
        previewMd();
        $('#modal-generic').modal('hide')
        return false
      })
      .on('click', '.server_media_file_upload', function() {
        uploadImage($(this).parents("form"));
        return false;
      });
 
    }
  };
})();

Plugins.register(ServerFiles);
