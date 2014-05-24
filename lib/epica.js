var _ = require("underscore"),
    requesto = require("requesto"),
    when = require("when"),
    ethString = require("./ethString"),
    big = require("./bignumber"),
    net = require("net");

var unhexify = function(x){
  if(_.isArray(x)) return _.map(x, unhexify);

  return (_.isString(x) && x.indexOf("0x") === 0) ? x.slice(2) : x;
};

var transformParam = function(key, val){
  return ({
    a: function(s){ return "0x" + s; },
    b: ethString.unbin.bind(ethString)
  }[key[0]] || function(){ return val; })(val);
};

var transformResult = function(proc,val){
  return ({
    balanceAt: function(x){ return big(x.slice(2) || 0, 16); }
  }[proc] || function(){
    return unhexify(val);
  })(val);
};

var initOverHttp = function(epica,opt){
  var url = opt.host || "http://localhost:8080";
  
  return requesto.get(url).then(function(res){
    var spec = JSON.parse(res.body);

    if(!spec.length) throw new Error("No procedures found!");
    
    _.each(spec, function(proc){
      epica[proc.method] = function(params){
        var procArgs = arguments;
        
        if(_.difference(_.keys(params), _.keys(proc.params)).length){
          throw new Error("Passed params " + JSON.stringify(params) + " don't match the spec" +
                          JSON.stringify(proc.params));
        }
        
        return requesto.post({
          url: url,
          json: {
            jsonrpc: "2.0",
            id: null,
            method: proc.method,
            params: _.reduce(params, function(memo, val, key){
              memo[key] = transformParam(key,val);

              return memo;
            }, {})
          }
        }).then(function(res){ 
          if(res.body.error) throw new Error(res.body.error);

          var result = transformResult(proc.method, res.body.result);

          if(_.isFunction(_.last(procArgs))) _.last(procArgs)(result);

          return result;
        });
      };
    });
  });
};

var initRpcMethods = function(epica, opt){
  return initOverHttp(epica, opt).catch(function(err){
    if(err.code == "ECONNREFUSED") console.log("Couldn't connect to the RPC server");

    console.trace(err);
  });
};

var initStaticMethods = function(epica){
  var lastBlock = {};
  
  if(!epica.lastBlock) throw new Error("lastBlock method not defined");

  var newBlockWatchers = [];

  setTimeout(function(){
    epica.lastBlock(function(block){
      if(block.hash !== lastBlock.hash) _.each(newBlockWatchers, function(fn){
        fn(block);
      });
    });
  },1000);

  _.extend(epica, {
    onNewBlock: function(cb){
      var watcher = when.defer(),
          watchFn;
      
      newBlockWatchers.push(watchFn = function(block){
        if(_.isFunction(cb)) cb(block);
        watcher.resolve(block);
      });

      return _.extend(watcher.promise, {
        stop: function(){
          newBlockWatchers = _.without(newBlockWatchers, watchFn);
        }
      });
    }
  });
};


module.exports = function(opt){
  var deferred = when.defer();
  var epica = {ready: deferred.promise, isReady: false, ethString: ethString};
  opt = opt || {};
  
  initRpcMethods(epica, opt)
    .then(function(){initStaticMethods(epica, opt);})
    .then(function(){
      epica.isReady = true;
      deferred.resolve(epica);
    }).catch(function(err){
      console.trace(err);
      deferred.reject(err);
    });
  
  return epica; 
};
