const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Routes for auth
router.get('/users', userController.findAll);
router.get('/users/admins', userController.findAllAdmins);
router.get('/users/clerks', userController.findAllClerks);
router.get('/users/deliveryBoys', userController.findAllDeliveryBoys);
router.get('/users/unverified', userController.findAllUnverified);
router.get('/users/availableDeliveryBoys', userController.findAllAvailableDeliveryBoys);
router.get('/users/unavailableDeliveryBoys', userController.findAllUnavailableDeliveryBoys);
router.get('/users/:id', userController.findOne);
router.post('/users', userController.create);
router.delete('/users/:id', userController.delete);
router.delete('/users/', userController.deleteAll);
router.put('/users/:id', userController.update);

module.exports = router