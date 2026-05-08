<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <el-button :icon="themeStore.theme === 'dark' ? Moon : Sunny" circle />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="light" :class="{ active: themeStore.theme === 'light' }">
          <el-icon><Sunny /></el-icon> 亮色模式
        </el-dropdown-item>
        <el-dropdown-item command="dark" :class="{ active: themeStore.theme === 'dark' }">
          <el-icon><Moon /></el-icon> 暗色模式
        </el-dropdown-item>
        <el-dropdown-item divided command="color">
          <span>主色调</span>
          <div class="color-options" @click.stop>
            <span
              v-for="c in colors"
              :key="c"
              class="color-dot"
              :class="{ active: themeStore.primaryColor === c }"
              :style="{ background: c }"
              @click="themeStore.setPrimaryColor(c)"
            />
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9b59b6', '#1abc9c', '#e91e63', '#ff6b6b']

function handleCommand(cmd) {
  if (cmd === 'light' || cmd === 'dark') {
    themeStore.setTheme(cmd)
  }
}
</script>

<style lang="scss" scoped>
.color-options {
  display: flex;
  gap: 6px;
  padding: 4px 0;
}

.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s;

  &:hover { transform: scale(1.2); }
  &.active { border-color: var(--text-primary); }
}
</style>
