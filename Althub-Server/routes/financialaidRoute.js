import express from 'express';
import bodyParser from "body-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import financialaid_controller from "../controllers/financialaidController.js";

const financialaid_route = express.Router();

financialaid_route.use(bodyParser.json());
financialaid_route.use(bodyParser.urlencoded({ extended: true }));

// 2. Apply 'requireAuth' to secure the endpoints
financialaid_route.post('/addFinancialAid', requireAuth, financialaid_controller.AddFinancialAid);
financialaid_route.get('/getFinancialAid', requireAuth, financialaid_controller.getFinancialAid);
financialaid_route.get('/getFinancialAidByInstitute/:institutename', requireAuth, financialaid_controller.getFinancialAidByInstitute);
financialaid_route.delete('/deleteFinancialAid/:id', requireAuth, financialaid_controller.deleteFinancialAid);
financialaid_route.post('/editFinancialAid', requireAuth, financialaid_controller.editFinancialAid);

export default financialaid_route;