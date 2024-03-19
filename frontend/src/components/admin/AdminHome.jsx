import React, { useState } from "react";
import Events from "../events/Events";
import Courses from "../courses/Courses";
import { useRef } from "react";
import "./adminhome.css";


function AdminHome() {

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const [orederDetails, setOrderDetails] = useState([]);

  // function for fetching all orders ever placed by users --->
  const handleOrderDetails = async () => {

    const response = await fetch("http://localhost:5000/admin/placedorders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
        admin: localStorage.getItem("admin"),
      },
    });

    const json = await response.json();
    setOrderDetails(json);
    ref1.current.classList.toggle("display");
  };

  // function for filtering order information --->
  const handleSellHistoty = async () => {
    ref2.current.classList.toggle("display");
  };

  return (
    <div className="admin">
      <h1>Welcome Admin</h1>
      <div className="details">
        <div>
          <button onClick={handleOrderDetails} className="details-btn">
            Order Detail
          </button>
        </div>
        <div>
          <button onClick={handleSellHistoty} className="details-btn">
            Sells History
          </button>
        </div>
      </div>
      <div ref={ref1} className="orders-box display">
       
        {orederDetails &&
          orederDetails.map((item) => {
            return (
              <div key={item["item"]["_id"]} className="orderss">
                <h2>name : {item["item"]["name"]} </h2>
                <h2>total : {item["item"]["price"]}</h2>
                <h2>time : {item["time"]} </h2>
              </div>
            );
          })}
      </div>
      <div ref={ref2} className="filter display">
        I am filter
      </div>
      <Events></Events>
      <Courses></Courses>
    </div>
  );
}

export default AdminHome;
