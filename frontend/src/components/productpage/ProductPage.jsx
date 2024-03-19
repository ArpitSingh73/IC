import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import "./productpage.css";

function ProductPage() {
  const [product, setProduct] = useState(null);
  const [allErrors, setAllErrors] = useState({});
  const navigate = useNavigate();
  const ref = useRef(null);
  const { id } = useParams();
  const _id = id.substring(1);

  const [details, setDetails] = useState({
    name: "",
    type: "",
    teacher: "",
    registerDate: "",
    price: "",
  });

  // function for fetching specific product --->
  useEffect(() => {
    const get = async () => {
      const response = await fetch(`http://localhost:5000/getproduct:${_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res = await response.json();
      setProduct(res);
    };

    get();
  }, []);

  // function for product purchasing --->
  const handleBuy = async (amount) => {
    // function for order initiation --->
    const response = await fetch(`http://localhost:5000/buy:${_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        _id,
        amount,
      }),
    });

    const res = await response.json();

    // function for getting api key --->
    const response2 = await fetch("http://localhost:5000/keys", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res2 = await response2.json();

    const userr = localStorage.getItem("user");
    const options = {
      key: res2.key,
      amount: amount,
      currency: "INR",
      name: "Arpit",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: String(res.order.id),
      callback_url: `http://localhost:5000/paymentverify?user_id=${userr}&prod_id=${_id}`,
      prefill: {
        name: "Gaurav Kumar",
        email: "gaurav.kumar@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };
    const razor = new window.Razorpay(options);
    razor.open();
  };

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  // function to show form for editing product information --->
  const handleEdit = () => {
    ref.current.classList.toggle("display");
  };

  // function allowing admins to delete a product --->
  const handleDelete = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          admin: localStorage.getItem("admin"),
        },
        body: JSON.stringify({
          _id,
        }),
      });

      const res = await response.json();
      if (res.success) {
        navigate("/admin");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const userSchema = Yup.object({
    name: Yup.string(),
    type: Yup.string().required("type is required"),
    teacher: Yup.string(),
    registerDate: Yup.string(),
    price: Yup.number().min(0, "must be non-negative"),
  });

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

  // function allowing admins to update product --->
  const handleUpdateProduct = async () => {
    let result = await check();
    if (result) {
      const { name, type, teacher, registerDate, price } = details;
      try {
        const response = await fetch("http://localhost:5000/admin/update", {
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
            _id,
          }),
        });

        const json = await response.json();
        console.log(json);
        if (json.success) {
          navigate("/admin");
        } else if (json.productExists) {
          navigate("/addproduct");
        }
      } catch (error) {
        navigate("/admin");
      }
    }
  };

  return (
    <div className="product">
      <div className="info">
        <div className="product-info">
          <div className="div1">
            <div>{product && product.name} </div>
          </div>
          <div className="div2">
            <div>
              <h2>Product Name : {product && product.name} </h2>
            </div>
            <div>
              <h2>Instructor Name : {product && product.teacher}</h2>
            </div>
            <div>
              <h2>Register date : {product && product.registerDate} </h2>
            </div>
            <div>
              <h2>Price : {product && product.price} INR</h2>
            </div>
          </div>
        </div>
        <div className="btn-class">
          {localStorage.getItem("admin") ? (
            <>
              <button className="productpage-btn" onClick={handleEdit}>
                Edit
              </button>
              <button className="productpage-btn" onClick={handleDelete}>
                Delete
              </button>
            </>
          ) : (
            <button
              className="productpage-btn"
              onClick={() => {
                handleBuy(product.price);
              }}
            >
              Buy
            </button>
          )}
        </div>
      </div>

      {/* form for product updation */}
      <div ref={ref} className="addproduct display">
        <div className="productpage-form">
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

          <button className="productpage-btn" onClick={handleUpdateProduct}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
