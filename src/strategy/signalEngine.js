const {
  getLastEMA,
  getLastRSI,
  getLastMACD
} = require("../core/indicators");

function calculateVolatility(closes) {

  if (!closes || closes.length < 2) {
    return 0;
  }

  let sum = 0;

  for (
    let i = 1;
    i < closes.length;
    i++
  ) {

    const change =
      Math.abs(
        (closes[i] - closes[i - 1]) /
        closes[i - 1]
      );

    sum += change;
  }

  return (
    (sum / closes.length) *
    100
  );

}

function generateSignal(closes) {

  const price = closes.at(-1);

  const ema20 = getLastEMA(closes, 20);
  const ema50 = getLastEMA(closes, 50);
  const ema200 = getLastEMA(closes, 200);

  const rsi = getLastRSI(closes);
  const macd = getLastMACD(closes);

  const volatility =
    calculateVolatility(closes);

  let confidence = 0;

  const reasons = [];

  // TREND

  if (ema20 && price > ema20) {
    confidence += 15;
    reasons.push("Prezzo sopra EMA20");
  }

  if (ema50 && price > ema50) {
    confidence += 20;
    reasons.push("Prezzo sopra EMA50");
  }

  if (ema200 && price > ema200) {
    confidence += 25;
    reasons.push("Prezzo sopra EMA200");
  }

  const bullish =
    ema50 &&
    ema200 &&
    ema50 > ema200;

  const bearish =
    ema50 &&
    ema200 &&
    ema50 < ema200;

  if (bullish) {
    confidence += 15;
    reasons.push(
      "Trend primario rialzista"
    );
  }

  if (bearish) {
    confidence -= 10;
    reasons.push(
      "Trend primario ribassista"
    );
  }

  // RSI

  if (rsi) {

    if (
      rsi >= 50 &&
      rsi <= 65
    ) {

      confidence += 10;

      reasons.push(
        "Momentum equilibrato"
      );

    } else if (
      rsi > 65 &&
      rsi <= 75
    ) {

      confidence += 5;

      reasons.push(
        "Momentum forte"
      );

    } else if (rsi > 75) {

      confidence -= 10;

      reasons.push(
        "Possibile ipercomprato"
      );

    } else if (rsi < 35) {

      confidence -= 5;

      reasons.push(
        "Momentum debole"
      );

    }

  }

  // MACD

  if (
    macd &&
    macd.MACD !== undefined &&
    macd.signal !== undefined
  ) {

    if (
      macd.MACD >
      macd.signal
    ) {

      confidence += 10;

      reasons.push(
        "MACD rialzista"
      );

    } else {

      confidence -= 10;

      reasons.push(
        "MACD ribassista"
      );

    }

  }

  // VOLATILITY

  confidence -=
    volatility * 5;

  confidence = Math.round(
    confidence
  );

  confidence = Math.max(
    0,
    Math.min(
      95,
      confidence
    )
  );

  // SIGNAL

  let signal = "HOLD";

  if (
    bullish &&
    confidence >= 75
  ) {
    signal = "BUY";
  }

  if (
    bearish &&
    confidence <= 30
  ) {
    signal = "SELL";
  }

  // MARKET STATE

  let marketState =
    "LATERALE";

  if (bullish) {
    marketState =
      "TREND RIALZISTA";
  }

  if (bearish) {
    marketState =
      "TREND RIBASSISTA";
  }

  // AI TEXT

  let summary =
    "Mercato neutrale.";

  let recommendation =
    "Attendere conferme.";

  let nextMove =
    "Monitorare il trend.";

  if (signal === "BUY") {

    summary =
      "Gli indicatori mostrano una struttura favorevole ai compratori.";

    recommendation =
      "Valutare opportunità long con gestione del rischio.";

    nextMove =
      "Monitorare la continuazione del trend.";

  }

  if (signal === "SELL") {

    summary =
      "La pressione ribassista prevale.";

    recommendation =
      "Evitare esposizione long aggressiva.";

    nextMove =
      "Attendere segnali di inversione.";

  }

  return {

    signal,

    confidence,

    marketState,

    summary,

    recommendation,

    nextMove,

    reasons,

    regime:
      bullish
        ? "BULLISH"
        : bearish
        ? "BEARISH"
        : "SIDEWAYS",

    indicators: {

      price,

      rsi,

      ema20,

      ema50,

      ema200,

      macd:
        macd?.MACD ?? null,

      volatility

    }

  };

}
module.exports = {
  generateSignal
};