class TradingBot {
  constructor(initialBalance = 1000) {
    this.initialBalance = initialBalance;

    this.balance = initialBalance;

    this.position = null;

    this.trades = [];

    this.feeRate = 0.001;

    this.stopLossPct = 2;
    this.takeProfitPct = 4;
  }

  updateMarket(data) {
    const { symbol, price, signal } = data;

    if (
      this.position &&
      this.position.symbol !== symbol
    ) {
      return;
    }

    if (this.position) {
      const pnlPct =
        ((price -
          this.position.entryPrice) /
          this.position.entryPrice) *
        100;

      if (
        pnlPct <=
        -this.stopLossPct
      ) {
        this.closePosition(
          price,
          "STOP_LOSS"
        );
        return;
      }

      if (
        pnlPct >=
        this.takeProfitPct
      ) {
        this.closePosition(
          price,
          "TAKE_PROFIT"
        );
        return;
      }

      if (signal === "SELL") {
        this.closePosition(
          price,
          "SIGNAL"
        );
      }

      return;
    }

    if (
      signal === "BUY" &&
      this.balance > 50
    ) {
      const amount =
        this.balance * 0.5;

      this.openPosition(
        symbol,
        price,
        amount
      );
    }
  }

  openPosition(
    symbol,
    price,
    amount
  ) {
    const fee =
      amount * this.feeRate;

    const netAmount =
      amount - fee;

    this.balance -= amount;

    this.position = {
      symbol,

      entryPrice: price,

      size:
        netAmount / price,

      invested: amount,

      feePaid: fee,

      openedAt:
        new Date().toISOString()
    };
  }

  closePosition(
    price,
    reason
  ) {
    if (!this.position) {
      return;
    }

    const grossValue =
      this.position.size *
      price;

    const exitFee =
      grossValue *
      this.feeRate;

    const netValue =
      grossValue - exitFee;

    const pnl =
      netValue -
      this.position.invested;

    this.balance += netValue;

    this.trades.push({
      symbol:
        this.position.symbol,

      entry:
        this.position.entryPrice,

      exit: price,

      pnl,

      roi:
        (pnl /
          this.position
            .invested) *
        100,

      reason,

      openedAt:
        this.position
          .openedAt,

      closedAt:
        new Date().toISOString()
    });

    this.position = null;
  }

  getEquity(
    currentPrice = null
  ) {
    if (
      !this.position ||
      !currentPrice
    ) {
      return this.balance;
    }

    return (
      this.balance +
      this.position.size *
        currentPrice
    );
  }

  getOpenPnL(
    currentPrice = null
  ) {
    if (
      !this.position ||
      !currentPrice
    ) {
      return 0;
    }

    return (
      this.position.size *
        currentPrice -
      this.position.invested
    );
  }

  getClosedPnL() {
    return this.trades.reduce(
      (acc, trade) =>
        acc + trade.pnl,
      0
    );
  }

  getTotalPnL(
    currentPrice = null
  ) {
    const equity =
      this.getEquity(
        currentPrice
      );

    return (
      equity -
      this.initialBalance
    );
  }

  getROI(
    currentPrice = null
  ) {
    return (
      (this.getTotalPnL(
        currentPrice
      ) /
        this.initialBalance) *
      100
    );
  }

  getWinRate() {
    if (
      this.trades.length === 0
    ) {
      return 0;
    }

    const wins =
      this.trades.filter(
        (t) => t.pnl > 0
      ).length;

    return (
      (wins /
        this.trades.length) *
      100
    );
  }

  reset() {
    this.balance =
      this.initialBalance;

    this.position = null;

    this.trades = [];
  }

  getStatus(
    currentPrice = null
  ) {
    return {
      balance: Number(
        this.balance.toFixed(2)
      ),

      equity: Number(
        this.getEquity(
          currentPrice
        ).toFixed(2)
      ),

      pnl: Number(
        this.getTotalPnL(
          currentPrice
        ).toFixed(2)
      ),

      openPnL: Number(
        this.getOpenPnL(
          currentPrice
        ).toFixed(2)
      ),

      closedPnL: Number(
        this.getClosedPnL().toFixed(
          2
        )
      ),

      roi: Number(
        this.getROI(
          currentPrice
        ).toFixed(2)
      ),

      winrate: Number(
        this.getWinRate().toFixed(
          2
        )
      ),

      trades:
        this.trades.length,

      openPosition:
        this.position,

      lastTrades:
        this.trades.slice(-10)
    };
  }
}

module.exports = {
  TradingBot
};