/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

const COLORS = {
  "white": [0xff, 0xff, 0xff, 0xff],
  "black": [0x22, 0x22, 0x22, 0xff],
  "lightgrey": [0xe4, 0xe4, 0xe4, 0xff],
  "darkgrey": [0x88, 0x88, 0x88, 0xff],
  "yellow": [0xe5, 0xdb, 0x00, 0xff],
  "orange": [0xe7, 0x96, 0x00, 0xff],
  "brown": [0xa2, 0x6b, 0x3e, 0xff],
  "red": [0xe7, 0x00, 0x00, 0xff],
  "pink": [0xff, 0xa5, 0xd1, 0xff],
  "lightpurple": [0xd0, 0x69, 0xe6, 0xff],
  "purple": [0x83, 0x00, 0x81, 0xff],
  "blue": [0x00, 0x00, 0xee, 0xff],
  "teal": [0x00, 0xd3, 0xdf, 0xff],
  "skyblue": [0x00, 0x82, 0xca, 0xff],
  "green": [0x00, 0xc0, 0x00, 0xff],
  "lightgreen": [0x92, 0xe2, 0x35, 0xff],
}

const INT_TO_COLOR = [
  COLORS["white"],
  COLORS["black"],
  COLORS["lightgrey"],
  COLORS["darkgrey"],
  COLORS["yellow"],
  COLORS["orange"],
  COLORS["brown"],
  COLORS["red"],
  COLORS["pink"],
  COLORS["lightpurple"],
  COLORS["purple"],
  COLORS["blue"],
  COLORS["teal"],
  COLORS["skyblue"],
  COLORS["green"],
  COLORS["lightgreen"],
]

