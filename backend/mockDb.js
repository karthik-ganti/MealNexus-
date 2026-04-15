// Mock Database for testing without MongoDB
class MockDB {
  constructor() {
    this.users = [];
    this.donations = [];
    this.tasks = [];
    this.campaigns = [];
    this.notifications = [];
    this.nextId = 1;
  }

  // User methods
  async createUser(userData) {
    const user = {
      _id: String(this.nextId++),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      verification: { isVerified: false },
      rating: { average: 0, count: 0 },
      stats: { totalDonations: 0, totalDeliveries: 0, peopleHelped: 0, mealsServed: 0 },
      isActive: true
    };
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  async getAllUsers() {
    return this.users;
  }

  async updateUser(id, updates) {
    const index = this.users.findIndex(u => u._id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date() };
      return this.users[index];
    }
    return null;
  }

  // Donation methods
  async createDonation(donationData) {
    const donation = {
      _id: String(this.nextId++),
      ...donationData,
      status: donationData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.donations.push(donation);
    return donation;
  }

  async getAllDonations() {
    return this.donations;
  }

  async findDonationById(id) {
    return this.donations.find(d => d._id === id);
  }

  async updateDonation(id, updates) {
    const index = this.donations.findIndex(d => d._id === id);
    if (index !== -1) {
      this.donations[index] = { ...this.donations[index], ...updates, updatedAt: new Date() };
      return this.donations[index];
    }
    return null;
  }

  // Task methods
  async createTask(taskData) {
    const task = {
      _id: String(this.nextId++),
      ...taskData,
      status: 'assigned',
      assignedAt: new Date(),
      createdAt: new Date()
    };
    this.tasks.push(task);
    return task;
  }

  async getTasksByVolunteer(volunteerId) {
    return this.tasks.filter(t => t.volunteer === volunteerId);
  }

  async updateTask(id, updates) {
    const index = this.tasks.findIndex(t => t._id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates, updatedAt: new Date() };
      return this.tasks[index];
    }
    return null;
  }
}

module.exports = new MockDB();
