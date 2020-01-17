const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');
var bunyan = require('bunyan');
const bunyanMiddleware = require('bunyan-middleware')
const logger = bunyan.createLogger({ name: 'My App' })
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});
app.use(bunyanMiddleware(
    { headerName: 'X-Request-Id'
    , propertyName: 'reqId'
    , logName: 'req_id'
    , obscureHeaders: []
    , logger: logger
    , additionalRequestFinishData: function(req, res) {
        return { example: true }
      }
    }
  ));
  var initJaegerTracer = require("jaeger-client").initTracer;
  function initTracer(serviceName) {
  var config = {
  serviceName: serviceName,
  sampler: {
      type: "const",
      param: 1,
  },
  reporter: {
      logSpans: true,
      agentHost: 'localhost'
  },
  };
  var options = {
  logger: {
      info: function logInfo(msg) {
      console.log("Information Level", msg);
      },
      error: function logError(msg) {
      console.log("Error Level", msg);
      },
  },
  };
  return initJaegerTracer(config, options);
}
const opentracing = require("opentracing");
const tracer = initTracer("MAIN TRACK");

app.get('/', (req, res) =>{const span = tracer.startSpan("GET FRONT"); res.sendFile(path.resolve(__dirname, ".", "docs", "frontend.html"));span.finish();})
app.listen(PORT, ()=>{console.log("Running, I am able on port "+PORT);})