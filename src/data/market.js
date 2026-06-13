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
console.log("BYBIT RESPONSE:");
console.log(body);

try {
resolve(JSON.parse(body));
} catch (error) {
reject(error);
}
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

const response = await request(url);

if (
!response ||
!response.result ||
!Array.isArray(response.result.list)
) {
throw new Error("Invalid Bybit response");
}

return response.result.list
.reverse()
.map((item) => ({
openTime: Number(item[0]),
open: Number(item[1]),
high: Number(item[2]),
low: Number(item[3]),
close: Number(item[4]),
volume: Number(item[5]),
closeTime: Number(item[0])
}));
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
