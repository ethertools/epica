# Ethereum Programming Interface Client Adaptor

Node library intended to simplify interacting with Ethereum client software via RPC

## Installation

`npm install epica`

## Usage

```
vat epica = require("epica")();

epica.ready.then(function(){
    epica.coinbase(function(coinbase){
        console.log("Our coinbase: " + coinbase); 
    });
});
```