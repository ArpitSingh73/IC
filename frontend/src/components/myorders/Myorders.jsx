import React, { useEffect, useState } from "react";
import "./myorders.css";

function Myorders() {
  const [orders, setOrders] = useState([]);

  // useEffect for fetching all orders of a user --->
  useEffect(() => {
    const user = localStorage.getItem("user");

    const get = async () => {
      const response = await fetch(
        `http://localhost:5000/myorders?user_id=${user}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );

      const res = await response.json();
      setOrders(...orders, res);
    };

    get();
  }, []);

  console.log(orders);
  return (
    <div className="myorders">
      <h1>My Orders</h1>
      <div className="orders-box">
        {orders &&
          orders.map((item) => {
            return (
              <div key={item["item"]["_id"]} className="orders">
                <h2>Name : {item["item"]["name"]} </h2>
                <h2>Time : {item["time"]} </h2>
                <h2>Total : {item["item"]["price"]}</h2>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Myorders;
