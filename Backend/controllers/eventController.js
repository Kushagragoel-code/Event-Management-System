const mongoose = require('mongoose');
const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query);
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, organizer, capacity, category } = req.body;

    if (!title || !description || !date || !venue || !organizer || capacity === undefined) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid event date' });
    }

    if (eventDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Event date cannot be in the past' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      organizer,
      capacity,
      category,
      createdBy: req.user.id,
      attendees: []
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.body.date) {
      const eventDate = new Date(req.body.date);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid event date' });
      }
      if (eventDate < new Date()) {
        return res.status(400).json({ success: false, message: 'Event date cannot be in the past' });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerForEvent = async (req, res) => {
  try {
    if (req.user.role !== 'User') {
      return res.status(403).json({ success: false, message: 'Only regular users can register for events' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isAlreadyRegistered = event.attendees.some(
      (attendeeId) => attendeeId.toString() === req.user.id.toString()
    );
    if (isAlreadyRegistered) {
      return res.status(400).json({ success: false, message: 'User is already registered for this event' });
    }

    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is already at full capacity' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Registered for event successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelEventRegistration = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isRegistered = event.attendees.some(
      (attendeeId) => attendeeId.toString() === req.user.id.toString()
    );

    if (!isRegistered) {
      return res.status(400).json({ success: false, message: 'User is not registered for this event' });
    }

    event.attendees = event.attendees.filter(
      (attendeeId) => attendeeId.toString() !== req.user.id.toString()
    );
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event registration cancelled successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration
};
