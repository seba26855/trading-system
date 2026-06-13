const { RSI } = require("technicalindicators");

function calculateRSI(values) {
  if (!values || values.length < 14) return [];
  return RSI.calculate({
    values,
    period: 14
  });
}

module.exports = { calculateRSI };