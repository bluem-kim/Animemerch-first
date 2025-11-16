const express = require('express');
const multer = require('multer');
const { register, login, updateProfile, firebaseLogin, me } = require('../controllers/userController');
const auth = require('../middlewares/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } });

router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.post('/login/firebase', firebaseLogin);
router.put('/user/profile', auth, upload.single('photo'), updateProfile);
router.get('/auth/me', auth, me);

module.exports = router;