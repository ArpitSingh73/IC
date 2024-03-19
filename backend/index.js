const express = require("express");
const connect = require("./db");
const jwt = require("jsonwebtoken");
const secret = "qwertyuhgfdsanbvcx";
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
var crypto = require("crypto");
const Razorpay = require("razorpay");
const verifyUser = require("./middleware/verify");
const isAdmin = require("./middleware/admin");
var cors = require("cors");
const bcrypt = require("bcryptjs");
var app = express();
var bodyParser = require("body-parser");
connect(); 

const Users = require("./models/users");
const Events = require("./models/events");
const Courses = require("./models/courses");
const Payment = require("./models/payment");
 
const PORT = 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// // --------------------------deployment------------------------------





//
//
app.post("/signup", async (req, res) => {
  let success = false;
  let userExists = false;
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      userExists = true;
      return res.status(500).json({ userExists });
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    let admin = false;
    if (req.body.admin === "true") {
      admin = true;
    }
    user = await Users.create({
      name: req.body.username,
      email: req.body.email,
      password: password,
      admin: admin,
    });

    const token = jwt.sign(user.id, secret);
    success = true;
    res.status(200).json({ success, admin, token: token, user: user._id });
  } catch (error) {
    res.status(500).json({ success, userExists });
  }
});

//
//
app.post("/login", async (req, res) => {
  let success = false;
  let userExists = false;
  try {
    const { email } = req.body;
    let user = await Users.findOne({ email });
    if (!user) {
      return res.status(500).json({ success, userExists });
    }

    const checkPass = await bcrypt.compare(req.body.password, user.password);
    if (!checkPass) {
      return req.status(400).json({ success, error: "Incorrect password" });
    }

    let admin = user.admin;

    const token = jwt.sign(user.id, secret);
    success = true;
    userExists = true;
    res
      .status(200)
      .json({ success, admin, userExists, token: token, user: user._id });
  } catch (error) {
    res.status(500).json({ success, userExists });
  }
});

