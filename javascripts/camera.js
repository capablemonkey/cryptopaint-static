class Camera {
  constructor() {

  }

  setTranslate(x, y) {
    $('#pan').css({'transform' : 'translate(' + (x+500) +'px, ' + (y+500) + 'px)'});
  }

  setScale(scale) {
    $('#zoom').css({'transform' : 'scale(' + scale +', ' + scale + ')'});
  }
}

module.exports = Camera;