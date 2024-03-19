import React from "react";
import "./footer.css";
import FB from "../../images/facebook.svg";
import IG from "../../images/instagram.svg";
import LinkedIn from "../../images/linkedin.svg";
import YT from "../../images/youtube.svg";
import Twitter from "../../images/twitter.svg";
import Gmail from "../../images/mail.svg";

function Footer() {
  return (
    <div className="footer">
      <div><img src={FB}></img> </div>
      <div><img src={IG}></img></div>
      <div><img src={LinkedIn}></img></div>
      <div><img src={Twitter}></img></div>
      <div><img src={Gmail}></img></div>
      <div><img src={YT}></img></div>
    </div>
  );
}

export default Footer;
