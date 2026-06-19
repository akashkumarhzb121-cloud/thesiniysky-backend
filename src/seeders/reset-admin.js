require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin
    await User.deleteOne({ email: 'admin@thesiniysky.com' });
    console.log('Old admin removed');

    // Find super_admin role
    const superAdminRole = await Role.findOne({ name: 'super_admin' });
    console.log('Super admin role:', superAdminRole?._id);

    // Create fresh admin user
    const user = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@thesiniysky.com',
      password: 'Akashram@121',
      role: superAdminRole._id,
      isEmailVerified: true
    });

    console.log('New admin created:', user.email);
    
    // Verify password
    const userWithPassword = await User.findById(user._id).select('+password');
    const isMatch = await userWithPassword.comparePassword('Akashram@121');
    console.log('Password match:', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdmin();
