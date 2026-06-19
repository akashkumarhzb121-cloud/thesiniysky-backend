require('dotenv').config();
const mongoose = require('mongoose');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create Permissions
    const permissions = ['read', 'write', 'update', 'delete', 'publish'];
    const permDocs = {};
    for (const name of permissions) {
      const perm = await Permission.findOneAndUpdate(
        { name },
        { name, displayName: name.charAt(0).toUpperCase() + name.slice(1) },
        { upsert: true, new: true }
      );
      permDocs[name] = perm._id;
    }
    console.log('Permissions seeded');

    // Create Roles
    const roles = [
      { name: 'super_admin', permissions: Object.values(permDocs) },
      { name: 'admin', permissions: [permDocs.read, permDocs.write, permDocs.update, permDocs.delete] },
      { name: 'editor', permissions: [permDocs.read, permDocs.write, permDocs.update, permDocs.publish] },
      { name: 'client', permissions: [permDocs.read] },
      { name: 'visitor', permissions: [permDocs.read] }
    ];

    for (const r of roles) {
      await Role.findOneAndUpdate(
        { name: r.name },
        { name: r.name, displayName: r.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), permissions: r.permissions },
        { upsert: true, new: true }
      );
    }
    console.log('Roles seeded');

    // Create Admin User
    const superAdminRole = await Role.findOne({ name: 'super_admin' });
    const adminExists = await User.findOne({ email: 'admin@thesiniysky.com' });
    
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@thesiniysky.com',
        password: 'Akashram@121',
        role: superAdminRole._id,
        isEmailVerified: true
      });
      console.log('Admin user created: admin@thesiniysky.com / Akashram@121');
    } else {
      adminExists.role = superAdminRole._id;
      adminExists.isEmailVerified = true;
      await adminExists.save();
      console.log('Admin user updated');
    }

    console.log('Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
