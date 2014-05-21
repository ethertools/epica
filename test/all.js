var chai = require("chai"),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    eth = require("../")(),
    should = require("should");

chai.use(should);
chai.use(sinonChai);

describe("Eth", function(){
  beforeEach(function(done){
    eth.ready.then(function(){done();});
  });
  
  describe("coinbase", function(){
    it("should return current coinbase", function(done){
      var cb;
      eth.coinbase(function(coinbase){
        cb = coinbase;
        coinbase.length.should.be.equal(40);
      }).then(function(coinbase){ //just checking that promises work too
        coinbase.should.be.equal(cb);
        done();
      });
    });
  });

  describe("isListening", function(){
    it("should report if the client is mining", function(done){
      eth.isListening(function(isListening){
        isListening.should.be.type("boolean");
        done();
      });
    });
  });
  
  describe("isMining", function(){
    it("should report if the client is mining", function(done){
      eth.isMining(function(isMining){
        isMining.should.be.equal(true);
        done();
      });
    });
  });

  describe("balanceAt", function(){
    var coinbase;
    beforeEach(function(done){
      eth.coinbase(function(cb){
        coinbase = cb;
        done();
      });
    });
    it("returns balance at an address", function(done){
      eth.balanceAt({a: coinbase }).then(function(balance){
        balance.toNumber().should.be.a.Number;
        done();
      });
    });
  });

  describe("block", function(){
    var lastBlock;
    
    beforeEach(function(done){
      eth.lastBlock(function(block){
        lastBlock = block;
        done();
      });
    });

    it("gets a block by hash", function(done){
      eth.block({ a: lastBlock.hash }).then(function(block){
        block.hash.should.be.ok;
        done();
      });
    });
  });


  describe("key", function(){
    it("returns a key", function(done){
      eth.key(function(key){
        key.should.be.ok;
        done();
      });
    });
  });

  describe("keys", function(){
    it("returns keys", function(done){
      eth.keys(function(keys){
        keys.length.should.be.above(0);
        done();
      });
    });
  });

  
});

