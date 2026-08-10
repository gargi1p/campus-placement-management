const express = require('express');
const { uploadDocument, getMyDocuments, deleteDocument, downloadDocument } = require('../controllers/documentController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getMyDocuments);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