//
//
app.get("/getuser", verifyUser, async (req, res) => {
  const _id = req.query.user_id;
  let success = false;
  let userExists = false;

  try {
    const user = await Users.findById(_id);
    if (!user) {
      res.status(400).json({ success, userExists });
    } else {
      success = true;
      userExists = true;
      res.status(200).json({ success, userExists, user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, userExists });
  }
});

//
//
app.get("/allcourses", async (req, res) => {
  const allcourse = await Courses.find({});
  res.status(200).send(allcourse);
});

//
//
app.get("/allevents", async (req, res) => {
  const allevents = await Events.find({});
  res.status(200).send(allevents);
});

//
//
app.get("/getproduct:id", async (req, res) => {
  //
  let _id = req.params.id.substring(1);
  try {
    let course = await Courses.findById({ _id });
    let event = await Events.findById({ _id });

    if (course) {
      res.status(201).send(course);
    } else if (event) {
      res.status(201).send(event);
    } else {
      console.log("no product");
    }
  } catch (error) {
    res.status(500).json({ Error: "Something went wrong" });
  }
});

//
//
app.post("/admin/addproduct", verifyUser, isAdmin, async (req, res) => {
  let { name, type, teacher, price, registerDate } = req.body;
  let success = false;
  let productExists = false;
  try {
    if (type === "event") {
      let event = await Events.findOne({ name });
      if (!event) {
        const newCourse = new Events({ name, teacher, price, registerDate });
        const saved = await newCourse.save();
        success = true;
        res.status(201).json({ success, saved, productExists });
      } else if (event) {
        productExists = true;
        return res
          .status(500)
          .json({ Error: "Product already exists...", productExists });
      }
    } else if (type === "course") {
      let course = await Courses.findOne({ name });
      if (!course) {
        const newCourse = new Courses({ name, teacher, price });
        const saved = await newCourse.save();
        success = true;
        res.status(201).json({ saved, success, productExists });
      } else if (course) {
        productExists = true;
        res.json({ Error: "Product already exists...", productExists });
      }
    } else {
      res.status(400).json({ error: "bad request" });
    }
  } catch (error) {
    res.send(error);
  }
});

//
//
app.get("/admin/placedorders", verifyUser, isAdmin, async (req, res) => {
  try {
    const _idArray = [];
    const allProducts = [];
    const purchasedProducts = await Payment.find({});

    purchasedProducts.forEach((item) => {
      let x = {};
      x["user_id"] = String(item["user_id"]);
      x["prod_id"] = String(item["prod_id"]);
      x["razorpay_order_id"] = item["razorpay_order_id"];
      x["razorpay_payment_id"] = item["razorpay_payment_id"];
      x["razorpay_signature"] = item["razorpay_signature"];
      x["time"] = item._id.getTimestamp();
      _idArray.push(x);
    });

    // .toLocaleDateString("en-CA");

    for (let _id of _idArray) {
      let x = {};
      let y = {};
      let p = await Users.findById(_id["user_id"]);
      x["user"] = p;
      y["user"] = p;
      p = await Events.findById(_id["prod_id"]);
      x["item"] = p;
      x["time"] = _id["time"].toLocaleString();
      p && allProducts.push(x);
      p = await Courses.findById(_id["prod_id"]);
      y["item"] = p;
      y["time"] = _id["time"].toLocaleString();
      p && allProducts.push(y);
    }

    res.status(201).json(allProducts);
  } catch (error) {
    console.log(error);
  }
});

//
//
app.post("/admin/update", verifyUser, isAdmin, async (req, res) => {
  let { _id, name, type, teacher, price, registerDate } = req.body;
  let success = false;
  try {
    if (type === "event") {
      let event = await Events.findById({ _id });
      if (event) {
        const newCourse = {};
        if (name) {
          newCourse.name = name;
        }
        if (teacher) {
          newCourse.teacher = teacher;
        }
        if (price) {
          newCourse.price = price;
        }
        if (registerDate) {
          newCourse.registerDate = registerDate;
        }

        const saved = await Events.findByIdAndUpdate(
          _id,
          { $set: newCourse },
          { new: true }
        );

        success = true;
        res.status(201).json({ saved, success });
      } else {
        res.status(400).json({ Error: "Event does not exists", success });
      }
    } else if (type === "course") {
      let course = await Courses.findById({ _id });
      if (course) {
        const newCourse = {};
        if (name) {
          newCourse.name = name;
        }
        if (teacher) {
          newCourse.teacher = teacher;
        }
        if (price) {
          newCourse.price = price;
        }

        const saved = await Courses.findByIdAndUpdate(
          _id,
          { $set: newCourse },
          { new: true }
        );
        res.status(201).json({ saved, success });
      } else {
        res.status(400).json({ Error: "Course does not exists", success });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

//
//
app.post("/admin/delete", verifyUser, isAdmin, async (req, res) => {
  let { _id } = req.body;
  let success = false;
  try {
    // if (type === "event") {
    let event = await Events.findById({ _id });
    if (event) {
      event = await Events.findByIdAndDelete({ _id });
      success = true;
      return res.json({ success: "Product deleted successfully", success });
    }
    // }
    // if (type === "course") {
    let course = await Courses.findById({ _id });

    if (course) {
      course = await Courses.findByIdAndDelete({ _id });
      success = true;
      return res.json({ success: "Product deleted...", success });
    }
    // }
  } catch (error) {
    console.log(error);
  }
});

//
//
app.post("/admin/add", verifyUser, isAdmin, async (req, res) => {
  let success = false;
  let userExists = false;
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      userExists = true;
      return res.status(500).json({ userExists });
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    let admin = false;
    if (req.body.admin === "true") {
      admin = true;
    }
    user = await Users.create({
      name: req.body.username,
      email: req.body.email,
      password: password,
      admin: admin,
    });

    const token = jwt.sign(user.id, secret);
    success = true;
    res.status(200).json({ success, admin, token: token, user: user._id });
  } catch (error) {
    res.status(500).json({ success, userExists });
  }
});

//
//
// app.get("/admin/filter", async (req, res) => {
  // // Get Today Start Date and End Date
  // let startOfDay = new Date();
  // startOfDay.setHours(0, 0, 0, 0);
  // let endOfDay = new Date();
  // endOfDay.setHours(23, 59, 59, 999);

  // // Get Yesterday Start Date and End Date
  // let startOfYesterday = new Date();
  // startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  // startOfYesterday.setHours(0, 0, 0, 0);
  // let endOfYesterday = new Date();
  // endOfYesterday.setDate(endOfYesterday.getDate() - 1);
  // endOfYesterday.setHours(23, 59, 59, 999);

  // // Get Last Month Start Date and End Date
  // let startOfPreviousMonth = new Date();
  // startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);
  // startOfPreviousMonth.setDate(1);
  // startOfPreviousMonth.setHours(0, 0, 0, 0);
  // let endOfPreviousMonth = new Date();
  // endOfPreviousMonth.setMonth(endOfPreviousMonth.getMonth() - 1);
  // let lastDayOfPreviousMonth = new Date(
  //   endOfPreviousMonth.getFullYear(),
  //   endOfPreviousMonth.getMonth() + 1,
  //   0
  // );
  // endOfPreviousMonth.setDate(lastDayOfPreviousMonth.getDate());
  // endOfPreviousMonth.setHours(23, 59, 59, 999);

  // 1 Year --->
  //  const result = await Payment.aggregate([
  //    {
  //      $group: {
  //        _id: { year: { $year:{} } },
  //        count: { $sum: 1 },
  //        user: { $push: "$user_id" },
  //        product: { $push: "$prod_id" },
  //      },
  //    },
  //  ]);

 



  // try {
    // one day --->

    // var start = new Date();
    // start.setHours(0, 0, 0, 0);
    // var end = new Date();
    // end.setHours(23, 59, 59, 999);

    // const result = await Payment.find({ createdAt: { $gte: start, $lt: end } });

    // const user_id = result[0]["user_id"];
    // const prod_id = result[0]["prod_id"];

    // const detail = {};
    // let prod = await Events.findById(prod_id);
    // if (prod) {
    //   detail["product name"] = prod["name"];
    //   detail["price"] = prod["price"];
    // }
    // prod = await Courses.findById(prod_id);

    // if (prod) {
    //   detail["product name"] = prod["name"];
    //   detail["price"] = prod["price"];
    // }

    // const user = await Users.findById(user_id);
    // console.log(user)
    // detail["user name"] = user["name"];
    // detail["email"] = user["email"];

    // detail["razorpay_order_id"] = result[0]["razorpay_order_id"];
    // detail["razorpay_payment_id"] = result[0]["razorpay_payment_id"];
    // detail["orderTime"] = result[0]["createdAt"]

    // one week --->

    // let week_1 = new Date(); // current date
    // let pastDate = week_1.getDate() - 7;
    // week_1.setDate(pastDate);
    // const result = await Payment.find({
    //   createdAt: { $gte: week_1 },
    // });

    // let prodDetail = [];

    // for (let info of result) {
    //   let temp = {};
    //   temp["user_id"] = info["user_id"];
    //   temp["prod_id"] = info["prod_id"];
    //   temp["razorpay_order_id"] = info["razorpay_order_id"];
    //   temp["razorpay_payment_id"] = info["razorpay_payment_id"];
    //   temp["orderTime"] = info["createdAt"];
    //   prodDetail.push(temp);
    // }

    // let allDetail = [];

    // for (let info of prodDetail) {
    //   let temp = {};
    //   const user_id = info["user_id"];
    //   const prod_id = info["prod_id"];

    //   let prod = await Events.findById(prod_id);
    //   if (prod) {
    //     temp["product name"] = prod["name"];
    //     temp["price"] = prod["price"];
    //   }
    //   prod = await Courses.findById(prod_id);
    //   if (prod) {
    //     temp["product name"] = prod["name"];
    //     temp["price"] = prod["price"];
    //   }
    //   const user = await Users.findById(user_id);
    //   temp["user name"] = user["name"];
    //   temp["email"] = user["email"];

    //   temp["razorpay_order_id"] = info["razorpay_order_id"];
    //   temp["razorpay_payment_id"] = info["razorpay_payment_id"];
    //   temp["orderTime"] = info["orderTime"];

    //   allDetail.push(temp);
    // }

    // one month --->
    // let month_1 = new Date(); // current date

    // let pastMonth = month_1.getDate() - 30;
    // month_1.setDate(pastMonth);

    // const result = await Payment.find({
    //   createdAt: { $gte: month_1 },
    // });

    // let prodDetail = [];

    // for (let info of result) {
    //   let temp = {};
    //   temp["user_id"] = info["user_id"];
    //   temp["prod_id"] = info["prod_id"];
    //   temp["razorpay_order_id"] = info["razorpay_order_id"];
    //   temp["razorpay_payment_id"] = info["razorpay_payment_id"];
    //   temp["orderTime"] = info["createdAt"];
    //   prodDetail.push(temp);
    // }

    // let allDetail = [];

    // for (let info of prodDetail) {
    //   let temp = {};
    //   const user_id = info["user_id"];
    //   const prod_id = info["prod_id"];

    //   let prod = await Events.findById(prod_id);
    //   if (prod) {
    //     temp["product name"] = prod["name"];
    //     temp["price"] = prod["price"];
    //   }
    //   prod = await Courses.findById(prod_id);
    //   if (prod) {
    //     temp["product name"] = prod["name"];
    //     temp["price"] = prod["price"];
    //   }
    //   const user = await Users.findById(user_id);
    //   temp["user name"] = user["name"];
    //   temp["email"] = user["email"];

    //   temp["razorpay_order_id"] = info["razorpay_order_id"];
    //   temp["razorpay_payment_id"] = info["razorpay_payment_id"];
    //   temp["orderTime"] = info["orderTime"];

    //   allDetail.push(temp);
    // }

    // 1 Year --->
    // const result = await Payment.aggregate([
    //   {
    //     $group: {
    //       _id: { year: { $year: {} } },
    //     },
    //   }, 
    // ]);

    // let prodDetail = [];

    // for (let info of result) {
    //   let temp = {};
    //   temp["user_id"] = info["user_id"];
    //   temp["prod_id"] = info["prod_id"];
    //   temp["razorpay_order_id"] = info["razorpay_order_id"];
    //   temp["razorpay_payment_id"] = info["razorpay_payment_id"];
    //   temp["orderTime"] = info["createdAt"];
    //   prodDetail.push(temp);
    // }

    // let allDetail = [];

    // for (let info of prodDetail) {
    //   let temp = {};
    //   const user_id = info["user_id"];
    //   const prod_id = info["prod_id"];

    //   let prod = await Events.findById(prod_id);
    //   if (prod) {
    //     temp["product name"] = prod["name"];
    //     temp["price"] = prod["price"];
    //   }
    //   prod = await Courses.findById(prod_id);
    //   if (prod) {
    //     temp["product name"] = prod["name"];
    //     temp["price"] = prod["price"];
    //   }
    //   const user = await Users.findById(user_id);
    //   temp["user name"] = user["name"];
    //   temp["email"] = user["email"];

    //   temp["razorpay_order_id"] = info["razorpay_order_id"];
    //   temp["razorpay_payment_id"] = info["razorpay_payment_id"];
    //   temp["orderTime"] = info["orderTime"];

    //   allDetail.push(temp);
    // }

//     return res.json(result); 
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "something went wrong" });
//   } 
// });

//
//
app.post("/buy:id", verifyUser, async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZOR_API_KEY,
      key_secret: process.env.RAZOR_SECRET_KEY,
    });
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    return res.status(200).json({ order });
  } catch (error) {
    console.log(error);

  }
});

