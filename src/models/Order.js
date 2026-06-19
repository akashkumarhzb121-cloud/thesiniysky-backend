const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  orderNumber: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  amount: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  paymentStatus: { type: String, default: 'pending' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
orderSchema.pre('save', async function() {
  if (!this.orderNumber) this.orderNumber = 'ORD-' + Date.now();
});
module.exports = mongoose.model('Order', orderSchema);
