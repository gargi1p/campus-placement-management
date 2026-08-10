const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['resume', 'offer_letter', 'certificate', 'id_proof', 'marksheet', 'other'],
      required: true,
    },
    filename: { type: String, required: true },
    originalName: String,
    url: { type: String, required: true },
    publicId: String,
    mimeType: String,
    size: Number,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

documentSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Document', documentSchema);
