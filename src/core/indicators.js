const {
  EMA,
  MACD,
  RSI
} = require("technicalindicators");

function calculateEMA(values, period) {
  if (!Array.isArray(values)) return [];

  if (values.length < period) {
    return [];
  }

  return EMA.calculate({
    values,
    period
  });
}

function getLastEMA(values, period) {
  const ema = calculateEMA(
    values,
    period
  );

  return ema.length
    ? ema.at(-1)
    : null;
}

function calculateRSI(
  values,
  period = 14
) {
  if (!Array.isArray(values)) {
    return [];
  }

  if (values.length < period) {
    return [];
  }

  return RSI.calculate({
    values,
    period
  });
}

function getLastRSI(
  values,
  period = 14
) {
  const rsi = calculateRSI(
    values,
    period
  );

  return rsi.length
    ? rsi.at(-1)
    : null;
}

function calculateMACD(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  if (values.length < 35) {
    return [];
  }

  return MACD.calculate({
    values,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
}

function getLastMACD(values) {
  const macd = calculateMACD(values);

  return macd.length
    ? macd.at(-1)
    : null;
}

module.exports = {
  calculateEMA,
  getLastEMA,

  calculateRSI,
  getLastRSI,

  calculateMACD,
  getLastMACD
};