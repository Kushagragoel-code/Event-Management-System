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

      if (sort === "asc") {
        events = events.sort({ date: 1 });
      } else if (sort === "desc") {
        events = events.sort({ date: -1 });
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
        title,
        description,
        date,
        venue,
        organizer,
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
      await Event.findByIdAndDelete(req.params.id);
      res.json({ message: "Event deleted successfully." });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  registerForEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }

      const already = event.attendees.some(id => id.toString() === req.user.id.toString());
      if (already) {
        return res.status(400).json({ message: "You are already registered for this event." });
      }

      if (event.attendees.length >= event.capacity) {
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
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }

      event.attendees = event.attendees.filter(id => id.toString() !== req.user.id.toString());
      await event.save();

      res.json(event);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = eventController;
