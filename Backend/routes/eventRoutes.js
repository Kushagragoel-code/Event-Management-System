const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration
} = require('../controllers/eventController');
const {
  authenticateUser,
  requireAdmin
} = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticateUser, requireAdmin, createEvent);
router.put('/:id', authenticateUser, requireAdmin, updateEvent);
router.delete('/:id', authenticateUser, requireAdmin, deleteEvent);
router.post('/:id/register', authenticateUser, registerForEvent);
router.post('/:id/cancel', authenticateUser, cancelEventRegistration);
router.post('/:id/unregister', authenticateUser, cancelEventRegistration);

module.exports = router;
