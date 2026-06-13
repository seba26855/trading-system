const https = require("https");

function request(url) {
return new Promise((resolve, reject) => {
https
.get(url, (res) => {
let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  })
  .on("error", reject);

});
}

async function getCandles(
symbol = "BTCUSDT",
interval = "5m",
limit = 200
) {
const pair = "XBTUSDT";

const url =
`https://api.kraken.com/0/public/OHLC` +
`?pair=${pair}` +
`&interval=5`;

const response = await request(url);

if (
!response ||
!response.result
) {
throw new Error("Invalid Kraken response");
}

const key = Object.keys(
response.result
).find(
(k) => k !== "last"
);

if (!key) {
throw new Error(
"Kraken pair not found"
);
}

const rows =
response.result[key]
.slice(-limit);

return rows.map((c) => ({
openTime:
Number(c[0]) * 1000,
open:
Number(c[1]),
high:
Number(c[2]),
low:
Number(c[3]),
close:
Number(c[4]),
volume:
Number(c[6]),
closeTime:
Number(c[0]) * 1000
}));
}

async function getCloses(
symbol = "BTCUSDT",
interval = "5m",
limit = 200
) {
const candles =
await getCandles(
symbol,
interval,
limit
);

return candles.map(
(c) => c.close
);
}

module.exports = {
getCandles,
getCloses
};
