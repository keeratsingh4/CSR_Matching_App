/**
 * Create demo tasks for CV-01 / CV-05 use case demonstration
 * Generates 3 pre-assigned tasks for Volunteer 1
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Request = require('./models/Request');
const Task = require('./models/Task');

dotenv.config();

const createDemoTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB connected\n');

    // Get Volunteer 1 and CSR Rep 1
    const volunteer1 = await User.findOne({ email: 'volunteer1@example.com' });
    const csr1 = await User.findOne({ email: 'csr1@example.com' });

    if (!volunteer1 || !csr1) {
      console.error(' Missing demo users. Please run npm run seed first.');
      process.exit(1);
    }

    console.log('Found users:');
    console.log(`  - Volunteer: ${volunteer1.name} (${volunteer1.email})`);
    console.log(`  - CSR Rep: ${csr1.name} (${csr1.email})\n`);

    // Fetch open requests
    let openRequests = await Request.find({ status: 'Open' }).populate('createdBy').limit(3);

    // Create demo requests if none exist
    if (openRequests.length === 0) {
      const pin1 = await User.findOne({ role: 'PIN' });
      if (!pin1) throw new Error('No PIN users found. Please seed first.');

      const newRequests = await Request.create([
        {
          title: 'Need medical escort to hospital',
          description: 'I need assistance getting to my medical appointment at City Hospital.',
          category: 'Medical Escort',
          createdBy: pin1._id,
          status: 'Open'
        },
        {
          title: 'Help with grocery shopping',
          description: 'Need help with weekly grocery shopping due to mobility issues.',
          category: 'Daily Living Support',
          createdBy: pin1._id,
          status: 'Open'
        },
        {
          title: 'Companion for physiotherapy',
          description: 'Looking for someone to accompany me to physiotherapy sessions.',
          category: 'Medical Escort',
          createdBy: pin1._id,
          status: 'Open'
        }
      ]);
      openRequests = newRequests.map(r => ({ ...r.toObject(), createdBy: pin1 }));
      console.log(`🆕 Created ${newRequests.length} new requests\n`);
    }

    console.log(` Found ${openRequests.length} open requests\n`);

    const tasks = [];

    // 1️⃣ Assigned task
    const task1 = await Task.create({
      title: openRequests[0].title,
      description: openRequests[0].description,
      address: '123 Main Street, City Center',
      category: openRequests[0].category,
      scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      scheduledEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      requiredSkills: [openRequests[0].category],
      status: 'Assigned',
      requestId: openRequests[0]._id,
      personInNeed: openRequests[0].createdBy._id,
      csrRep: csr1._id,
      assignedTo: volunteer1._id
    });
    openRequests[0].status = 'In Progress';
    openRequests[0].matchedTo = volunteer1._id;
    await openRequests[0].save();
    tasks.push(task1);

    // 2️⃣ Confirmed task
    const task2 = await Task.create({
      title: openRequests[1].title,
      description: openRequests[1].description,
      address: '456 Oak Avenue, Downtown',
      category: openRequests[1].category,
      scheduledStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      scheduledEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      requiredSkills: [openRequests[1].category],
      status: 'Confirmed',
      requestId: openRequests[1]._id,
      personInNeed: openRequests[1].createdBy._id,
      csrRep: csr1._id,
      assignedTo: volunteer1._id,
      confirmedAt: new Date()
    });
    openRequests[1].status = 'In Progress';
    openRequests[1].matchedTo = volunteer1._id;
    await openRequests[1].save();
    tasks.push(task2);

    // 3️⃣ InProgress task
    const task3 = await Task.create({
      title: openRequests[2].title,
      description: openRequests[2].description,
      address: '789 Pine Road, Suburb',
      category: openRequests[2].category,
      scheduledStart: new Date(Date.now() - 1 * 60 * 60 * 1000),
      scheduledEnd: new Date(Date.now() + 1 * 60 * 60 * 1000),
      requiredSkills: [openRequests[2].category],
      status: 'InProgress',
      requestId: openRequests[2]._id,
      personInNeed: openRequests[2].createdBy._id,
      csrRep: csr1._id,
      assignedTo: volunteer1._id,
      confirmedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
    openRequests[2].status = 'In Progress';
    openRequests[2].matchedTo = volunteer1._id;
    await openRequests[2].save();
    tasks.push(task3);

    console.log('\n🎉 Demo tasks created successfully!\n');
    console.log('Summary:');
    console.log(`   - Total tasks created: ${tasks.length}`);
    console.log(`   - Assigned to: ${volunteer1.name} (${volunteer1.email})`);
    console.log('   - Task statuses: Assigned, Confirmed, InProgress\n');

    console.log(' Demo Instructions:');
    console.log(' 1 Login as Volunteer 1: volunteer1@example.com / password123');
    console.log(' 2 Go to "My Tasks"');
    console.log(' 3 Accept the "Assigned" task');
    console.log(' 4 View details of the "Confirmed" task');
    console.log(' 5 Complete the "InProgress" task\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(' Error creating demo tasks:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createDemoTasks();
