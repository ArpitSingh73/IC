import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import "./signup.css";


function Signup() {
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

  // creating a schema for form validation by Yup library --->
  const userSchema = Yup.object({
    username: Yup.string().required("Name is Required"),
    email: Yup.string().required("email is required").email("Invalid format"),
    password: Yup.string()
      .required("password is required")
      .min(5, "must be of 5 characters"),
  });

  // function for for validation --->
  const check = async () => {
    let result = false;
    setAllErrors({});

    try {
      await userSchema.validate(credentials, { abortEarly: false });
      result = true;
    } catch (error) {
      //  console.log(error);
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      setAllErrors(errors);
    }
    return result;
  };

  // function for signing users in --->
  const handleClick = async () => {
    let result = await check();
    if (result) {
      const { username, email, password } = credentials;

      setCredentials({});
      try {
        const response = await fetch("http://localhost:5000/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });

        const json = await response.json();
        console.log(json);
        if (json.success) {
          localStorage.setItem("token", json.token);
          localStorage.setItem("user", json.user);
          if (json.admin) {
            localStorage.setItem("admin", json.admin);
            navigate("/admin");
          }
          navigate("/");
        } else if (json.userExists) {
          navigate("/login");
        }
      } catch (error) {
        useNavigate("/signup");
      }
    }
  };

  return (
    <div className="signup">
      <div className="signup-form">
        <h1>New to Investment Compass?</h1>
        <input
          name="username"
          type="text"
          required
          placeholder="Enter your name"
          onChange={handleChange}
        />
        {allErrors.username && <div>{allErrors.username}</div>}
        <input
          name="email"
          type="text"
          required
          placeholder="Enter your email"
          onChange={handleChange}
        />
        {allErrors.email && <div>{allErrors.email}</div>}
        <input
          name="password"
          type="password"
          required
          placeholder="Enter your password"
          onChange={handleChange}
        />
        {allErrors.password && <div>{allErrors.password}</div>}
        <button className="signup-btn" onClick={handleClick}>
          SignUp
        </button>
      </div>
    </div>
  );
}

export default Signup;
