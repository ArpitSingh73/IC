import { React, useEffect, useState } from "react";
import AddProduct from "../../images/plus.svg";
import { Link } from "react-router-dom";
import "./courses.css";

function Courses() {
  const [allCourses, setAllCourses] = useState(null);

  // useEffect for fetching all the available courses --->
  useEffect(() => {
    const get = async () => {
      const response = await fetch("http://localhost:5000/allcourses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      setAllCourses(json);
    };

    get();
  }, []);

  return (
    <>
      <h1>All Courses</h1>
      <div className="courses">
        {allCourses &&
          allCourses.map((item) => {
            return (
              <Link
                key={item["_id"]}
                className="link"
                to={`/productpage/:${item["_id"]}`}
                target="_blank"
              >
                <div key={item["_id"]} className="courses-son">
                  {item["name"]}
                </div>
              </Link>
            );
          })}
        
        {/* provides options to add new products */}
        {localStorage.getItem("admin") === "true" && (
          <div className="courses-son add">
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
import "./courses.css";
export default Courses;
