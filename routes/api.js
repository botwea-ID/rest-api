const express = require('express');
const router = express.Router();
const { cekKey } = require('../database/db'); 
const { youtubePlay, youtubeMp4, youtubeMp3 ,TiktokDl} = require('../controllers/yt');
const { cakLontong, bijak, quotes, fakta, ptl, motivasi,drakjoke } = require('../controllers/randomtext');
// Check Apikey
router.get('/checkkey', async (req, res) => {
    const apikey = req.query.apikey;
    if (apikey === undefined) return res.status(404).send({
        status: 404,
        message: `Input Parameter apikey`
    });
    const check = await cekKey(apikey);
    if (!check) return res.status(403).send({
        status: 403,
        message: `apikey ${apikey} not found, please register first!`
    });
    res.send({status: 200, apikey: apikey, response: 'Active'});
});
router.get('/cekip', async (req, res) => {
  console.log(req.headers);
  res.json({
  status : true,
  your_ip : req.headers["x-forwarded-for"] || req.headers.remoteAddress, 
  your_lang : req.headers["accept-language"].split(",")[0], 
  your_user_agent : req.headers["user-agent"].split("(")[1].split(")")[0]
  });
});

// Router Api
router.get('/ytplay', youtubePlay);
router.get('/ytmp4', youtubeMp4);
router.get('/ytmp3', youtubeMp3);
router.get('/tiktok', TiktokDl);
router.get('/caklontong', cakLontong);
router.get('/quotes', quotes);
router.get('/fakta', fakta);
router.get('/bijak', bijak);
router.get('/ptl', ptl);
router.get('/motivasi', motivasi);
router.get('/drakjokes', drakjokes);

module.exports = router;
