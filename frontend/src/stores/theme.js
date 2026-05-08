import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'light')
  const primaryColor = ref(localStorage.getItem('primaryColor') || '#409eff')

  function setTheme(val) {
    theme.value = val
    localStorage.setItem('theme', val)
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function setPrimaryColor(color) {
    primaryColor.value = color
    localStorage.setItem('primaryColor', color)
    document.documentElement.style.setProperty('--primary-color', color)
  }

  // 同步到 DOM
  watch(theme, (val) => {
    document.documentElement.classList.toggle('dark', val === 'dark')
  }, { immediate: true })

  watch(primaryColor, (color) => {
    document.documentElement.style.setProperty('--primary-color', color)
  }, { immediate: true })

  return { theme, primaryColor, toggleTheme, setTheme, setPrimaryColor }
})
