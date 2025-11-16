const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// Build items from product ids to avoid trusting client prices
async function buildItemsFromClient(itemsInput) {
  if (!Array.isArray(itemsInput) || !itemsInput.length) {
    const err = new Error('items array required');
    err.status = 400;
    throw err;
  }
  const productIds = itemsInput.map(i => i.product).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } }).select('name price photos');
  const productMap = new Map(products.map(p => [String(p._id), p]));
  const items = [];
  for (const raw of itemsInput) {
    const qty = Number(raw.quantity || 0);
    const pid = String(raw.product || '');
    if (!productMap.has(pid) || qty < 1) {
      const err = new Error('invalid item in cart');
      err.status = 400;
      throw err;
    }
    const p = productMap.get(pid);
    items.push({
      product: p._id,
      name: p.name,
      quantity: qty,
      price: p.price,
    });
  }
  return items;
}

exports.createTransaction = async (req, res) => {
  try {
    const { items: itemsInput, shippingAddress, contactPhone, notes } = req.body;
    const items = await buildItemsFromClient(itemsInput);
    const totalAmount = items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);

    const doc = await Transaction.create({
      user: req.user._id,
      items,
      totalAmount,
      paymentMethod: 'cod',
      shippingAddress,
      contactPhone,
      notes,
      status: 'pending',
    });
    res.status(201).json({ message: 'Order placed', transaction: doc });
  } catch (err) {
    const code = err.status || 500;
    res.status(code).json({ message: err.message || 'Server error' });
  }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const list = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ items: list });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
