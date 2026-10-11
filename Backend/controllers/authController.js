const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role, adminKey } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all required fields." });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "A user with this email already exists." });
      }

      let userRole = "User";
      if (role === "Admin") {
        const secret = process.env.ADMIN_KEY || "admin123";
        if (adminKey === secret) {
          userRole = "Admin";
        } else {
          return res.status(400).json({ message: "Invalid admin secret key." });
        }
      }

      const user = await User.create({
        name,
        email,
        password,
        role: userRole
      });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "secret123",
        { expiresIn: "1d" }
      );

      res.status(201).json({
        message: "Registration successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Please provide both email and password." });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "secret123",
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json({ user });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = authController;
