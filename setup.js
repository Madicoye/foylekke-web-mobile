#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Foy Lekke Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created! Please update it with your configuration.');
  } else {
    console.log('❌ env.example file not found. Please create a .env file manually.');
  }
} else {
  console.log('✅ .env file already exists.');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.log('❌ Failed to install dependencies. Please run "npm install" manually.');
  }
} else {
  console.log('✅ Dependencies already installed.');
}

// Check if MongoDB is running (optional check)
console.log('\n🔍 Checking MongoDB connection...');
try {
  const mongoose = require('mongoose');
  const connectDB = require('./config/database');
  
  // Try to connect briefly
  mongoose.connect('mongodb://localhost:27017/test', { 
    serverSelectionTimeoutMS: 2000 
  }).then(() => {
    console.log('✅ MongoDB is running and accessible.');
    mongoose.disconnect();
  }).catch(() => {
    console.log('⚠️  MongoDB connection failed. Please ensure MongoDB is running.');
    console.log('   You can start MongoDB with: brew services start mongodb-community');
  });
} catch (error) {
  console.log('⚠️  Could not check MongoDB connection. Please ensure it\'s running.');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update your .env file with your configuration');
console.log('2. Start the development server: npm run dev');
console.log('3. Initialize the database: npm run init-db');
console.log('4. Sync places from Google: npm run sync-places "Dakar" 10');
console.log('\n📚 Check README.md for more information.'); 