require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const initializeDb = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create demo user
    const demoUser = {
      name: 'Demo User',
      email: 'demo@foylekke.com',
      password: 'demo123',
      role: 'user',
      status: 'active',
      bio: 'This is a demo account for testing purposes',
      location: 'Dakar, Senegal',
      preferences: {
        cuisinePreferences: ['Local', 'African', 'International'],
        priceRange: 'moderate',
        notificationPreferences: {
          hangoutInvites: true,
          friendRequests: true,
          hangoutReminders: true
        }
      }
    };

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: demoUser.email });
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Create new demo user
    const user = new User(demoUser);
    await user.save();
    console.log('Demo user created successfully');

    // Create demo advertiser
    const demoAdvertiser = {
      name: 'Demo Business',
      email: 'business@foylekke.com',
      password: 'business123',
      role: 'advertiser',
      status: 'active',
      bio: 'This is a demo business account for testing purposes',
      location: 'Dakar, Senegal',
      advertiserInfo: {
        companyName: 'Demo Restaurant',
        businessType: 'Restaurant',
        website: 'https://demo-restaurant.com',
        phone: '+221777777777',
        address: '123 Demo Street, Dakar',
        isVerified: true,
        verificationDate: new Date(),
      }
    };

    // Check if demo advertiser already exists
    const existingAdvertiser = await User.findOne({ email: demoAdvertiser.email });
    if (existingAdvertiser) {
      console.log('Demo advertiser already exists');
      return;
    }

    // Create new demo advertiser
    const advertiser = new User(demoAdvertiser);
    await advertiser.save();
    console.log('Demo advertiser created successfully');

    console.log('\nDemo Credentials:');
    console.log('Regular User:');
    console.log('Email: demo@foylekke.com');
    console.log('Password: demo123');
    console.log('\nBusiness Account:');
    console.log('Email: business@foylekke.com');
    console.log('Password: business123');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

initializeDb(); 