const express=require('express');
const { check } = require('express-validator');
const markersController=require('../contollers/markers-contoller');
const router=express.Router();
router.get('/user/:uid',markersController.byuserid);
router.get('/:pid',markersController.byid);
router.delete('/:pid',markersController.delmarker);
router.post('/',[
    check('type')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
      .not()
      .isEmpty()
  ],
  markersController.newmarker
);

router.patch(
  '/:pid',
  [
    check('type')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  markersController.modifmarker
);
router.get('/', markersController.getAllMarkers); 
module.exports = router;