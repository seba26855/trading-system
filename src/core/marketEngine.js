// src/core/marketEngine.js

function calculateTrend(prices, period = 5) {
  if (prices.length < period) return 0;
  const recent = prices.slice(-period);
  return ((recent.at(-1) - recent[0]) / recent[0]) * 100;
}

function calculateScore({ rsi, trend, volatility }) {
  // Score base 0–100
  let score = 50;

  // RSI
  if (rsi !== null) {
    if (rsi < 30) score += 20; // ipervenduto → BUY
    else if (rsi > 70) score -= 20; // ipercomprato → SELL
  }

  // Trend
  if (trend > 0) score += 10; // trend positivo
  else if (trend < 0) score -= 10;

  // Volatilità
  if (volatility > 100) score -= 10; // troppo rischioso
  else if (volatility < 50) score += 5; // stabile → più sicuro

  // Limita 0–100
  score = Math.max(0, Math.min(100, score));
  return score;
}

function generateSignal(score) {
  if (score >= 65) return "BUY";
  if (score <= 35) return "SELL";
  return "HOLD";
}

module.exports = { calculateTrend, calculateScore, generateSignal };