const express=require('express');
const reportsController=require('../contollers/report-contoller');
const router=express.Router();
router.get('/', reportsController.getReports);
router.post('/',reportsController.write);
module.exports=router;