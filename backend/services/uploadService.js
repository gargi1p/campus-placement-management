const cloudinary = require('../config/cloudinary');
const { AppError } = require('../middleware/errorHandler');

const uploadToCloud = async (fileBuffer, folder, filename) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    const mockUrl = `https://res.cloudinary.com/mock/${folder}/${filename || 'file'}`;
    return { url: mockUrl, publicId: `mock/${folder}/${Date.now()}`, secure_url: mockUrl };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `campus_placement/${folder}`, resource_type: 'auto', public_id: filename },
      (error, result) => {
        if (error) reject(new AppError('File upload failed', 500));
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

const deleteFromCloud = async (publicId) => {
  if (!publicId || publicId.startsWith('mock/')) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadToCloud, deleteFromCloud };
