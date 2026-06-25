let cloudinary = null;

function getCloudinary() {
  if (cloudinary) return cloudinary;
  
  const cloudinaryLib = require('cloudinary').v2;
  cloudinaryLib.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  cloudinary = cloudinaryLib;
  return cloudinary;
}

exports.uploadToCloudinary = async (filePath) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Cloudinary env vars missing');
      return null;
    }
    
    const cloud = getCloudinary();
    const result = await cloud.uploader.upload(filePath, { folder: 'thesiniysky' });
    console.log('Cloudinary SUCCESS:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary error:', error.message);
    return null;
  }
};

exports.deleteFromCloudinary = async (publicId) => {
  try {
    const cloud = getCloudinary();
    await cloud.uploader.destroy(publicId);
    return true;
  } catch (error) {
    return false;
  }
};
