import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import Home from "../../images/home.svg";
import Logout from "../../images/log-out.svg";
import Login from "../../images/log-in.svg";
import Bag from "../../images/shopping-bag.svg";
import Add from "../../images/user-plus.svg";
import Profile from "../../images/user.svg";
import "./navbar.css";

function Navbar() {
  const ref = useRef(null);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // function for fetching logged in user info --->
  const handleProfile = async () => {
    const user_id = localStorage.getItem("user");
    const res = await fetch(
      `http://localhost:5000/getuser?user_id=${user_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      }
    );
    const json = await res.json();
    setName(json.user.name);

    ref.current.classList.toggle("display");
  };

  // function for logging users out --->
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/");
  };

  return (
    <>
      <nav>
        <div className="child1">
          <Link to="/">
            <img src={Home}></img>
          </Link>
          {localStorage.getItem("token") && (
            <Link to="/">
              <img src={Profile} onClick={handleProfile}></img>
            </Link>
          )}
        </div>
        {localStorage.getItem("admin") === "true" ? (
          <div className="child2">
      
            <Link className="Link" to="/admin">Visit Dashboard</Link>
          </div>
        ) : (
          <div className="child2">InvestMent Compass</div>
        )}
        {localStorage.getItem("token") ? (
          localStorage.getItem("admin") === "true" ? (
            <div className="child3">
              <Link to="/addadmin">
                <img src={Add}></img>
              </Link>
              <Link to="/">
                <img src={Logout} onClick={handleLogout}></img>
              </Link>
            </div>
          ) : (
            <div className="child3">
              <Link to="/myorders">
                <img src={Bag}></img>
              </Link>
              <Link to="/">
                <img src={Logout} onClick={handleLogout}></img>
              </Link>
            </div>
          )
        ) : (
          <div className="child3">
            <Link to="/login">
              <img src={Login}></img>
            </Link>
            <Link to="/signup">
              <img src={Add}></img>
            </Link>
          </div>
        )}
      </nav>

      <div ref={ref} className="profile display">
        <div className="first">
          <div
            className="x "
            onClick={() => {
              ref.current.classList.toggle("display");
            }}
          >
            X
          </div>
          <img src={Profile}></img>
        </div>
        <div className="second">User : {name}</div>
      </div>
    </>
  );
}

export default Navbar;
