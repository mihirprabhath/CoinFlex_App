const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Extended currency list with popular cryptos
const cryptoCurrencies = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "Binance Coin",
  SOL: "Solana",
  XRP: "Ripple",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  USDT: "Tether",
  DOT: "Polkadot",
  MATIC: "Polygon",
  SHIB: "Shiba Inu",
  AVAX: "Avalanche",
  LTC: "Litecoin"
};

// Get all currencies (fiat + crypto)
app.get("/getAllCurrencies", async (req, res) => {
  try {
    // Get fiat currencies from Open Exchange Rates
    const fiatResponse = await axios.get(
      "https://openexchangerates.org/api/currencies.json?app_id=0168193b2b4a499aad2408bb1e1f71f0"
    );
    
    // Get crypto currencies from CoinCap
    const cryptoResponse = await axios.get('https://api.coincap.io/v2/assets?limit=50');
    const additionalCryptos = cryptoResponse.data.data.reduce((acc, crypto) => {
      acc[crypto.symbol] = crypto.name;
      return acc;
    }, {});

    // Combine all currencies
    const allCurrencies = {
      ...cryptoCurrencies,
      ...additionalCryptos,
      ...fiatResponse.data
    };

    return res.json(allCurrencies);
  } catch (err) {
    console.error("Error fetching currencies:", err);
    res.status(500).json({ error: "Failed to fetch currencies" });
  }
});

// Convert currency (supports both fiat and crypto)
app.get("/convert", async (req, res) => {
  const { date, sourceCurrency, targetCurrency, amountInSourceCurrency } = req.query;

  try {
    // Check if either currency is crypto
    const isSourceCrypto = Object.keys(cryptoCurrencies).includes(sourceCurrency) || 
                          sourceCurrency in await getCoinCapCurrencies();
    const isTargetCrypto = Object.keys(cryptoCurrencies).includes(targetCurrency) || 
                          targetCurrency in await getCoinCapCurrencies();

    if (isSourceCrypto || isTargetCrypto) {
      // Handle crypto conversions
      const result = await convertWithCrypto(sourceCurrency, targetCurrency, amountInSourceCurrency);
      return res.json(result.toFixed(2));
    } else {
      // Handle fiat-to-fiat conversion
      const convertURL = `https://openexchangerates.org/api/historical/${date}.json?app_id=0168193b2b4a499aad2408bb1e1f71f0`;
      const convertResponse = await axios.get(convertURL);
      const rates = convertResponse.data.rates;

      const sourceRate = rates[sourceCurrency];
      const targetRate = rates[targetCurrency];

      if (!sourceRate || !targetRate) {
        return res.status(400).json({ error: "Invalid currency pair" });
      }

      const targetAmount = (targetRate / sourceRate) * amountInSourceCurrency;
      return res.json(targetAmount.toFixed(2));
    }
  } catch (err) {
    console.error("Error in conversion:", err);
    res.status(500).json({ error: "Conversion failed", details: err.message });
  }
});

// Helper function to get current CoinCap currencies
async function getCoinCapCurrencies() {
  const response = await axios.get('https://api.coincap.io/v2/assets?limit=50');
  return response.data.data.reduce((acc, crypto) => {
    acc[crypto.symbol] = crypto.name;
    return acc;
  }, {});
}

// Helper function for crypto conversions
async function convertWithCrypto(sourceCurrency, targetCurrency, amount) {
  // Get USD rates for both currencies
  const usdRates = {};
  
  // Get crypto rates from CoinCap
  const cryptoResponse = await axios.get('https://api.coincap.io/v2/assets');
  cryptoResponse.data.data.forEach(crypto => {
    usdRates[crypto.symbol] = parseFloat(crypto.priceUsd);
  });

  // Get fiat rates from Open Exchange Rates (for USD pairs)
  const fiatResponse = await axios.get(
    'https://openexchangerates.org/api/latest.json?app_id=0168193b2b4a499aad2408bb1e1f71f0'
  );
  const fiatRates = fiatResponse.data.rates;

  // Determine rates
  let sourceRate, targetRate;

  // Source rate
  if (usdRates[sourceCurrency]) {
    sourceRate = usdRates[sourceCurrency]; // Crypto to USD
  } else if (fiatRates[sourceCurrency]) {
    sourceRate = 1 / fiatRates[sourceCurrency]; // Fiat to USD
  } else {
    throw new Error(`Unsupported source currency: ${sourceCurrency}`);
  }

  // Target rate
  if (usdRates[targetCurrency]) {
    targetRate = usdRates[targetCurrency]; // Crypto to USD
  } else if (fiatRates[targetCurrency]) {
    targetRate = fiatRates[targetCurrency]; // USD to Fiat
  } else {
    throw new Error(`Unsupported target currency: ${targetCurrency}`);
  }

  // Calculate final amount
  return (targetRate / sourceRate) * amount;
}

// Start server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});