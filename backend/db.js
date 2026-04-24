const mongoose = require('mongoose');

// In-memory fallback stores
const memoryStores = {
  bookings: [],
  contacts: [],
  reviews: []
};

// ID generator for memory mode
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Check if MongoDB is connected
function isConnected() {
  return mongoose.connection.readyState === 1;
}

// Booking operations with fallback
const bookingOps = {
  async create(data) {
    if (isConnected()) {
      const Booking = require('./models/Booking');
      return await new Booking(data).save();
    }
    const doc = { _id: generateId(), ...data, createdAt: new Date() };
    memoryStores.bookings.unshift(doc);
    return doc;
  },

  async find(query = {}, sort = { createdAt: -1 }) {
    if (isConnected()) {
      const Booking = require('./models/Booking');
      return await Booking.find(query).sort(sort).lean();
    }
    let results = memoryStores.bookings;
    if (query.status) results = results.filter(b => b.status === query.status);
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findById(id) {
    if (isConnected()) {
      const Booking = require('./models/Booking');
      return await Booking.findById(id).lean();
    }
    return memoryStores.bookings.find(b => b._id === id) || null;
  },

  async updateStatus(id, status) {
    if (isConnected()) {
      const Booking = require('./models/Booking');
      return await Booking.findByIdAndUpdate(id, { status }, { new: true }).lean();
    }
    const index = memoryStores.bookings.findIndex(b => b._id === id);
    if (index === -1) return null;
    memoryStores.bookings[index].status = status;
    return memoryStores.bookings[index];
  },

  async delete(id) {
    if (isConnected()) {
      const Booking = require('./models/Booking');
      return await Booking.findByIdAndDelete(id).lean();
    }
    const index = memoryStores.bookings.findIndex(b => b._id === id);
    if (index === -1) return null;
    return memoryStores.bookings.splice(index, 1)[0];
  },

  async count(query = {}) {
    if (isConnected()) {
      const Booking = require('./models/Booking');
      return await Booking.countDocuments(query);
    }
    if (query.status) return memoryStores.bookings.filter(b => b.status === query.status).length;
    return memoryStores.bookings.length;
  }
};

// Contact operations with fallback
const contactOps = {
  async create(data) {
    if (isConnected()) {
      const Contact = require('./models/Contact');
      return await new Contact(data).save();
    }
    const doc = { _id: generateId(), ...data, resolved: false, createdAt: new Date() };
    memoryStores.contacts.unshift(doc);
    return doc;
  },

  async find(sort = { createdAt: -1 }) {
    if (isConnected()) {
      const Contact = require('./models/Contact');
      return await Contact.find().sort(sort).lean();
    }
    return memoryStores.contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async toggleResolved(id) {
    if (isConnected()) {
      const Contact = require('./models/Contact');
      const contact = await Contact.findById(id).lean();
      if (!contact) return null;
      const newStatus = !(contact.resolved || contact.status === 'resolved');
      return await Contact.findByIdAndUpdate(
        id,
        { resolved: newStatus, status: newStatus ? 'resolved' : 'unresolved' },
        { new: true }
      ).lean();
    }
    const index = memoryStores.contacts.findIndex(c => c._id === id);
    if (index === -1) return null;
    const current = memoryStores.contacts[index];
    const wasResolved = current.resolved || current.status === 'resolved';
    current.resolved = !wasResolved;
    current.status = current.resolved ? 'resolved' : 'unresolved';
    return current;
  },

  async count() {
    if (isConnected()) {
      const Contact = require('./models/Contact');
      return await Contact.countDocuments();
    }
    return memoryStores.contacts.length;
  }
};

// Review operations with fallback
const reviewOps = {
  async create(data) {
    if (isConnected()) {
      const Review = require('./models/Review');
      return await new Review(data).save();
    }
    const doc = { _id: generateId(), ...data, status: 'approved', createdAt: new Date() };
    memoryStores.reviews.unshift(doc);
    return doc;
  },

  async find(sort = { createdAt: -1 }) {
    if (isConnected()) {
      const Review = require('./models/Review');
      return await Review.find().sort(sort).lean();
    }
    return memoryStores.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async delete(id) {
    if (isConnected()) {
      const Review = require('./models/Review');
      return await Review.findByIdAndDelete(id).lean();
    }
    const index = memoryStores.reviews.findIndex(r => r._id === id);
    if (index === -1) return null;
    return memoryStores.reviews.splice(index, 1)[0];
  },

  async count() {
    if (isConnected()) {
      const Review = require('./models/Review');
      return await Review.countDocuments();
    }
    return memoryStores.reviews.length;
  }
};

module.exports = {
  bookingOps,
  contactOps,
  reviewOps,
  isConnected
};

