'use strict';

const COLORS = require('./colors.js');
const MIN_SCALE = 4.0;
const MAX_SCALE = 50.0;
const POLL_INTERVAL_MS = 5000;

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
      "&x=" + -1 * Math.round(state.translateX) +
      "&y=" + -1 * Math.round(state.translateY);
  }, 500);
}

function setScale(scale) {
  $('#zoom').css({'transform' : 'scale(' + scale +', ' + scale + ')'});
}

function setTranslate(x, y) {
  $('#pan').css({'transform' : 'translate(' + x +'px, ' + y + 'px)'});
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

    const pixelX = event.offsetX;
    const pixelY = event.offsetY;
    canvas.updatePixel(pixelX, pixelY, COLORS.INT_TO_COLOR[state.currentColor]);
    pixelStorage.sendPixelUpdate(canvas.pixelIndex(pixelX, pixelY), state.currentColor);
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
        canvas.updatePixel(coordinates[0], coordinates[1], COLORS.INT_TO_COLOR[change.color])
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

function setupModal() {
  // $('#wat').on('click', function() {
  //   $('#modal').toggle();
  // });

  // $('#close-button').on('click', function() {
  //   $('#modal').toggle();
  // });
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
  setupCanvasChangePoller: setupCanvasChangePoller,
  setupModal: setupModal
}