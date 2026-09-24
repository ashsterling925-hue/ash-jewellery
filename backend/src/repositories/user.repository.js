import { prisma } from "../config/prisma.js";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

export const userRepository = {
  /**
   * Find safe user by ID
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  },

  /**
   * Find safe user by normalized email
   */
  async findByEmail(email) {
    if (!email) return null;
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: SAFE_USER_SELECT,
    });
  },

  /**
   * Find user with passwordHash for authentication verification ONLY
   */
  async findWithPasswordByEmail(email) {
    if (!email) return null;
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },

  /**
   * Create a new user
   */
  async create({ name, email, passwordHash, role = "STAFF", status = "ACTIVE", phone = null }) {
    return prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        status,
        phone,
      },
      select: SAFE_USER_SELECT,
    });
  },

  /**
   * Update user details
   */
  async update(id, data) {
    const updateData = { ...data };
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: SAFE_USER_SELECT,
    });
  },

  /**
   * Update user password hash
   */
  async updatePassword(id, passwordHash) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: SAFE_USER_SELECT,
    });
  },

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: SAFE_USER_SELECT,
    });
  },

  /**
   * Count users matching filter
   */
  async count(where = {}) {
    return prisma.user.count({ where });
  },
};

export default userRepository;
