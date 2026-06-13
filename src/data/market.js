const https = require("https");

function request(url) {
return new Promise((resolve, reject) => {
const req = https.get(url, (res) => {
let data = "";

```
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
```

});
}

async function getCandles(
symbol = "BTCUSDT",
interval = "5",
limit = 200
) {
const url =
`https://api.bybit.com/v5/market/kline` +
`?category=linear` +
`&symbol=${symbol}` +
`&interval=${interval}` +
`&limit=${limit}`;

const data = await request(url);

if (
!data.result ||
!Array.isArray(data.result.list)
) {
throw new Error(
data.retMsg || "Invalid Bybit response"
);
}

return data.result.list
.reverse()
.map((c) => ({
openTime: Number(c[0]),
open: Number(c[1]),
high: Number(c[2]),
low: Number(c[3]),
close: Number(c[4]),
volume: Number(c[5]),
closeTime: Number(c[0])
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

return candles.map((c) => c.close);
}

module.exports = {
getCandles,
getCloses
};
