const MissionUtils = require('@woowacourse/mission-utils');
const App = require('../src/App');
const BridgeMaker = require('../src/BridgeMaker');

const mockQuestions = (answers) => {
  MissionUtils.Console.readLine = jest.fn();
  answers.reduce((acc, input) => {
    return acc.mockImplementationOnce((_, callback) => {
      callback(input);
    });
  }, MissionUtils.Console.readLine);
};

const mockRandoms = (numbers) => {
  MissionUtils.Random.pickNumberInRange = jest.fn();
  numbers.reduce((acc, number) => {
    return acc.mockReturnValueOnce(number);
  }, MissionUtils.Random.pickNumberInRange);
};

const getLogSpy = () => {
  const logSpy = jest.spyOn(MissionUtils.Console, 'print');
  logSpy.mockClear();
  return logSpy;
};

const getOutput = (logSpy) => {
  return [...logSpy.mock.calls].join('');
};

const runException = (inputs) => {
  mockQuestions(inputs);
  const logSpy = getLogSpy();
  const app = new App();

  app.play();

  expectLogContains(getOutput(logSpy), ['[ERROR]']);
};

const expectLogContains = (received, logs) => {
  logs.forEach((log) => {
    expect(received).toEqual(expect.stringContaining(log));
  });
};

const expectBridgeOrder = (received, upside, downside) => {
  const upsideIndex = received.indexOf(upside);
  const downsideIndex = received.indexOf(downside);

  expect(upsideIndex).toBeLessThan(downsideIndex);
};

describe('다리 건너기 테스트', () => {
  test('다리 생성 테스트', () => {
    const randomNumbers = [1, 0, 0];
    const mockGenerator = randomNumbers.reduce((acc, number) => {
      return acc.mockReturnValueOnce(number);
    }, jest.fn());

    const bridge = BridgeMaker.makeBridge(3, mockGenerator);
    expect(bridge).toEqual(['U', 'D', 'D']);
  });

  test('기능 테스트', () => {
    const logSpy = getLogSpy();
    mockRandoms([1, 0, 1]);
    mockQuestions(['3', 'U', 'D', 'U']);

    const app = new App();
    app.play();

    const log = getOutput(logSpy);
    expectLogContains(log, [
      '최종 게임 결과',
      '[ O |   | O ]',
      '[   | O |   ]',
      '게임 성공 여부: 성공',
      '총 시도한 횟수: 1',
    ]);
    expectBridgeOrder(log, '[ O |   | O ]', '[   | O |   ]');
  });

  test('예외 테스트', () => {
    runException(['a']);
  });

  test('예외 테스트2 - U,D가 아닌 입력을 했을 경우', () => {
    runException(['3,R']);
  });

  test('기능 테스트2 - 게임 재시작 후 결과 성공', () => {
    const logSpy = getLogSpy();
    mockRandoms([1, 1, 0]);
    mockQuestions(['3', 'U', 'D', 'R', 'U', 'U', 'D']);

    const app = new App();
    app.play();

    const log = getOutput(logSpy);
    expectLogContains(
      log,
      [
        '[ O ]',
        '[   ]',
        '[ O |   ]',
        '[   | X ]',
        '[ O ]',
        '[   ]',
        '[ O | O ]',
        '[   |   ]',
        '[ O | O |   ]',
        '[   |   | O ]',
      ],
      [
        '최종 게임 결과',
        '[ O | O |   ]',
        '[   |   | O ]',
        '게임 성공 여부: 성공',
        '총 시도한 횟수: 2',
      ],
    );
    expectBridgeOrder(log, '[ O | O |   ]', '[   |   | O ]');
  });

  test('기능 테스트2 - 게임 재시작 후 결과 실패', () => {
    const logSpy = getLogSpy();
    mockRandoms([1, 1, 0]);
    mockQuestions(['3', 'U', 'D', 'R', 'U', 'U', 'U', 'Q']);

    const app = new App();
    app.play();

    const log = getOutput(logSpy);
    expectLogContains(
      log,
      [
        '[ O ]',
        '[   ]',
        '[ O |   ]',
        '[   | X ]',
        '[ O ]',
        '[   ]',
        '[ O | O ]',
        '[   |   ]',
        '[ O | O | X ]',
        '[   |   |   ]',
      ],
      [
        '최종 게임 결과',
        '[ O | O |   ]',
        '[   |   | O ]',
        '게임 성공 여부: 실패',
        '총 시도한 횟수: 2',
      ],
    );
    expectBridgeOrder(log, '[ O | O | X ]', '[   |   |   ]');
  });
});