module.exports = {
  COLORS: COLORS,
  INT_TO_COLOR: INT_TO_COLOR
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const COLORS = __webpack_require__(0);

class TransactionFlow {
  constructor(canvas, pixelStorage) {
    var that = this;
    this.modal = $('#modal');
    this.modalHeading = $('#modal-heading');
    this.modalText = $('#modal-text');
    this.state = 'not_started';
    this.canvas = canvas;
    this.pixelStorage = pixelStorage;
  }

  start(pixelX, pixelY, colorIndex) {
    // TODO: add support for any web3 provider (see which ones work with existing code)
    if (typeof web3.currentProvider.isMetaMask == 'undefined') {
      this.modalHeading.text("Please install MetaMask");
      this.modalText.text("MetaMask is a digital wallet which enables your web browser to interact with the Ethereum network.");
      this.modal.show();
      $('#metamask-button-wrapper').show();
      this.state = 'missing_metamask';
      this.showCloseButton();
      return false;
    }

    this.modalHeading.text("Placing a pixel");
    this.modalText.text("To place a pixel, you need to send 0.001 ETH (about $1.20), plus the gas fee (about 40,000 gas).");

    this.modal.show();
    $('#send-button').show();
    $('#cancel-button').show();

    this.state = 'started';
    this.canvas.updatePixel(pixelX, pixelY, colorIndex);

    var that = this;

    $('#send-button').on('click', function() {
      that.pixelStorage.sendPixelUpdate(that.canvas.pixelIndex(pixelX, pixelY), colorIndex, function(err, tx_hash) {
        if (err) {
          return that.metaMaskError(err)
        }

        that.transactionCreated(tx_hash)
      });
    });

    $('#cancel-button').on('click', function() {
      that.kill();
    });
  }

  metaMaskError(error) {
    this.modalHeading.text("Transaction failed");
    this.modalText.text("It looks like you cancelled the transaction, or there was a problem.  Please make sure your MetaMask wallet is unlocked.");
    this.showCloseButton();
  }

  transactionCreated(tx_hash) {
    this.modalHeading.text("Transaction created");
    this.modalText.text("Your transaction was created successfully!  You should see your pixel update in less than 5 minutes.");

    this.showCloseButton();
  }

  showCloseButton() {
    $('#cancel-button').hide();
    $('#send-button').hide();
    $('#close-button').show();

    const that = this;
    $('#close-button').on('click', function() {
      that.kill();
    });
  }

  kill() {
    this.modal.hide();
    this.state = 'killed';

    $('#cancel-button').off();
    $('#send-button').off();
    $('#close-button').off();

    $('#close-button').hide();
    $('#send-button').hide();
    $('#cancel-button').hide();
  }
}

module.exports = TransactionFlow;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const pixelStorage = __webpack_require__(3);
const TransactionFlow = __webpack_require__(1);
const Canvas = __webpack_require__(4);
const hooks = __webpack_require__(5);
const COLORS = __webpack_require__(0);

function main() {
  const state = {
    currentColor: 14,
    cursorX: 0,
    cursorY: 0,
    draggingMouse: false,
    scale: 4.0,
    translateX: 500,
    translateY: 500,
    lastBlockNumber: 0,
    transactionFlow: null
  }

  const canvas = new Canvas(1000, $("#canvas")[0]);
  // canvas.setRandomData();

  pixelStorage.getCanvasData(function(err, packedInts, lastBlockNumber) {
    const unpackedInts = pixelStorage.unpackUIntArray(packedInts);
    canvas.setDataFromInts(unpackedInts);
    state.lastBlockNumber = lastBlockNumber;
    $('#block-number').text(state.lastBlockNumber);
    setupHooks(state, canvas, pixelStorage);
  });

  hooks.initializeStateFromHash(state);
}

function setupHooks(state, canvas, pixelStorage) {
  $(document).ready(function() {
    hooks.setupAnimationHook(state, canvas);
    hooks.setupZoomHooks(state);
    hooks.setupPanHooks(state);
    hooks.setupHoverHook();
    hooks.setupPalette(state);
    hooks.setupHighlightHook(state);
    hooks.disableScroll();
    hooks.setupCanvasClickHook(state, canvas, pixelStorage);
    hooks.setupHashUpdater(state);
    hooks.setupCanvasChangePoller(state, pixelStorage, canvas);
    window.scrollTo(0, 0);
  });
}

main()

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const PIXEL_STORAGE_ADDRESS = '0xead504431dcc01142c0b9cdb9367b57932672079';
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
  req.open("GET", "https://api.cryptopaint.co/pixels", true);
  req.responseType = "arraybuffer";

  req.onload = function(oEvent) {
    const byteArray = new Uint8Array(req.response);
    const lastBlockNumber = parseInt(req.getResponseHeader('X-Last-Updated-Block'), 16);
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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const COLORS = __webpack_require__(0);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

class Canvas {
  constructor(width, element) {
    this.width = width;
    this.canvas = element;
    this.context = this.canvas.getContext('2d');
    this.data = null;
    this.imageData = null;
  }

  setRandomData() {
    this.data = this._randomColorArray(this.width);
  }

  setDataFromInts(ints) {
    var array = new Uint8ClampedArray(this.width * this.width * 4);

    for (var x = 0; x < this.width * this.width; x++) {
      array.set(COLORS.INT_TO_COLOR[ints[x]], x * 4);
    }

    this.data = array;
  }

    // var dataArray = new Uint8ClampedArray([
    //   255, 166, 82, 255,
    //   255, 166, 82, 255,
    //   255, 166, 82, 255,
    //   255, 166, 82, 255]);

  draw() {
    if (this.imageData == null) {
      this.imageData = new ImageData(this.data, this.width, this.width);
    }
    this.context.putImageData(this.imageData, 0, 0);
  }

  drawHighlight(x, y, colorIndex) {
    if (x >= this.width || y >= this.width) {
      return;
    }

    const color = COLORS.INT_TO_COLOR[colorIndex];
    this.context.fillStyle = 'rgba(' + color.join(',') +')';
    this.context.fillRect(x, y, 1, 1);
  }

  updatePixel(x, y, colorIndex) {
    const offset = this._arrayOffset(x,y);
    this.data.set(COLORS.INT_TO_COLOR[colorIndex], offset);
  }

  getPixelColor(x, y) {
    const offset = this._arrayOffset(x,y);
    return this.data.slice(offset, offset + 4);
  }

  pixelIndex(x, y) {
    return y * this.width + x;
  }

  indexToCoordinates(index) {
    const x = index % this.width;
    const y = Math.floor(index / this.width);
    return [x, y];
  }

  _arrayOffset(x, y) {
    return (y * this.width * 4) + x * 4;
  }

  _randomColorArray(width) {
    var array = new Uint8ClampedArray(width * width * 4);

    for (var x = 0; x < width * width; x++) {
      var color = COLORS.INT_TO_COLOR[getRandomInt(0, 16)];
      array.set(color, x * 4);
    }
    return array;
  }
}

module.exports = Canvas;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const COLORS = __webpack_require__(0);
const MIN_SCALE = 4.0;
const MAX_SCALE = 50.0;
const POLL_INTERVAL_MS = 5000;
const TransactionFlow = __webpack_require__(1);

function initializeStateFromHash(state) {
  const hash = window.location.hash;
  const matches = hash.match(/^#scale=(\d+)&x=(\d+)&y=(\d+)$/);

  if (matches == null) {
    return;
  }

  state.scale = parseInt(matches[1]);
  state.translateX = -1 * parseInt(matches[2]);
  state.translateY = -1 * parseInt(matches[3]);

  setScale(state.scale);
  setTranslate(state.translateX, state.translateY);
}

function setupHashUpdater(state) {
  setInterval(function() {
    window.location.hash =
      "scale=" + state.scale +
      "&x=" + -1 *  Math.round(state.translateX) +
      "&y=" + -1 *  Math.round(state.translateY);
  }, 500);
}

function setScale(scale) {
  $('#zoom').css({'transform' : 'scale(' + scale +', ' + scale + ')'});
}

function setTranslate(x, y) {
  $('#pan').css({'transform' : 'translate(' + (x+500) +'px, ' + (y+500) + 'px)'});
}

function setupZoomHooks(state) {
  // set up listener to zoom on mousewheel:
  $(document).on('mousewheel', function(event){
    // prevent mousewheel from scrolling page
    event.preventDefault();

    state.scale = Math.round(state.scale + 0.5 * event.deltaY);

    // enforce bounds:
    if (state.scale < MIN_SCALE) {
      state.scale = MIN_SCALE;
    } else if (state.scale > MAX_SCALE) {
      state.scale = MAX_SCALE;
    }

    setScale(state.scale);
  });
}

function setupPanHooks(state) {
  // click-to-drag logic:
  var mousedownX = 0;
  var mousedownY = 0;
  var mousedown = false;

  $(document).on('mousedown', function(event){
    mousedownX = event.clientX;
    mousedownY = event.clientY;
    mousedown = true;
    state.draggingMouse = false;
  });

  $(document).on('mouseup', function(event){
    mousedown = false;
    state.draggingMouse = false;
  });

  $(document).on('mousemove', function(event){
    if (mousedown == false) {
      return;
    }

    state.draggingMouse = true;

    var currentX = event.clientX;
    var currentY = event.clientY;

    var deltaX = currentX - mousedownX;
    var deltaY = currentY - mousedownY;

    // update last mousedown
    mousedownX = currentX;
    mousedownY = currentY;

    // TODO: set max bounds on translation
    state.translateX = state.translateX + deltaX * 0.3;
    state.translateY = state.translateY + deltaY * 0.3;
    setTranslate(state.translateX, state.translateY);
  });

  $(document).on('keydown', function(event) {
    switch(event.which) {
        case 65: // a
        state.translateX += 1;
        break;

        case 37: // left
        state.translateX += 1;
        break;

        case 87: // w
        state.translateY += 1;
        break

        case 38: // up
        state.translateY += 1;
        break;

        case 68: // d
        state.translateX += -1;
        break;

        case 39: // right
        state.translateX += -1;
        break;

        case 83: // s
        state.translateY += -1;
        break;

        case 40: // down
        state.translateY += -1;
        break;

        default: return; // exit this handler for other keys
    }
    setTranslate(state.translateX, state.translateY);
});
}

function disableScroll() {
  $(document).on('keydown', function(event){
    if([32, 33, 34, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
      event.preventDefault();
    }
  });
}

function setupHoverHook() {
  $("#canvas").on('mousemove', function(event){
    const pixelX = event.offsetX;
    const pixelY = event.offsetY;
    $('#coordinates').text("("+pixelX+", "+pixelY+")");
  });
}

function setupHighlightHook(state) {
  $("#canvas").on('mousemove', function(event){
    state.cursorX = event.offsetX;
    state.cursorY = event.offsetY;
  });
}

function setupPalette(state) {
  // TODO: use React to create these components and maintain state?
  for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
    const newButton = $('.color-button').first().clone();
    newButton.css('background-color', "rgba(" + COLORS.INT_TO_COLOR[colorIndex].join(",") + ")");
    newButton.appendTo($('#palette'));

    const i = colorIndex;
    newButton.on('click', function() {
      state['currentColor'] = i;
    });
  }

  $('.color-button').first().remove();
}

function setupAnimationHook(state, canvas) {
  function drawFrame(timestamp) {
    canvas.draw();
    canvas.drawHighlight(state.cursorX, state.cursorY, state.currentColor);
    window.requestAnimationFrame(drawFrame);
  }

  window.requestAnimationFrame(drawFrame);
}

function setupCanvasClickHook(state, canvas, pixelStorage) {
  $("#canvas").on('mouseup', function(event){
    if (state.draggingMouse == true) {
      return;
    }

    if (state.transactionFlow != null && state.transactionFlow.state !== 'killed') {
      return;
    }

    const pixelX = event.offsetX;
    const pixelY = event.offsetY;

    state.transactionFlow = new TransactionFlow(canvas, pixelStorage);
    state.transactionFlow.start(pixelX, pixelY, state.currentColor);
  });
}

function setupCanvasChangePoller(state, pixelStorage, canvas) {
  setInterval(function() {
    pixelStorage.getPixelUpdatesSince(state.lastBlockNumber, function(err, changes) {
      if (err) {
        return console.log(err);
      }

      changes.forEach(function(change) {
        const coordinates = canvas.indexToCoordinates(change.pixelIndex);
        canvas.updatePixel(coordinates[0], coordinates[1], change.color)
      });

      if (changes.length == 0) {
        return;
      }

      // update lastblock
      const lastBlockNumber = changes[changes.length - 1].blockNumber;
      state.lastBlockNumber = lastBlockNumber;
    });

    $('#block-number').text(state.lastBlockNumber);
  }, POLL_INTERVAL_MS);
}

module.exports = {
  setupZoomHooks: setupZoomHooks,
  setupPanHooks: setupPanHooks,
  disableScroll: disableScroll,
  setupHoverHook: setupHoverHook,
  setupHighlightHook: setupHighlightHook,
  setupPalette: setupPalette,
  setupAnimationHook: setupAnimationHook,
  setupCanvasClickHook: setupCanvasClickHook,
  setupHashUpdater: setupHashUpdater,
  initializeStateFromHash: initializeStateFromHash,
  setupCanvasChangePoller: setupCanvasChangePoller
}

/***/ })
/******/ ]);
//# sourceMappingURL=index.bundle.js.map