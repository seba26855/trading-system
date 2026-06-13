const https = require("https");

function request(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(new Error("Invalid JSON response"));
        }
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

async function getCandles(
  symbol = "BTCUSDT",
  interval = "5m",
  limit = 200
) {
  const url =
    `https://api.binance.com/api/v3/klines` +
    `?symbol=${symbol}` +
    `&interval=${interval}` +
    `&limit=${limit}`;

  const data = await request(url);

  if (!Array.isArray(data)) {
    throw new Error(
      data.msg || "Invalid Binance response"
    );
  }

  return data.map((c) => ({
    openTime: c[0],
    open: Number(c[1]),
    high: Number(c[2]),
    low: Number(c[3]),
    close: Number(c[4]),
    volume: Number(c[5]),
    closeTime: c[6]
  }));
}

async function getCloses(
  symbol = "BTCUSDT",
  interval = "5m",
  limit = 200
) {
  const candles = await getCandles(
    symbol,
    interval,
    limit
  );

  return candles.map((c) => c.close);
}

module.exports = {
  getCandles,
  getCloses
};