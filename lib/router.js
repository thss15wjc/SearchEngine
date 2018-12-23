var express = require('express');
var router = express.Router();
// 引入业务逻辑文件
var pagePost = require('./pagePost');
// ping
router.get('/ping', function(req, res, next) {
  res.send('ok');
});

router.get('/list', pagePost.test);
router.post('/query', pagePost.query);
router.post('/changePage', pagePost.changePage);
router.post('/search', pagePost.searchText);
router.get('/', pagePost.search);

module.exports = router;
