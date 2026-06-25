const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadToCloudinary = async (filePath) => {
  try {
    console.log('Cloudinary config check:', {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? process.env.CLOUDINARY_CLOUD_NAME.substring(0,4) + '...' : 'MISSING'
    });
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Cloudinary not configured - skipping');
      return null;
    }
    
    const result = await cloudinary.uploader.upload(filePath, { folder: 'thesiniysky' });
    console.log('Cloudinary upload success:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary error:', error.message);
    return null;
  }
};

exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    return false;
  }
};
