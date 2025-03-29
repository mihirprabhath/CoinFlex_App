import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MainPage() {
  const [date, setDate] = useState(null);
  const [sourceCurrency, setSourceCurrency] = useState("");
  const [targetCurrency, setTargetCurrency] = useState("");
  const [amountInSourceCurrency, setAmountInSourceCurrency] = useState(0);
  const [amountInTargetCurrency, setAmountInTargetCurrency] = useState(0);
  const [currencyName, setCurrencyName] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [popularCryptos] = useState([
    "BTC",
    "ETH",
    "BNB",
    "SOL",
    "XRP",
    "ADA",
    "DOGE",
  ]);
  const [cryptoData, setCryptoData] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);

  // Fetch crypto market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,bnb,solana,ripple,cardano,dogecoin&order=market_cap_desc"
        );
        setCryptoData(response.data);
        setMarketLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setMarketLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/convert", {
        params: {
          date,
          sourceCurrency,
          targetCurrency,
          amountInSourceCurrency,
        },
      });
      setAmountInTargetCurrency(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getCurrencyName = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/getAllCurrencies"
        );
        setCurrencyName(response.data);
      } catch (err) {
        console.error("Error fetching currencies:", err);
      }
    };
    getCurrencyName();
  }, []);

  const handleQuickSelect = (crypto) => {
    setSourceCurrency(crypto);
  };

  const MarketOverview = () => (
    <div className="mt-4 bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
      <h3 className="text-md font-semibold mb-3 text-green-400">
        Market Overview
      </h3>
      {marketLoading ? (
        <div className="text-center py-2 text-gray-400">
          Loading market data...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cryptoData.map((crypto) => (
            <div key={crypto.id} className="bg-gray-700 p-2 rounded-md">
              <div className="flex items-center mb-0.5">
                <img
                  src={crypto.image}
                  alt={crypto.name}
                  className="w-3 h-3 rounded-full mr-1.5"
                />
                <span className="font-medium text-xs">
                  {crypto.symbol.toUpperCase()}
                </span>
              </div>
              <div className="text-sm font-bold">
                $
                {crypto.current_price.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={`text-[0.65rem] ${
                  crypto.price_change_percentage_24h >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {crypto.price_change_percentage_24h >= 0 ? "↑" : "↓"}
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white md:p-8">
      <div className="max-w-6x1 mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            Crypto Exchange Pro
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Real-time cryptocurrency & fiat currency converter with the most
            accurate exchange rates
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         

          {/* Converter Form */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 "   >
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      onChange={(e) => setDate(e.target.value)}
                      type="date"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    onChange={(e) => setAmountInSourceCurrency(e.target.value)}
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Currency Selection - Two Column Layout */}
                <div className="space-y-6 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From Currency */}

                    {/* To Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Form Currency
                      </label>
                      <select
                        onChange={(e) => setTargetCurrency(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                        value={targetCurrency}
                        required
                      >
                        <option value="">Select currency</option>
                        {currencyName &&
                        Object.keys(currencyName).length > 0 ? (
                          Object.keys(currencyName).map((currency) => (
                            <option key={currency} value={currency}>
                              {currency} - {currencyName[currency]}
                            </option>
                          ))
                        ) : (
                          <option disabled>Loading currencies...</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        To Currency
                      </label>
                      <select
                        onChange={(e) => setSourceCurrency(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                        value={sourceCurrency}
                        required
                      >
                        <option value="">Select currency</option>
                        {currencyName &&
                        Object.keys(currencyName).length > 0 ? (
                          Object.keys(currencyName).map((currency) => (
                            <option key={currency} value={currency}>
                              {currency} - {currencyName[currency]}
                            </option>
                          ))
                        ) : (
                          <option disabled>Loading currencies...</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Swap Currencies Button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = sourceCurrency;
                        setSourceCurrency(targetCurrency);
                        setTargetCurrency(temp);
                      }}
                      className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                      aria-label="Swap currencies"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all ${
                      isLoading
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Converting...
                      </span>
                    ) : (
                      "Convert Now"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>


          <div className="grid grid-cols-1   gap-8">
            {/* Conversion Result Card */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-4 text-green-400">
                  Conversion Result
                </h2>
                {amountInTargetCurrency > 0 ? (
                  <div className="flex-grow flex flex-col justify-center">
                    <div className="text-4xl font-bold text-center mb-2">
                      {amountInTargetCurrency.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-center text-lg mb-6">
                      {currencyName[sourceCurrency] || sourceCurrency}
                    </div>
                    <div className="text-center text-sm text-gray-300">
                      {amountInSourceCurrency}{" "}
                      {currencyName[targetCurrency] || targetCurrency} equals
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-gray-500">
                    <p>Your conversion will appear here</p>
                  </div>
                )}

                {/* Popular Cryptos */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Quick Select
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularCryptos.map((crypto) => (
                      <button
                        key={crypto}
                        onClick={() => handleQuickSelect(crypto)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sourceCurrency === crypto
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                      >
                        {crypto}
                      </button>
                    ))}
                  </div>
                  
                </div>
               
              </div>
              
            </div>
          </div>
         
           
         

          {/* Market Overview */}
        </div>
        <div className="">
          <MarketOverview />

            </div>
      </div>
    </div>
  );
}
