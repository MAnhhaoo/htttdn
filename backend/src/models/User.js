const users = require('../data/users.json');

class User {
  static data = [...users];

  static findById(id) { return this.data.find(u => u.id === id); }
  static findByEmail(email) { return this.data.find(u => u.email === email); }

  static updateProfile(id, updates) {
    const idx = this.data.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data[idx] = { ...this.data[idx], ...updates };
    return this.data[idx];
  }

  static getAddresses(userId) {
    const user = this.findById(userId);
    return user ? user.addresses : [];
  }

  static addAddress(userId, address) {
    const user = this.findById(userId);
    if (!user) return null;
    const newAddr = { id: `addr-${Date.now()}`, ...address };
    if (newAddr.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(newAddr);
    return newAddr;
  }

  static updateAddress(userId, addressId, updates) {
    const user = this.findById(userId);
    if (!user) return null;
    const idx = user.addresses.findIndex(a => a.id === addressId);
    if (idx === -1) return null;
    if (updates.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses[idx] = { ...user.addresses[idx], ...updates };
    return user.addresses[idx];
  }

  static deleteAddress(userId, addressId) {
    const user = this.findById(userId);
    if (!user) return false;
    const idx = user.addresses.findIndex(a => a.id === addressId);
    if (idx === -1) return false;
    user.addresses.splice(idx, 1);
    return true;
  }
}

module.exports = User;
