/**
 * Database Seeding Script for CSR Matching Platform
 *
 * Generates ~200 records:
 * - Users (Admin, PIN, CSR_REP, Corporate Volunteers)
 * - Requests
 * - Tasks
 * - Assignment Decisions
 * - Volunteer Hour Logs
 * - Audit Logs
 *
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); 
const User = require('./models/User');
const Request = require('./models/Request');
const Task = require('./models/Task');
const AssignmentDecision = require('./models/AssignmentDecision');
const VolunteerHourLog = require('./models/VolunteerHourLog');
const AuditLog = require('./models/AuditLog');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/csr_matching');
    console.log(' MongoDB connected for seeding');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// === Sample data arrays ===
const companies = [
  'Tech Solutions Inc', 'Global Finance Corp', 'Healthcare Partners',
  'Green Energy Ltd', 'Education First', 'Community Care Inc'
];

const skills = [
  'Medical Escort', 'Mobility Aid', 'Daily Living Support', 'Transportation',
  'Companionship', 'Technical Support', 'Language Translation',
  'Physical Therapy', 'Meal Preparation', 'Home Repair'
];

const categories = [
  'Medical Escort', 'Mobility Aid', 'Daily Living Support',
  'Transportation', 'Other'
];

const requestTitles = [
  'Need medical escort to hospital appointment',
  'Assistance with grocery shopping',
  'Help with mobility exercises',
  'Transportation to community center',
  'Support with daily medication management',
  'Assistance with home cleaning',
  'Need companion for social activities',
  'Help with technology setup',
  'Support with meal preparation',
  'Assistance with garden maintenance'
];

const clearDatabase = async () => {
  console.log('🧹 Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Request.deleteMany({}),
    Task.deleteMany({}),
    AssignmentDecision.deleteMany({}),
    VolunteerHourLog.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  console.log(' Database cleared');
};

// === Create Users ===
const createUsers = async () => {
  console.log(' Creating users...');

  const users = [];

  // Hash password once for reuse
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1 Admin
  users.push({
    name: 'Admin User',
    email: 'admin@csr.com',
    password: hashedPassword,
    role: 'ADMIN',
    status: 'active'
  });

  // 80 Person-in-Need (PIN)
  for (let i = 1; i <= 80; i++) {
    users.push({
      name: `Person In Need ${i}`,
      email: `pin${i}@example.com`,
      password: hashedPassword,
      role: 'PIN',
      status: 'active'
    });
  }

  // 40 CSR Representatives
  for (let i = 1; i <= 40; i++) {
    users.push({
      name: `CSR Rep ${i}`,
      email: `csr${i}@example.com`,
      password: hashedPassword,
      role: 'CSR_REP',
      company: companies[i % companies.length],
      status: 'active',
      verificationStatus: 'verified'
    });
  }

  // 79 Corporate Volunteers
  for (let i = 1; i <= 79; i++) {
    const randomSkills = [];
    const numSkills = Math.floor(Math.random() * 4) + 2; // 2–5 skills
    for (let j = 0; j < numSkills; j++) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      if (!randomSkills.includes(skill)) randomSkills.push(skill);
    }

    users.push({
      name: `Volunteer ${i}`,
      email: `volunteer${i}@example.com`,
      password: hashedPassword,
      role: 'CORPORATE_VOLUNTEER',
      company: companies[i % companies.length],
      skills: randomSkills,
      availability: ['Weekdays', 'Weekends'],
      profileCompleted: true,
      verificationStatus: 'verified',
      status: 'active'
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(` Created ${createdUsers.length} users`);
  return createdUsers;
};

// === Create Requests ===
const createRequests = async (pins) => {
  console.log(' Creating 200 service requests...');
  const requests = [];

  for (let i = 0; i < 200; i++) {
    const randomPIN = pins[Math.floor(Math.random() * pins.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const titleIndex = i % requestTitles.length;
    const status = ['Open', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)];

    requests.push({
      title: requestTitles[titleIndex],
      description: `Detailed description for request #${i + 1} related to ${category.toLowerCase()} services.`,
      category,
      createdBy: randomPIN._id,
      status,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      ...(status === 'Completed' && {
        completedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      })
    });
  }

  const createdRequests = await Request.insertMany(requests);
  console.log(` Created ${createdRequests.length} requests`);
  return createdRequests;
};

// === Create Tasks ===
const createTasks = async (requests, pins, csrReps, volunteers) => {
  console.log('🧾 Creating ~200 tasks...');

  const matchedRequests = requests.filter(r => r.status === 'In Progress' || r.status === 'Completed');
  while (matchedRequests.length < 200) {
    matchedRequests.push(requests[Math.floor(Math.random() * requests.length)]);
  }

  const tasks = matchedRequests.slice(0, 200).map(request => {
    const randomVolunteer = volunteers[Math.floor(Math.random() * volunteers.length)];
    const randomCSR = csrReps[Math.floor(Math.random() * csrReps.length)];
    const randomPIN = pins.find(p => p._id.toString() === request.createdBy.toString());

    const scheduledStart = new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000);
    const scheduledEnd = new Date(scheduledStart.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000);

    const taskStatus = ['Assigned', 'Confirmed', 'InProgress', 'Completed'][Math.floor(Math.random() * 4)];
    const completed = taskStatus === 'Completed';

    return {
      title: request.title,
      description: request.description,
      address: `${Math.floor(Math.random() * 999) + 1} Main Street, City ${Math.floor(Math.random() * 10) + 1}`,
      category: request.category,
      scheduledStart,
      scheduledEnd,
      requiredSkills: [request.category],
      status: completed ? 'Completed' : taskStatus,
      requestId: request._id,
      personInNeed: randomPIN._id,
      csrRep: randomCSR._id,
      assignedTo: randomVolunteer._id,
      ...(completed && {
        completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        actualHours: (Math.random() * 5 + 1).toFixed(1)
      })
    };
  });

  const createdTasks = await Task.insertMany(tasks);
  console.log(` Created ${createdTasks.length} tasks`);
  return createdTasks;
};

// === Create Logs ===
const createLogs = async (tasks, volunteers, csrReps) => {
  console.log('🗃️ Creating related logs...');
  const decisions = [];
  const hourLogs = [];
  const auditLogs = [];

  for (const task of tasks) {
    const volunteer = volunteers.find(v => v._id.equals(task.assignedTo));
    const csr = csrReps.find(c => c._id.equals(task.csrRep));

    decisions.push({
      taskId: task._id,
      volunteerId: task.assignedTo,
      decision: task.status === 'Declined' ? 'Decline' : 'Accept',
      reason: task.status === 'Declined' ? 'Schedule conflict' : null,
      timestamp: new Date()
    });

    if (task.status === 'Completed') {
      hourLogs.push({
        taskId: task._id,
        volunteerId: task.assignedTo,
        hours: parseFloat(task.actualHours),
        notes: `Completed ${task.category} service successfully.`,
        proofType: ['Photo', 'Document', 'None'][Math.floor(Math.random() * 3)],
        verified: Math.random() > 0.3,
        ...(Math.random() > 0.3 && {
          verifiedBy: csr._id,
          verifiedAt: new Date()
        }),
        timestamp: task.completedAt
      });
    }

    auditLogs.push({
      actorId: csr._id,
      action: 'TASK_ASSIGNED',
      entityType: 'Task',
      entityId: task._id,
      details: { taskTitle: task.title, volunteerId: task.assignedTo },
      timestamp: new Date(task.createdAt)
    });

    if (task.status !== 'Assigned') {
      auditLogs.push({
        actorId: volunteer._id,
        action: 'TASK_ACCEPTED',
        entityType: 'Task',
        entityId: task._id,
        details: { taskTitle: task.title },
        timestamp: new Date()
      });
    }

    if (task.status === 'Completed') {
      auditLogs.push({
        actorId: volunteer._id,
        action: 'TASK_COMPLETED',
        entityType: 'Task',
        entityId: task._id,
        details: { taskTitle: task.title, hours: task.actualHours },
        timestamp: task.completedAt
      });
    }
  }

  await Promise.all([
    AssignmentDecision.insertMany(decisions),
    VolunteerHourLog.insertMany(hourLogs),
    AuditLog.insertMany(auditLogs)
  ]);

  console.log(` Created ${decisions.length} assignment decisions`);
  console.log(` Created ${hourLogs.length} hour logs`);
  console.log(` Created ${auditLogs.length} audit logs`);
};

// === Main Seeder ===
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();

    console.log('\n Starting database seeding...\n');

    const allUsers = await createUsers();
    const pins = allUsers.filter(u => u.role === 'PIN');
    const csrReps = allUsers.filter(u => u.role === 'CSR_REP');
    const volunteers = allUsers.filter(u => u.role === 'CORPORATE_VOLUNTEER');

    const requests = await createRequests(pins);
    const tasks = await createTasks(requests, pins, csrReps, volunteers);
    await createLogs(tasks, volunteers, csrReps);

    console.log('\n Database seeding completed successfully!');
    console.log('Summary:');
    console.log(`  Users: ${allUsers.length}`);
    console.log(`  Requests: ${requests.length}`);
    console.log(`  Tasks: ${tasks.length}`);
    console.log(`  Assignment Decisions: ${tasks.length}`);
    console.log(`  Hour Logs: ${tasks.filter(t => t.status === 'Completed').length}`);
    console.log(`  Audit Logs: ${await AuditLog.countDocuments()}`);

    console.log('\n Test Login Credentials:');
    console.log('  Admin: admin@csr.com / password123');
    console.log('  CSR Rep: csr1@example.com / password123');
    console.log('  Volunteer: volunteer1@example.com / password123');
    console.log('  PIN: pin1@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error(' Seeding error:', error);
    process.exit(1);
  }
};

// Run the script
seedDatabase();
