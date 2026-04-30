/**
 * Seed script - populates the database with sample data
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();

  console.log('🌱 Starting seed...');

  // Clear existing data
  await User.deleteMany();
  await Project.deleteMany();
  await Task.deleteMany();
  console.log('🗑️  Cleared existing data');

  // Create users
  const adminUser = await User.create({
    name: 'Harshit Pandey',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
  });

  const member1 = await User.create({
    name: 'Priya Patel',
    email: 'priya@demo.com',
    password: 'member123',
    role: 'member',
  });

  const member2 = await User.create({
    name: 'Rahul Verma',
    email: 'rahul@demo.com',
    password: 'member123',
    role: 'member',
  });

  const member3 = await User.create({
    name: 'Sneha Iyer',
    email: 'sneha@demo.com',
    password: 'member123',
    role: 'member',
  });

  console.log('👤 Users created');

  // Create projects
  const project1 = await Project.create({
    title: 'E-Commerce Platform Redesign',
    description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX and improved performance.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'active',
    createdBy: adminUser._id,
    members: [member1._id, member2._id],
  });

  const project2 = await Project.create({
    title: 'Mobile App Development',
    description: 'Build a cross-platform mobile application for iOS and Android.',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    status: 'active',
    createdBy: adminUser._id,
    members: [member2._id, member3._id],
  });

  const project3 = await Project.create({
    title: 'API Integration Project',
    description: 'Integrate third-party payment and shipping APIs into the platform.',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (overdue)
    status: 'on-hold',
    createdBy: adminUser._id,
    members: [member1._id, member3._id],
  });

  console.log('📁 Projects created');

  // Create tasks for project 1
  await Task.create([
    {
      title: 'Design new homepage mockup',
      description: 'Create Figma mockups for the new homepage design.',
      priority: 'high',
      status: 'completed',
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      project: project1._id,
      assignedTo: member1._id,
      createdBy: adminUser._id,
    },
    {
      title: 'Implement product listing page',
      description: 'Build the product listing page with filters and sorting.',
      priority: 'high',
      status: 'in-progress',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      project: project1._id,
      assignedTo: member1._id,
      createdBy: adminUser._id,
    },
    {
      title: 'Set up payment gateway',
      description: 'Integrate Stripe payment gateway for checkout.',
      priority: 'high',
      status: 'todo',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      project: project1._id,
      assignedTo: member2._id,
      createdBy: adminUser._id,
    },
    {
      title: 'Write unit tests for cart module',
      description: 'Achieve 80% test coverage for the shopping cart.',
      priority: 'medium',
      status: 'todo',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      project: project1._id,
      assignedTo: member2._id,
      createdBy: adminUser._id,
    },
  ]);

  // Create tasks for project 2
  await Task.create([
    {
      title: 'Set up React Native project',
      description: 'Initialize the React Native project with navigation and state management.',
      priority: 'high',
      status: 'completed',
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      project: project2._id,
      assignedTo: member2._id,
      createdBy: adminUser._id,
    },
    {
      title: 'Build authentication screens',
      description: 'Create login, register, and forgot password screens.',
      priority: 'high',
      status: 'in-progress',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      project: project2._id,
      assignedTo: member3._id,
      createdBy: adminUser._id,
    },
    {
      title: 'Implement push notifications',
      description: 'Set up Firebase push notifications for iOS and Android.',
      priority: 'medium',
      status: 'todo',
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      project: project2._id,
      assignedTo: member2._id,
      createdBy: adminUser._id,
    },
  ]);

  // Create tasks for project 3 (some overdue)
  await Task.create([
    {
      title: 'Research payment API options',
      description: 'Compare Stripe, PayPal, and Braintree APIs.',
      priority: 'medium',
      status: 'completed',
      deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      project: project3._id,
      assignedTo: member1._id,
      createdBy: adminUser._id,
    },
    {
      title: 'Implement shipping rate calculator',
      description: 'Integrate FedEx and UPS shipping rate APIs.',
      priority: 'high',
      status: 'todo',
      deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // overdue
      project: project3._id,
      assignedTo: member3._id,
      createdBy: adminUser._id,
    },
  ]);

  console.log('✅ Tasks created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:  admin@demo.com  / admin123');
  console.log('Member: priya@demo.com  / member123');
  console.log('Member: rahul@demo.com  / member123');
  console.log('Member: sneha@demo.com  / member123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
