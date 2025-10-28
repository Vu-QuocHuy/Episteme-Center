#!/usr/bin/env node

/**
 * Environment Setup Script
 * Tự động tạo file .env từ .env.example và validate các biến cần thiết
 */

const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

function setupEnvironment() {
  console.log('🔧 Setting up environment configuration...\n');

  // Kiểm tra xem .env.example có tồn tại không
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found!');
    process.exit(1);
  }

  // Kiểm tra xem .env đã tồn tại chưa
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    
    // Đọc và validate file .env hiện tại
    const envContent = fs.readFileSync(envPath, 'utf8');
    validateEnvironmentVariables(envContent);
  } else {
    console.log('📝 Creating .env file from .env.example...');
    
    // Copy .env.example to .env
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
    
    // Validate file mới tạo
    const envContent = fs.readFileSync(envPath, 'utf8');
    validateEnvironmentVariables(envContent);
  }

  console.log('\n🎉 Environment setup completed!');
  console.log('\n💡 Tips:');
  console.log('   - Update VITE_API_BASE_URL in .env to match your backend URL');
  console.log('   - Set VITE_NODE_ENV to "development", "staging", or "production"');
  console.log('   - Configure optional services if needed');
}

function validateEnvironmentVariables(envContent) {
  console.log('\n🔍 Validating environment variables...');
  
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
    'VITE_NODE_ENV'
  ];

  const optionalVars = [
    'VITE_ENABLE_DEBUG',
    'VITE_ENABLE_ANALYTICS',
    'VITE_DEFAULT_LANGUAGE',
    'VITE_DEFAULT_THEME'
  ];

  const lines = envContent.split('\n');
  const envVars = {};
  
  // Parse environment variables
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      envVars[key.trim()] = value;
    }
  });

  // Check required variables
  const missingRequired = requiredVars.filter(varName => !envVars[varName]);
  
  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingRequired.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log('\n💡 Please add these variables to your .env file');
  } else {
    console.log('✅ All required environment variables are present');
  }

  // Check optional variables
  const missingOptional = optionalVars.filter(varName => !envVars[varName]);
  
  if (missingOptional.length > 0) {
    console.log('\n⚠️  Optional environment variables not set:');
    missingOptional.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }

  // Display current configuration
  console.log('\n📋 Current configuration:');
  console.log(`   Environment: ${envVars.VITE_NODE_ENV || 'not set'}`);
  console.log(`   API URL: ${envVars.VITE_API_BASE_URL || 'not set'}`);
  console.log(`   App Name: ${envVars.VITE_APP_NAME || 'not set'}`);
  console.log(`   Debug Mode: ${envVars.VITE_ENABLE_DEBUG || 'false'}`);
}

// Chạy script
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment, validateEnvironmentVariables };