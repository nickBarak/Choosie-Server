const express = require('express');
const router = express.Router();

const readBins = require('subroutes/readBins');
const createBin = require('subroutes/createBin');
const updateBin = require('subroutes/updateBin');
const deleteBin = require('subroutes/deleteBin');

router.use('/', readBins);
router.use('/createBin', createBin);
router.use('/updateBin', updateBin);
router.use('/deleteBin', deleteBin);

module.exports = router;