const mongoose = require('mongoose');
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, default: 0 }, tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, default: 'draft' }, dueDate: Date,
  items: [{ description: String, quantity: Number, rate: Number, amount: Number }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
invoiceSchema.pre('save', async function() {
  if (!this.invoiceNumber) this.invoiceNumber = 'INV-' + Date.now();
});
module.exports = mongoose.model('Invoice', invoiceSchema);
