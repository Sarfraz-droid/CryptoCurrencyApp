import React, { useState, useEffect, useRef } from "react";
import "./index.css";

import ReactAutocomplete from "react-autocomplete";

export default function App() {
  const [pair, setpair] = useState([]);
  const [price, setprice] = useState([]);
  const ws = useRef(null);
  const [currencies, setcurrencies] = useState();

  let first = useRef(false);
  const url = "https://api.pro.coinbase.com";

  useEffect(() => {
    ws.current = new WebSocket("wss://ws-feed.pro.coinbase.com");
    let pairs = [];

    //Filtering Out Data
    const apiCall = async () => {
      await fetch(url + "/products")
        .then((res) => res.json())
        .then((data) => (pairs = data));

      let filtered = pairs.filter((pair) => {
        if (pair.quote_currency === "USD") {
          return pair;
        }
      });



      filtered = filtered.map((pair) => {
        return {
          label: pair.id,
        };
      });


      setcurrencies(filtered);

      first.current = true;
    };

    apiCall();
  }, []);

  useEffect(() => {
    if (!first.current) {
      return;
    }
    console.log("I am Here");
    console.log(pair)
    let msg = {
      type: "subscribe",
      product_ids: [...pair],
      channels: ["ticker"],
    };
    let jsonMsg = JSON.stringify(msg);
    ws.current.send(jsonMsg);

    ws.current.onmessage = (e) => {
      let data = JSON.parse(e.data);

      if (data.type !== "ticker") {
        return;
      }

      setprice((price) => {
        return {
          ...price,
          [data.product_id]: data.price,
        };
      })
    };
  }, [pair]);

  useEffect(() => {
    if (!first.current) {
      return;
    }
    console.log(price);
  }, [price]);

  useEffect(() => {

  },[pair])

  const [value, setValue] = useState("");

  function addPair(e){
    setpair([...pair, value]);
    setValue("");
  }

  return (
    <div className="flex flex-col  items-center bg-gray-400 h-screen font-body">
      <div className="m-5 bg-white rounded-full shadow-2xl">
        <ReactAutocomplete
          items={currencies}
          getItemValue={(item) => item.label}
          shouldItemRender={(item, val) =>
            item.label.toLowerCase().indexOf(val.toLowerCase()) > -1
          }

          renderItem={(item, isHighlighted) => (
            <div style={{ background: isHighlighted ? "lightgray" : "white" }}>
              {item.label}
            </div>
          )}

          wrapperStyle={{
            display: "inline-block",
            background: "transparent",
            border: "none",
            padding: "0.5rem",
          }}

          value={value}
          onChange={(e) => setValue(e.target.value)}
          onSelect={(val) => setValue(val)}
        />
        <button class="p-3 bg-blue-500 text-white font-bold rounded-tr-full rounded-br-full border-2 border-white  hover:border-transparent transition-all" onClick={(e) => addPair()}>Add</button>
      </div>   

      {pair.map((p) => {
        return (
          <div className="w-full px-10 py-5 flex">
            <div className="text-xl font-bold text-white flex-grow">
              {p}
            </div>
            <div className="text-xl font-bold text-white flex-grow">
              {price[p]}
            </div> 
          </div>
        )
      })}

    </div>
  );
}
