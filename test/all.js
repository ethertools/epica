var chai = require("chai"),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    eth = require("../eth")();

chai.should();
chai.use(sinonChai);

describe("Eth", function(){
  describe("getCoinbase", function(){
    it("should return current coinbase", function(done){
      eth.getCoinbase(function(coinbase){
        coinbase.length.should.be.equal(42);
        done();
      });
    });
  });

  describe("getIsListening", function(){
    it("should report if the client is mining", function(done){
      eth.getIsListening(function(isListening){
        isListening.should.be.equal(true);
        done();
      });
    });
  });
  
  describe("getIsMining", function(){
    it("should report if the client is mining", function(done){
      eth.getIsMining(function(isMining){
        isMining.should.be.equal(true);
        done();
      });
    });
  });
});

