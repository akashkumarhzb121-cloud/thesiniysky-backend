const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (amount, currency = 'INR') => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) return null;
    const options = {
      amount: amount * 100,
      currency,
      receipt: 'receipt_' + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order error:', error);
    return null;
  }
};

exports.verifyPayment = async (paymentId, orderId, signature) => {
  try {
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    return generatedSignature === signature;
  } catch (error) {
    return false;
  }
};
