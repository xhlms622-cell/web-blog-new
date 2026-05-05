const express = require('express');
const router = express.Router({ mergeParams: true });
const { auth } = require('../middlewares/auth');
const { isBarOwner } = require('../middlewares/permission');
const barOwnerController = require('../controllers/barOwnerController');

// 所有路由需要登录 + 吧主权限
router.use(auth, isBarOwner);

router.get('/dashboard', barOwnerController.getDashboard);
router.get('/info', barOwnerController.getTiebaInfo);
router.put('/info', barOwnerController.updateTiebaInfo);
router.get('/posts', barOwnerController.getPosts);
router.put('/posts/:postId', barOwnerController.updatePost);
router.get('/members', barOwnerController.getMembers);
router.get('/reports', barOwnerController.getReports);
router.put('/reports/:reportId', barOwnerController.handleReport);

module.exports = router;
