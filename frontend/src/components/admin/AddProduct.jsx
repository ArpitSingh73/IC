import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import "./addproduct.css";

function AddProduct() {

  const navigate = useNavigate();
  const [allErrors, setAllErrors] = useState({});
  const [details, setDetails] = useState({
    name: "",
    type: "",
    teacher: "",
    registerDate: "",
    price: "",
  });

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };


  // schema for form validation using Yup --->
  const userSchema = Yup.object({
    name: Yup.string().required("product name is required"),
    type: Yup.string().required("type is required"),
    teacher: Yup.string().required("teacher name is required"),
    registerDate: Yup.string().required("date is required"),
    price: Yup.number()
      .required("price is required")
      .min(0, "must be non-negative"),
  });


  // function for foem validation --->
  const check = async () => {
    let result = false;
    setAllErrors({});

    try {
      await userSchema.validate(details, { abortEarly: false });
      result = true;
    } catch (error) {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      setAllErrors(errors);
    }
    return result;
  };


  // function allowing admin to add new products --->
  const handleClick = async () => {
    let result = await check();
    if (result) {
      const { name, type, teacher, registerDate, price } = details;

      if (type === "event" || type === "course") {
        try {
          const response = await fetch(
            "http://localhost:5000/admin/addproduct",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
                admin: localStorage.getItem("admin"),
              },
              body: JSON.stringify({
                name,
                type,
                teacher,
                registerDate,
                price,
              }),
            }
          );

          const json = await response.json();
          if (json.success) {
            navigate("/admin");
          } else if (json.productExists) {
            navigate("/addproduct");
          }
        } catch (error) {
          navigate("/admin");
        }
      } else {
        alert("type must be event/course");
      }
    }
  };
  return (
    <div className="addproduct">
      <div className="addproduct-form">
        <input
          required
          name="name"
          type="text"
          placeholder="Enter product name"
          onChange={handleChange}
        />
        {allErrors.name && <div>{allErrors.name}</div>}

        <input
          required
          name="type"
          type="text"
          placeholder="Type of product (course/event)"
          onChange={handleChange}
        />
        {allErrors.type && <div>{allErrors.type}</div>}

        <input
          required
          name="teacher"
          type="text"
          placeholder="Enter teacher name"
          onChange={handleChange}
        />
        {allErrors.teacher && <div>{allErrors.teacher}</div>}

        <input
          required
          name="registerDate"
          type="date"
          placeholder="Enter registration date only for events"
          onChange={handleChange}
        />
        {allErrors.registerDate && <div>{allErrors.registerDate}</div>}

        <input
          required
          name="price"
          type="number"
          placeholder="Enter price"
          onChange={handleChange}
        />
        {allErrors.price && <div>{allErrors.price}</div>}

        <button className="addproduct-btn" onClick={handleClick}>
          Add
        </button>
      </div>
    </div>
  );
}

export default AddProduct;
