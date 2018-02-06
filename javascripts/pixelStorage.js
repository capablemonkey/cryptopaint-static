'use strict';

const PIXEL_STORAGE_ADDRESS = '0xb92d13833f9044eb0c14893a4bb4cb009c209beb';
const CONTRACT_ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "packedBytes",
    "outputs": [
      {
        "name": "",
        "type": "bytes1"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getAll",
    "outputs": [
      {
        "name": "",
        "type": "bytes1[500000]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "index",
        "type": "uint32"
      },
      {
        "indexed": false,
        "name": "color",
        "type": "uint8"
      }
    ],
    "name": "PixelUpdate",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "index",
        "type": "uint32"
      },
      {
        "name": "color",
        "type": "uint8"
      }
    ],
    "name": "set",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "setFee",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "startingFeeWei",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  }
];

var pixelStorage = null;

window.addEventListener('load', function() {
  if (typeof window.web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    window.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/metamask'));
  }

  pixelStorage = new window.web3.eth.Contract(CONTRACT_ABI, PIXEL_STORAGE_ADDRESS);
});

function sendPixelUpdate(pixelIndex, colorIndex, callback) {
  // TODO: check web3.isConnected() before attempting this transaction

  // hack to get selected address from metamask (web3.js 1.0 breaks the default way)
  const address = web3.givenProvider.publicConfigStore._state.selectedAddress

  pixelStorage.methods.set(pixelIndex, colorIndex).
    send({from: address, value: 1000000000000000}, function(err, transactionHash) {
      if (err) {
        console.log(err);
        return callback(err);
      }

      console.log("sent tx!", transactionHash);
      callback(null, transactionHash);
  });
}

function sortLogs(logs) {
  // sort by blockNumber and transactionIndex
  return logs.
    sort(function(a, b){
      if (a.blockNumber === b.blockNumber) {
        // if two logs have the same block, order by transactionIndex:
        return (a.transactionIndex < b.transactionIndex) ? -1 : 1;
      } else {
        return (a.blockNumber < b.blockNumber) ? -1 : 1;
      }
    })
}

function getPixelUpdatesSince(blockNumber, callback) {
  // order = blockindex + transactionIndex + logIndex
  pixelStorage.getPastEvents('PixelUpdate', {fromBlock: blockNumber, toBlock: 'latest'}, function(err, logs){
    if (err) {
      callback(err);
    }

    const changes = logs.map(function(log){
      return {
        blockNumber: log.blockNumber,
        transactionIndex: log.transactionIndex,
        logIndex: log.logIndex,
        pixelIndex: log.returnValues['index'],
        color: log.returnValues['color']
      };
    });

    callback(null, sortLogs(changes));
  });
}

// Pack 2 positive 4-bit integers into 8 bits
// pack(0b0100, 0b1011) => 0x01001011
function pack(a, b) {
  return a << 4 | b;
}

function unpack(byte) {
  const left = (byte >>> 4) & 0xf;
  const right = byte & 0xf;
  return [left, right];
}

function unpackUIntArray(packedInts) {
  var unpackedInts = [];

  packedInts.forEach(function(packedInt) {
    const unpacked = unpack(packedInt);
    unpackedInts.push(unpacked[0]);
    unpackedInts.push(unpacked[1]);
  });

  return unpackedInts;
}

function getCanvasData(callback) {
  const req = new XMLHttpRequest();

  // req.open("GET", "https://api.cryptopaint.co/pixels", true);
  req.open("GET", "/pixels_cached_0x4c2c10", true);

  req.responseType = "arraybuffer";

  req.onload = function(oEvent) {
    const byteArray = new Uint8Array(req.response);
    // const lastBlockNumber = parseInt(req.getResponseHeader('X-Last-Updated-Block'), 16);
    const lastBlockNumber = parseInt("0x4c2c10", 16);
    console.log(lastBlockNumber)
    callback(null, byteArray, lastBlockNumber);
  };

  req.send(null);
}

module.exports = {
  sendPixelUpdate: sendPixelUpdate,
  getPixelUpdatesSince: getPixelUpdatesSince,
  unpackUIntArray: unpackUIntArray,
  getCanvasData: getCanvasData
}
