const InputView = require('./InputView');
const OutputView = require('./OutputView');

class App {
  play() {
    OutputView.printStart();
    InputView.readBridgeSize();
  }
}

module.exports = App;
const app = new App();
app.play();
