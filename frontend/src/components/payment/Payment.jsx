import React from "react";
import { Link } from "react-router-dom";
import "./payment.css";
function payment() {
  return (
    <div className="payment">
      <h1>Payment was successfull</h1>
      <Link to="/">Go to Home</Link>
      <Link to="/myorders">Go to Orders</Link>
    </div>
  );
}

export default payment;
