var spec = require("./spec.json"),
    _ = require("underscore"),
    request = require("request");

require("./ethString");

var m_reqId = 0;
var ret = {};

var m_watching = {};

var methods = _.reduce(spec, function(memo,item){
  memo[item.method] = function(){
    var args = arguments;
    console.log({
        jsonrpc: "2.0",
        method: item.method,
        params: _.reduce(item.order, function(memo, pName, i){
          memo[pName] = pName[0] === "b" ? args[i].unbin() : args[i];
          return memo;
        }, {})
      });
    return request.post({
      url: "http://localhost:8080",
      json: {
        jsonrpc: "2.0",
        method: item.method,
        params: _.reduce(item.order, function(memo, pName, i){
          memo[pName] = pName[0] === "b" ? args[i].unbin() : args[i];
          return memo;
        }, {}),
        id: m_reqId
      }
    },function(err, res){
      if(err){
        console.error(err);
      }
      _.last(args)(res.body);
    });
  };
  return memo;
},{});


module.exports = _.extend({
  check: function(force) {
    if (!force && _.isEmpty(m_watching)) return;
    
    var watching = [];
    for (var w in m_watching)
      watching.push(w)
    var changed = reqSync("check", { "a": watching } );
    //    console.log("Got " + JSON.stringify(changed));
    for (var c in changed)
      m_watching[changed[c]]()
    var that = this;
    setTimeout(function() { that.check() }, 5000)
  },
  watch: function(a, fx, f) {
    var old = isEmpty(m_watching)
    if (f)
      m_watching[a + fx] = f
    else
      m_watching[a] = fx
    (f ? f : fx)();
    if (isEmpty(m_watching) != old)
      this.check();
  },
  unwatch: function(f, fx) {
    delete m_watching[fx ? f + fx : f];
  },
  newBlock: function(f) {
    var old = isEmpty(m_watching)
    m_watching[""] = f
    f()
    if (isEmpty(m_watching) != old)
      this.check()
  }
}, methods);
