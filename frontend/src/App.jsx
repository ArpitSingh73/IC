import { useEffect, useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Signup from "./components/signup/Signup";
import Login from "./components/login/Login";
// import Main from "./components/main/Main";
import Events from "./components/events/Events";
import Courses from "./components/courses/Courses";
import AdminHome from "./components/admin/AdminHome";
import AddProduct from "./components/admin/AddProduct";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/footer/Footer";
import Home from "./components/home/Home";
// import Bag from "./components/bag/Bag";
import Payment from "./components/payment/Payment";
import Myorders from "./components/myorders/Myorders"
import ProductPage from "./components/productpage/ProductPage";
import AddAdmin from "./components/admin/AddAdmin";
// import "./App.css";

function App() {
  const [status, setStatus] = useState("logout");
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setStatus("login");
    } else {
      setStatus("logout");
    }
  });
  return (
    <>
      <Router>
        <Navbar />

        <Routes>
          <Route exact path="/" element={<Home />}></Route>

          <Route
            exact
            path="/login"
            element={<Login setStatus={setStatus} />}
          ></Route>
          {/* <Route exact path="/bag" element={<Bag />}></Route> */}

          <Route
            exact
            path="/signup"
            element={<Signup setStatus={setStatus} />}
          ></Route>
          <Route exact path="/admin" element={<AdminHome />}></Route>
          <Route exact path="/events" element={<Events />}></Route>
          <Route exact path="/courses" element={<Courses />}></Route>
          <Route exact path="/addadmin" element={<AddAdmin />}></Route>
          <Route
            exact
            path={`/productpage/:id`}
            element={<ProductPage />}
          ></Route>
          <Route exact path={`/addproduct`} element={<AddProduct />}></Route>
          <Route exact path={`/success/:id`} element={<Payment />}></Route>
          <Route exact path={`/myorders`} element={<Myorders />}></Route>
        </Routes>

        <Footer />
      </Router>
    </>
  );
}

export default App;
