import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import "./addadmin.css";

function AddAdmin() {
  const navigate = useNavigate();
  const [allErrors, setAllErrors] = useState({});
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // schema for form validation using Yup library --->
  const userSchema = Yup.object({
    username: Yup.string().required("Name is Required"),
    email: Yup.string().required("email is required").email("Invalid format"),
    password: Yup.string()
      .required("password is required")
      .min(5, "must be of 5 characters"),
  });

  // function for form validation --->
  const check = async () => {
    let result = false;
    setAllErrors({});
    try {
      await userSchema.validate(credentials, { abortEarly: false });
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


  // function allowing admins to add new admins --->
  const handleClick = async () => {
    let result = await check();
    if (result) {
      const { username, email, password } = credentials;

      setCredentials({});
      try {
        const response = await fetch("http://localhost:5000/admin/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
            admin: localStorage.getItem("user"),
          },
          body: JSON.stringify({ username, email, password }),
        });

        const json = await response.json();
        console.log(json);
        if (json.success) {
          navigate("/admin");
        } else if (json.userExists) {
          navigate("/admin");
        }
      } catch (error) {
        useNavigate("/addadmin");
      }
    }
  };

  return (
    <div className="addadmin">
      <div className="addadmin-form">
        <h1>Add new Admin</h1>
        <input
          name="username"
          type="text"
          required
          placeholder="Admin's name"
          onChange={handleChange}
        />
        {allErrors.username && <div>{allErrors.username}</div>}
        <input
          name="email"
          type="text"
          required
          placeholder="Admin's email"
          onChange={handleChange}
        />
        {allErrors.email && <div>{allErrors.email}</div>}
        <input
          name="password"
          type="password"
          required
          placeholder="Admin's password"
          onChange={handleChange}
        />
        {allErrors.password && <div>{allErrors.password}</div>}
        <button className="addadmin-btn" onClick={handleClick}>
          New Admin
        </button>
      </div>
    </div>
  );
}

export default AddAdmin;
