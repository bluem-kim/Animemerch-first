const Review = require('../models/Review');

// GET /reviews?product=&page=&limit=
exports.getReviews = async (req, res) => {
  try {
    const { product, page = 1, limit = 10 } = req.query;
    const query = {};
    if (product) query.product = product;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Review.find(query).populate('product', 'name').populate('user', 'name email').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Review.countDocuments(query)
    ]);
    res.json({ items, page: Number(page), total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Review.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