//
//
app.get("/myorders", verifyUser, async (req, res) => {
  const user_id = req.query.user_id;

  try {
    const _idArray = [];
    const allProducts = [];
    const purchasedProducts = await Payment.find({ user_id });

    purchasedProducts.forEach((item) => {
      let x = {};
      x["_id"] = String(item.prod_id);
      x["time"] = item._id.getTimestamp();
      _idArray.push(x);
    });

    // .toLocaleDateString("en-CA");

    for (let _id of _idArray) {
      let x = {};
      let y = {};
      let p = await Events.findById(_id["_id"]);
      x["item"] = p;
      x["time"] = _id["time"].toLocaleString();
      p && allProducts.push(x);
      p = await Courses.findById(_id["_id"]);
      y["item"] = p;
      y["time"] = _id["time"].toLocaleString();
      p && allProducts.push(y);
    }

    res.status(201).json(allProducts);
  } catch (error) {
    console.log(error);
  }
});

//
//
app.get("/keys", async (req, res) => {
  res.status(200).json({ key: process.env.RAZOR_API_KEY });
});

//
//
app.post("/paymentverify", async (req, res) => {
  const { user_id, prod_id } = req.query;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  var expectedSignature = crypto
    .createHmac("sha256", process.env.RAZOR_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    await Payment.create({
      user_id,
      prod_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.redirect(`http://localhost:5173/success/:${razorpay_payment_id}`);
  } else {
    res.status(400).json({
      success: false,
    });
  }
});

//
//
app.listen(PORT, () => {
  console.log("So it begins...");
});
