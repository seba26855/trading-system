const express = require("express");
const cors = require("cors");
const path = require("path");

const scannerRoute =
  require("./src/routes/scanner");

const {
  getCandles,
  getCloses
} = require("./src/data/market");

const {
  generateSignal
} = require("./src/strategy/signalEngine");

const {
  TradingBot
} = require("./src/core/bot");

const app = express();

app.use(cors());

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

const bot = new TradingBot(1000);

// ======================
// DATA API
// ======================
app.get("/data", async (req, res) => {
  try {
    const symbol =
      req.query.symbol ||
      "BTCUSDT";

    const closes =
      await getCloses(
        symbol,
        "5m",
        250
      );

    const analysis =
      generateSignal(closes);

    bot.updateMarket({
      symbol,
      price:
        analysis.indicators.price,
      signal:
        analysis.signal
    });

    const trend =
      analysis.indicators.ema50 &&
      analysis.indicators.ema200
        ? (
            (
              (analysis.indicators.ema50 -
                analysis.indicators.ema200) /
              analysis.indicators.ema200
            ) * 100
          )
        : 0;

    res.json({
      symbol,

      price:
        analysis.indicators.price,

      signal:
        analysis.signal,

      score:
        analysis.confidence,

      marketState:
        analysis.marketState,

      summary:
        analysis.summary,

      recommendation:
        analysis.recommendation,

      nextMove:
        analysis.nextMove,

      reasons:
        analysis.reasons,

      opportunities:
        analysis.opportunities,

      risks:
        analysis.risks,

      probabilities:
        analysis.probabilities,

      trend,

      rsi:
        analysis.indicators.rsi,

      ema20:
        analysis.indicators.ema20,

      ema50:
        analysis.indicators.ema50,

      ema200:
        analysis.indicators.ema200,

      macd:
        analysis.indicators.macd,

      volatility:
        analysis.indicators
          .volatility,

      analysis: {
        confidence:
          analysis.confidence,

        regime:
          analysis.regime,

        risk:
          analysis
            .indicators
            .volatility > 3
            ? "HIGH"
            : analysis
                .indicators
                .volatility > 1.5
            ? "MEDIUM"
            : "LOW"
      },

      bot:
        bot.getStatus(
          analysis.indicators
            .price
        ),

      time:
        new Date().toISOString()
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// ======================
// CHART API
// ======================
app.get("/chart", async (req, res) => {
  try {
    const symbol =
      req.query.symbol ||
      "BTCUSDT";

    const candles =
      await getCandles(
        symbol,
        "5m",
        300
      );

    res.json(
      candles.map((c) => ({
        time:
          Math.floor(
            c.openTime / 1000
          ),

        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      }))
    );

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// ======================
// BOT STATS
// ======================
app.get("/stats", (req, res) => {
  res.json(
    bot.getStatus()
  );
});

app.use(
  "/scanner",
  scannerRoute
);

// ======================
// HEALTH CHECK
// ======================
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    uptime:
      process.uptime(),
    time:
      new Date().toISOString()
  });
});

// ======================
// START SERVER
// ======================
const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `🚀 Trading System running on http://localhost:${PORT}`
  );
});