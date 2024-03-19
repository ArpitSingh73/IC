const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
    },
    prod_id: {
      type: Schema.Types.ObjectId,
    },
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
    // ordered_at: {
    //   type: Date, default: Date.now
    // },
  },
  { timestamps: true }
);

const payment = mongoose.model("Payment", paymentSchema);

module.exports = payment;
