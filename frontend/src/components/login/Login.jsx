import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import * as Yup from "yup";

function Login() {
  const navigate = useNavigate();
  const [allErrors, setAllErrors] = useState({});
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // creating a schema for form validation by Yup library --->
  const userSchema = Yup.object({
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

  // function for logging users in --->
  const handleClick = async () => {
    let result = await check();
    if (result) {
      const { email, password } = credentials;
      try {
        const response = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const json = await response.json();
        console.log(json);
        if (json.success) {
          localStorage.setItem("token", json.token);
          localStorage.setItem("user", json.user);

          if (json.admin) {
            localStorage.setItem("admin", json.admin);
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else if (!json.userExists) {
          navigate("/signup");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="login">
      <div className="login-form">
        <h1>Welcome again!</h1>
        <input
          name="email"
          type="text"
          placeholder="Enter your email"
          onChange={handleChange}
        />
        {allErrors.email && <div>{allErrors.email}</div>}

        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          onChange={handleChange}
        />
        {allErrors.password && <div>{allErrors.password}</div>}

        <button className="login-btn" onClick={handleClick}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
