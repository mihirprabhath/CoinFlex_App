import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MarketOverview = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Example using CoinGecko API
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,bnb,solana&order=market_cap_desc'
        );
        
        setCryptoData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-4">Loading market data...</div>;

  return (
    <div className="">
  <h3 className="text-md font-semibold mb-3 text-green-400">Market Overview</h3>
  <div className= "">
    {cryptoData.map(crypto => (
      <div key={crypto.id} className="bg-gray-700 p-2 rounded-md">
        <div className="flex items-center mb-0.5">
          <img 
            src={crypto.image} 
            alt={crypto.name}
            className="w-3 h-3 rounded-full mr-1.5"
          />
          <span className="font-medium text-xs">{crypto.symbol.toUpperCase()}</span>
        </div>
        <div className="text-sm font-bold">
          ${crypto.current_price.toLocaleString(undefined, {maximumFractionDigits: 2})}
        </div>
        <div className={`text-[0.65rem] ${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
        </div>
      </div>
    ))}
  </div>
</div>
  );
};

export default MarketOverview;