'use strict';

const pixelStorage = require('./pixelStorage.js');
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
    translateX: 0,
    translateY: 0,
    lastBlockNumber: 0
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
    hooks.setupModal();
    window.scrollTo(0, 0);
  });
}

main()