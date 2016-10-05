/*eslint-env node, worker*/

var request = require('request');
var mustache = require('mustache');
var stagesUrl = "https://{{api}}/v1/pipeline/pipelines/{{pipelineId}}/stages";
var runUrl = "https://{{api}}/v1/pipeline/pipelines/{{pipelineId}}/stages/{{stageId}}/executions";

function main(params) {
  if (!params.api) {
    throw new Error("Missing Pipeline API URL");
  }
  if (!params.auth) {
    throw new Error("Missing Authorization Info");
  }
  if (!params.pipelineId) {
    throw new Error("Missing pipeline id");
  }
  console.log(params);
  if (!params.stageId) {
    return _req({
      url: mustache.render(stagesUrl, params),
      headers: {
        "Authorization": params.auth
      }
    }).then(function(body) {
      var stages = JSON.parse(body);
      if (!stages.length) {
        return; // no stages so do nothing
      }
      params.stageId = stages[0].id;
      return main(params);
    });
  }
  return _req({
    url: mustache.render(runUrl, params),
    method: "post",
    headers: {
      "Authorization": params.auth
    }
  }).then(function(body) {
    return JSON.parse(body);
  });
}

function _req(options) {
  console.log(options)
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log(body);
        resolve(body);
      } 
    });   
  });
}