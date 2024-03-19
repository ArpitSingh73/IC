import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "./home.css";
import HomeImg from "../../images/banner.jpg";
import Arrow from "../../images/arrow-up-right.svg";
function Home() {
  return (
    <div className="home">
      <div className="home-img">
        <img className="image" src={HomeImg}></img>
      </div>
      <div className="home-options">
        <div className="opn1">
          All Events
          <Link to="/events">
            <img className="imageArrow" src={Arrow}></img>
          </Link>
        </div>
        <div className="opn2">
          All Courses
          <Link to="/courses" >
            <img className="imageArrow" src={Arrow}></img>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
