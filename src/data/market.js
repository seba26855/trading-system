const https = require("https");

function request(url) {
return new Promise((resolve, reject) => {
https
.get(url, (res) => {
let body = "";

    res.on("data", (chunk) => {
      body += chunk;
    });

    res.on("end", () => {
      resolve(body);
    });
  })
  .on("error", (error) => {
    reject(error);
  });

});
}

async function getCandles(
symbol = "BTCUSDT",
interval = "5",
limit = 200
) {
const url =
"https://api.bybit.com/v5/market/kline" +
`?category=linear` +
`&symbol=${symbol}` +
`&interval=${interval}` +
`&limit=${limit}`;

const raw = await request(url);

console.log("BYBIT RAW RESPONSE:");
console.log(raw);

throw new Error(raw);
}

async function getCloses(
symbol = "BTCUSDT",
interval = "5",
limit = 200
) {
const candles = await getCandles(
symbol,
interval,
limit
);

return candles.map((candle) => candle.close);
}

module.exports = {
getCandles,
getCloses
};
