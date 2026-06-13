const { getBTCPrice } = require("./src/data/market");

console.log("Trading system avviato");

async function loop() {
  try {
    const price = await getBTCPrice();
    console.log("BTC Price:", price);
  } catch (err) {
    console.log("Errore:", err);
  }
}

// ripete ogni 3 secondi
setInterval(loop, 3000);

// prima esecuzione subito
loop();