const express = require("express");

const {
  getCloses
} = require("../data/market");

const {
  generateSignal
} = require("../strategy/signalEngine");

const router = express.Router();

const SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "ADAUSDT"
];

function calculateRank(analysis) {

  let rank =
    analysis.confidence;

  const rsi =
    analysis.indicators.rsi ?? 50;

  const volatility =
    analysis.indicators.volatility ?? 0;

  // RSI ideale tra 50 e 70
  if (rsi >= 50 && rsi <= 70) {
    rank += 10;
  }

  // ipercomprato
  if (rsi > 75) {
    rank -= 15;
  }

  // troppo debole
  if (rsi < 40) {
    rank -= 10;
  }

  // penalità volatilità
  rank -= volatility * 2;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(rank)
    )
  );
}

function getStrength(score) {

  if (score >= 90)
    return "VERY STRONG";

  if (score >= 75)
    return "STRONG";

  if (score >= 60)
    return "MODERATE";

  return "WEAK";
}

router.get("/", async (req, res) => {

  try {

    const results = [];

    for (const symbol of SYMBOLS) {

      const closes =
        await getCloses(
          symbol,
          "5m",
          250
        );

      const analysis =
        generateSignal(closes);

      const score =
        calculateRank(
          analysis
        );

      results.push({

        symbol,

        rank: 0,

        score,

        strength:
          getStrength(
            score
          ),

        signal:
          analysis.signal,

        marketState:
          analysis.marketState,

        price:
          Number(
            analysis
              .indicators
              .price
              .toFixed(4)
          ),

        rsi:
          Number(
            analysis
              .indicators
              .rsi
              .toFixed(2)
          ),

        volatility:
          Number(
            analysis
              .indicators
              .volatility
              .toFixed(2)
          )
      });
    }

    results.sort(
      (a, b) =>
        b.score - a.score
    );

    results.forEach(
      (item, index) => {
        item.rank =
          index + 1;
      }
    );

    res.json(results);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
});

module.exports = router;