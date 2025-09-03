import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth.config.js";

const sanitizeUser = (u) => {
  if (!u) return null;
  const { _id, email, username, phoneNumber, role, profileImage, createdAt, updatedAt } = u;
  return { id: _id, email, username, phoneNumber, role, profileImage, createdAt, updatedAt };
};

export const createUserController = async (req, res) => {
  const { email, username, phoneNumber, password } = req.body;
  if (!email || !username || !phoneNumber || !password) {
    return res.status(400).json({ message: "please fill in all the data fields", user: null });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "user with the email already exists", user: null });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;
    const newUser = new User({ email, username, phoneNumber, password: hashedPassword, profileImage });
    await newUser.save();
    return res.status(201).json({ message: "user created successfully", user: sanitizeUser(newUser) });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error", user: null });
  }
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "please fill in all the data fields", isAuthenticated: false });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ message: "user not found", isAuthenticated: false });
    }
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(401).json({ message: "invalid username or password", isAuthenticated: false });
    }
    const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(200).json({ message: "logged in successfully", isAuthenticated: true, token, user: sanitizeUser(existingUser) });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error", isAuthenticated: false });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    return res.status(200).json({ message: "users fetched", users: allUsers.map(sanitizeUser) });
  } catch (e) {
    return res.status(500).json({ message: "server error", users: null });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, username, phoneNumber, password, role } = req.body;

    let updateData = {};

    if (email) {
      const existingUserwithEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUserwithEmail) {
        return res.status(400).json({ message: "user with that email already exists so use another email", updatedUser: null });
      }
      updateData.email = email;
    }

    if (username) updateData.username = username;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    // Only admin can change role
    if (role && req.user && req.user.role === "admin") {
      updateData.role = role;
    }

    // Handle profile image if uploaded
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    return res.status(200).json({ message: "user updated successfully", updatedUser: sanitizeUser(updatedUser) });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "server error", updatedUser: null });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "user deleted successfully" });
  } catch (e) {
    return res.status(500).json({ message: "server error", users: null });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userById = await User.findById(userId);
    return res.status(200).json({ message: "user found successfully", user: sanitizeUser(userById) });
  } catch (e) {
    return res.status(500).json({ message: "server error", user: null });
  }
};

// Stateless logout (frontend should clear token). Protected to validate token.
export const logoutController = async (req, res) => {
  return res.status(200).json({ message: "logged out" });
};
