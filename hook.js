/*globals whisk */
/*eslint-env node, worker*/

var request = require('request');
var mustache = require('mustache');
var hooksUrl = "https://{{api}}/v1/pipeline/pipelines/{{pipelineId}}/hooks";

function main(params) {
  if (!params.endpoint) {
    throw new Error("Missing OpenWhisk endpoint API URL");
  } 
  if (!params.api) {
    throw new Error("Missing Pipeline API URL");
  }
  if (!params.auth) {
    throw new Error("Missing Authorization Info");
  }
  if (!params.pipelineId) {
    throw new Error("Missing pipeline id");
  }

  var lifecycleEvent = params.lifecycleEvent;
  var triggerName = params.triggerName.split("/");
  var whiskCallbackUrl = 'https://' + whisk.getAuthKey() + "@" + params.endpoint + '/api/v1/namespaces/' + triggerName[1] + '/triggers/' + triggerName[2];
  var options;

  if (lifecycleEvent === 'CREATE') {
    options = {
      url: mustache.render(hooksUrl, params),
      method: "post",
      headers: {
        "Authorization": params.auth
      },
      json: true,
      body: {
          "label": null,
          "token": params.triggerName,
          "url": params.proxy ? params.proxy + "/" + encodeURIComponent(whiskCallbackUrl): whiskCallbackUrl,
          "enabled": true,
          "sslEnabled": false
      }
    };
    return _req(options).then(function(json) {
      return json;
    });
  } else if (lifecycleEvent === 'DELETE') {
    options = {
      url: mustache.render(hooksUrl, params),
      method: "get",
      headers: {
        "Authorization": params.auth
      },
      json: true
    };
    return _req(options).then(function(json) {
      var hooks = json;
      var calls = [];
      hooks.forEach(function(hook) {
        if (hook.token === params.triggerName) {
          var p = _req({
            url: options.url + "/" + hook.id,
            method: "delete",
            headers: {
              "Authorization": params.auth
            }
          });
          calls.push(p);
          
       }
      });
      return Promise.all(calls).then(function(){
        return {};
      });
    });
  }
  console.log(lifecycleEvent + " not implemented.");
}

function _req(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}