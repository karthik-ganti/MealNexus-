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

  // Rating methods
  async addRating(userId, ratingData) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    
    const newRating = {
      _id: String(this.nextId++),
      userId,
      ...ratingData,
      createdAt: new Date()
    };
    
    // Update user's average rating
    const currentAvg = user.rating?.average || 0;
    const currentCount = user.rating?.count || 0;
    const newAvg = ((currentAvg * currentCount) + ratingData.score) / (currentCount + 1);
    
    user.rating = {
      average: Math.round(newAvg * 10) / 10,
      count: currentCount + 1
    };
    
    return newRating;
  }

  async getUsersByRole(role) {
    return this.users.filter(u => u.role === role && u.isActive);
  }

  // Donation methods
  async createDonation(donationData) {
    // Calculate priority based on expiry time for food donations
    let priority = donationData.priority || 'medium';
    if (donationData.type === 'food' && donationData.foodDetails?.expiryTime) {
      priority = this.calculatePriority(donationData.foodDetails.expiryTime);
    }
    
    const donation = {
      _id: String(this.nextId++),
      ...donationData,
      priority,
      status: donationData.status || 'pending',
      images: donationData.images || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.donations.push(donation);
    return donation;
  }

  // Calculate priority based on expiry time
  calculatePriority(expiryTime) {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry <= 2) return 'urgent';
    if (hoursUntilExpiry <= 4) return 'high';
    if (hoursUntilExpiry <= 8) return 'medium';
    return 'low';
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

  // Auto-assign nearest volunteer
  async findNearestVolunteer(donationLocation) {
    const volunteers = await this.getUsersByRole('volunteer');
    if (volunteers.length === 0) return null;
    
    // Simple distance calculation (would use Google Maps API in production)
    let nearestVolunteer = volunteers[0];
    let minDistance = Infinity;
    
    for (const volunteer of volunteers) {
      if (volunteer.address?.coordinates) {
        const distance = this.calculateDistance(
          donationLocation,
          volunteer.address.coordinates
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestVolunteer = volunteer;
        }
      }
    }
    
    return {
      volunteer: nearestVolunteer,
      distance: minDistance
    };
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLon = this.toRad(loc2.lng - loc1.lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(loc1.lat)) * Math.cos(this.toRad(loc2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI/180);
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
