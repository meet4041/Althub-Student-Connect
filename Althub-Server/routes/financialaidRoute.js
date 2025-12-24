const express = require('express');
const financialaid_route = express();
const bodyParser = require("body-parser");

// 1. Import the Authentication Middleware
const { requireAuth } = require("../middleware/authMiddleware");

financialaid_route.use(bodyParser.json());
financialaid_route.use(bodyParser.urlencoded({ extended: true }));
financialaid_route.use(express.static('public'));

const financialaid_controller = require("../controllers/financialaidController");

// 2. Apply 'requireAuth' to secure the endpoints
// Secured: Only logged-in users with a valid token can add aid
financialaid_route.post('/addFinancialAid', requireAuth, financialaid_controller.AddFinancialAid);

// Secured: The specific endpoint you asked to secure
financialaid_route.get('/getFinancialAid', requireAuth, financialaid_controller.getFinancialAid);

// Secured: Viewing specific institute aid
financialaid_route.get('/getFinancialAidByInstitute/:institutename', requireAuth, financialaid_controller.getFinancialAidByInstitute);

// Secured: Modifying data
financialaid_route.delete('/deleteFinancialAid/:id', requireAuth, financialaid_controller.deleteFinancialAid);
financialaid_route.post('/editFinancialAid', requireAuth, financialaid_controller.editFinancialAid);

module.exports = financialaid_route;