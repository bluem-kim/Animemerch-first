const express = require('express');
const { getReviews, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
