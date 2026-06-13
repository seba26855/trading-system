let currentSymbol = "BTCUSDT";

// =============================
// CHART
// =============================

const chart = LightweightCharts.createChart(
  document.getElementById("chart"),
  {
    layout: {
      background: {
        color: "#0f1724"
      },
      textColor: "#d7dfec"
    },

    grid: {
      vertLines: {
        color: "#1c2535"
      },
      horzLines: {
        color: "#1c2535"
      }
    },

    rightPriceScale: {
      borderColor: "#243041"
    },

    timeScale: {
      borderColor: "#243041",
      timeVisible: true
    },

    width:
      document.getElementById(
        "chart"
      ).clientWidth,

    height: 520
  }
);

const candleSeries =
  chart.addSeries(
    LightweightCharts.CandlestickSeries,
    {
      upColor: "#00ff9d",
      downColor: "#ff4d6d",

      borderUpColor: "#00ff9d",
      borderDownColor: "#ff4d6d",

      wickUpColor: "#00ff9d",
      wickDownColor: "#ff4d6d"
    }
  );

window.addEventListener(
  "resize",
  () => {
    chart.applyOptions({
      width:
        document.getElementById(
          "chart"
        ).clientWidth
    });
  }
);

// =============================
// LOAD CHART
// =============================

async function loadChart() {
  try {
    const res = await fetch(
      `/chart?symbol=${currentSymbol}`
    );

    const data = await res.json();

    candleSeries.setData(data);

  } catch (err) {
    console.error(err);
  }
}

// =============================
// UPDATE DASHBOARD
// =============================

async function updateDashboard() {

  try {

    const res = await fetch(
      `/data?symbol=${currentSymbol}`
    );

    const data = await res.json();

    console.log(data);

    // =====================
    // HERO
    // =====================

    document.getElementById(
      "heroSymbol"
    ).innerText =
      data.symbol;

    document.getElementById(
      "heroPrice"
    ).innerText =
      "$" +
      Number(data.price).toLocaleString(
        "it-IT",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );

    // =====================
    // SIGNAL
    // =====================

    const signalEl =
      document.getElementById(
        "signal"
      );

    signalEl.innerText =
      data.signal;

    signalEl.className =
      "signal-value " +
      (
        data.signal === "BUY"
          ? "buy"
          : data.signal === "SELL"
          ? "sell"
          : "hold"
      );

    // =====================
    // SCORE
    // =====================

    document.getElementById(
      "score"
    ).innerText =
      data.score + "%";

    document.getElementById(
      "confidenceFill"
    ).style.width =
      data.score + "%";

    // =====================
    // REGIME
    // =====================

    document.getElementById(
      "regime"
    ).innerText =
      data.analysis.regime;

    // =====================
    // RISK
    // =====================

    document.getElementById(
      "risk"
    ).innerText =
      data.analysis.risk;

    // =====================
    // SUMMARY
    // =====================

    document.getElementById(
      "summary"
    ).innerText =
      data.summary ||
      "Nessuna analisi disponibile.";

    document.getElementById(
      "recommendation"
    ).innerText =
      data.recommendation ||
      "-";

    // =====================
    // METRICS
    // =====================

    document.getElementById(
      "rsi"
    ).innerText =
      data.rsi
        ? data.rsi.toFixed(2)
        : "-";

    document.getElementById(
      "ema20"
    ).innerText =
      data.ema20
        ? data.ema20.toFixed(0)
        : "-";

    document.getElementById(
      "ema50"
    ).innerText =
      data.ema50
        ? data.ema50.toFixed(0)
        : "-";

    document.getElementById(
      "ema200"
    ).innerText =
      data.ema200
        ? data.ema200.toFixed(0)
        : "-";

    document.getElementById(
      "volatility"
    ).innerText =
      data.volatility
        ? data.volatility.toFixed(2)
        : "-";

    // =====================
    // REASONS
    // =====================

    const reasons =
      document.getElementById(
        "reasons"
      );

    reasons.innerHTML = "";

    if (
      data.reasons &&
      data.reasons.length
    ) {

      data.reasons.forEach(
        (reason) => {

          const li =
            document.createElement(
              "li"
            );

          li.innerText =
            reason;

          reasons.appendChild(
            li
          );

        }
      );

    } else {

      const li =
        document.createElement(
          "li"
        );

      li.innerText =
        "Nessuna motivazione disponibile.";

      reasons.appendChild(
        li
      );

    }

    // =====================
    // BOT
    // =====================

    if (data.bot) {

      document.getElementById(
        "balance"
      ).innerText =
        "$" +
        data.bot.balance;

      document.getElementById(
        "equity"
      ).innerText =
        "$" +
        data.bot.equity;

      document.getElementById(
        "pnl"
      ).innerText =
        "$" +
        data.bot.pnl;

      document.getElementById(
        "winrate"
      ).innerText =
        data.bot.winrate +
        "%";

      document.getElementById(
        "trades"
      ).innerText =
        data.bot.trades;

    }

  } catch (err) {

    console.error(err);

  }

}

// =============================
// SYMBOL SELECTOR
// =============================

document
  .querySelectorAll(
    ".asset-btn"
  )
  .forEach((btn) => {

    btn.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".asset-btn"
          )
          .forEach((b) =>
            b.classList.remove(
              "active"
            )
          );

        btn.classList.add(
          "active"
        );

        currentSymbol =
          btn.dataset.symbol;

        updateDashboard();

        loadChart();

      }
    );

  });

// =============================
// START
// =============================

updateDashboard();

loadChart();

setInterval(
  updateDashboard,
  3000
);

setInterval(
  loadChart,
  60000
);