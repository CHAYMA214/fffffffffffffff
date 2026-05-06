const express=require('express');
const nearbyController=require('../contollers/nearby-issues-contoller');
const router=express.Router();
router.post('/',nearbyController.location);
module.exports=router;