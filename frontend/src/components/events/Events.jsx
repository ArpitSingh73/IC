import { React, useEffect, useState } from "react";
import AddProduct from "../../images/plus.svg";
import { Link } from "react-router-dom";
import "./events.css";


function events() {
  const [allEvents, setAllEvents] = useState(null);

  // useEffect for fetching all the available events --->
  useEffect(() => {
    const get = async () => {
      const response = await fetch("http://localhost:5000/allevents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      setAllEvents(json);
    };

    get();
  }, []);

  const handleClick = (item) => {
    console.log(item);
  };

  return (
    <>
      <h1>All Events</h1>
      <div className="events">
        {allEvents &&
          allEvents.map((item) => {
            return (
              <Link
                key={item["_id"]}
                className="link"
                to={`/productpage/:${item["_id"]}`}
                target="_blank"
              >
                <div
                  key={item["_id"]}
                  className="events-son"
                  onClick={() => handleClick(item)}
                >
                  {item["name"]}
                </div>
              </Link>
            );
          })}
        {/* provides options to add new products */}
        {localStorage.getItem("admin") === "true" && (
          <div className="events-son add">
            <div>
              <Link to="/addproduct">
                <img className="addImage" src={AddProduct}></img>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default events;
