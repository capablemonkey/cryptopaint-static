'use strict';

const pixelStorage = require('./pixelStorage.js');
const TransactionFlow = require('./transactionFlow.js');
const Canvas = require('./canvas.js');
const hooks = require('./hooks.js');
const COLORS = require('./colors.js');

function main() {
  const state = {
    currentColor: 14,
    cursorX: 0,
    cursorY: 0,
    draggingMouse: false,
    scale: 4.0,
    translateX: -563,
    translateY: -534,
    lastBlockNumber: 0,
    transactionFlow: null
  }

  const canvas = new Canvas(1000, $("#canvas")[0]);

  pixelStorage.getCanvasData(function(err, packedInts, lastBlockNumber) {
    const unpackedInts = pixelStorage.unpackUIntArray(packedInts);
    canvas.setDataFromInts(unpackedInts);
    // canvas.setRandomData();
    state.lastBlockNumber = lastBlockNumber;
    $('#block-number').text(state.lastBlockNumber);

    if (isMobile()) {
      setupMobileHooks(state, canvas, pixelStorage);
    } else {
      setupHooks(state, canvas, pixelStorage);
    };
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

// Mobile is read-only; hide the edit functionality and use touch-based pan and zoom
function setupMobileHooks(state, canvas, pixelStorage) {
  $(document).ready(function() {
    hooks.setupAnimationHook(state, canvas);
    hooks.setupMobileZoomHook(state);
    hooks.setupMobilePanHook(state);
    hooks.setupCanvasChangePoller(state, pixelStorage, canvas);
    window.scrollTo(0, 0);
  });
}

function isMobile() {
  return window.matchMedia("(max-width: 700px)").matches;
}

main()