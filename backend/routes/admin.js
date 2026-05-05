const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/permission');
const adminController = require('../controllers/adminController');

// 所有管理路由需要登录 + 管理员权限
router.use(auth, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// 用户管理
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);

// 贴吧管理
router.get('/tiebas', adminController.getTiebas);
router.put('/tiebas/:id/status', adminController.updateTiebaStatus);

// 帖子管理
router.get('/posts', adminController.getPosts);
router.put('/posts/:id/status', adminController.updatePostStatus);

// 举报管理
router.get('/reports', adminController.getReports);
router.put('/reports/:id', adminController.handleReport);

// 分类管理
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;
