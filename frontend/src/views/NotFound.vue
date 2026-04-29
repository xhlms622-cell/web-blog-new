<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;

  h1 {
    font-size: 120px;
    color: #409eff;
    margin-bottom: 0;
  }

  p {
    font-size: 24px;
    color: #606266;
    margin: 20px 0;
  }
}
</style>
