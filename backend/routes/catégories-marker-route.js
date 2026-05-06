const express=require('express');
const { check } = require('express-validator');
const markerscatégoriesController=require('../contollers/catégories-controller');
const router=express.Router();
router.get('/', markerscatégoriesController.getcatégmarkers);
router.delete('/:pid',markerscatégoriesController.delmarker);
router.get('/user/:uid',markerscatégoriesController.byuserid);
router.post('/',[
    check('type')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
      .not()
      .isEmpty()
  ],
  markerscatégoriesController.newcatég
);

router.patch(
  '/:pid',
  [
    check('type')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  markerscatégoriesController.modifmarker
);

module.exports = router;