const COLORS = require('./colors.js');

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
    this.modalText.text("To place a pixel, you need to send 0.001 ETH (about $1.30). This transaction will consume about 45,000 gas.");

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
    this.modalText.text("Your transaction was created successfully!  You should see your pixel update in a few minutes, depending on how busy the Ethereum network is.  Your transaction ID is: " + tx_hash);

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