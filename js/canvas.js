'use strict';
const COLORS = require('./colors.js');

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

  updatePixel(x, y, color) {
    const offset = this._arrayOffset(x,y);
    this.data.set(color, offset);
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