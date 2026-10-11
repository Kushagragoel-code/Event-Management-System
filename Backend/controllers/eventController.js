const mongoose = require("mongoose");
const Event = require("../models/Event");

const eventController = {
  getEvents: async (req, res) => {
    try {
      const { search, category, sort } = req.query;
      let query = {};

      if (category && category !== "All") {
        query.category = category;
      }

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      let events = Event.find(query);

      if (sort === "desc") {
        events = events.sort({ date: -1 });
      } else {
        events = events.sort({ date: 1 });
      }

      const allEvents = await events;
      res.json(allEvents);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  getEventById: async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid event ID format." });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      res.json(event);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  createEvent: async (req, res) => {
    try {
      const { title, description, date, venue, organizer, capacity, category } = req.body;

      if (!title || !description || !date || !venue || !organizer || !capacity) {
        return res.status(400).json({ message: "Please fill all required fields." });
      }

      if (new Date(date) < new Date()) {
        return res.status(400).json({ message: "Event date must be in the future." });
      }

      const newEvent = await Event.create({
        title: title.trim(),
        description: description.trim(),
        date,
        venue: venue.trim(),
        organizer: organizer.trim(),
        capacity: Number(capacity),
        category: category || "General",
        createdBy: req.user.id,
        attendees: []
      });

      res.status(201).json(newEvent);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  updateEvent: async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid event ID format." });
      }

      if (req.body.date && new Date(req.body.date) < new Date()) {
        return res.status(400).json({ message: "Event date must be in the future." });
      }

      const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) {
        return res.status(404).json({ message: "Event not found." });
      }
      res.json(updated);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid event ID format." });
      }

      await Event.findByIdAndDelete(req.params.id);
      res.json({ message: "Event deleted successfully." });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  registerForEvent: async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid event ID format." });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }

      const attendees = event.attendees || [];
      const already = attendees.some(id => String(id) === String(req.user.id));
      if (already) {
        return res.status(400).json({ message: "You are already registered for this event." });
      }

      if (attendees.length >= Number(event.capacity)) {
        return res.status(400).json({ message: "Event has reached full capacity." });
      }

      event.attendees.push(req.user.id);
      await event.save();

      res.json(event);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  cancelEventRegistration: async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid event ID format." });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }

      event.attendees = (event.attendees || []).filter(id => String(id) !== String(req.user.id));
      await event.save();

      res.json(event);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = eventController;
