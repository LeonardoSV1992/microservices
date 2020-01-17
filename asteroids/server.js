const express = require('express');
const app = express();
const PORT = 8080; 
const axios = require('axios'); //Library to make requests
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
const tracer = initTracer("ASTEROIDS TRACK");

app.get('/', (req, res) =>{res.send("Running Asteroids");})

app.get('/asteroids', (req, res)=>{
  const span = tracer.startSpan("GET ASTEROIDS");
    axios({
        "method":"POST",
        "url":"https://nasaapidimasv1.p.rapidapi.com/getAsteroidStats",
        "headers":{
        "content-type":"application/x-www-form-urlencoded",
        "x-rapidapi-host":"NasaAPIdimasV1.p.rapidapi.com",
        "x-rapidapi-key":"4827a92862msh393b9bee7c6849bp17b355jsn7e13a250abc7"
        },"data":{
          "apiKey":"EUoqbdCEjXmpgas4o9X4UcNgoAsUGUtZ2XS7kdg7"
        }
        })
        .then((response)=>{
          console.log(response.data.contextWrites.to);
          res.send(response.data.contextWrites.to);
          span.finish();
        })
        .catch((error)=>{
          console.log(error);
          span.finish();
        })
})

app.listen(PORT, ()=>{console.log("Running, I am able on port "+PORT);})