<template>
  <el-tooltip :disabled="!showTooltip" placement="top">
    <template #content>
      <div class="level-tooltip">
        <div class="level-name">{{ levelName }}</div>
        <div v-if="experience !== undefined" class="level-exp">经验: {{ experience }}</div>
      </div>
    </template>
    <span class="level-badge" :class="[`level-tier-${tier}`, `level-size-${size}`]">
      <span class="level-icon">{{ icon }}</span>
      <span class="level-text">Lv.{{ level }}</span>
    </span>
  </el-tooltip>
</template>

<script setup>
import { computed } from 'vue'

const LEVEL_NAMES = {
  1: '萌新', 2: '初级会员', 3: '中级会员', 4: '高级会员', 5: '资深会员',
  6: '元老', 7: '大神', 8: '传奇', 9: '至尊', 10: '神话'
}

const LEVEL_ICONS = {
  1: '🌱', 2: '🌿', 3: '🌳', 4: '⭐', 5: '🌟',
  6: '💎', 7: '👑', 8: '🏆', 9: '🔱', 10: '🏅'
}

const props = defineProps({
  level: { type: Number, default: 1 },
  experience: { type: Number, default: undefined },
  size: { type: String, default: 'default' }, // 'small' | 'default' | 'large'
  showTooltip: { type: Boolean, default: true }
})

const levelName = computed(() => LEVEL_NAMES[props.level] || `Lv.${props.level}`)
const icon = computed(() => LEVEL_ICONS[props.level] || '🎖️')

const tier = computed(() => {
  if (props.level >= 10) return 'gold'
  if (props.level >= 7) return 'purple'
  if (props.level >= 4) return 'blue'
  return 'green'
})
</script>

<style lang="scss" scoped>
.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1;

  .level-icon {
    font-size: 0.85em;
  }

  .level-text {
    font-size: 0.8em;
  }

  // Sizes
  &.level-size-small {
    padding: 1px 5px;
    font-size: 11px;
    gap: 1px;
  }

  &.level-size-default {
    padding: 2px 7px;
    font-size: 12px;
  }

  &.level-size-large {
    padding: 3px 10px;
    font-size: 14px;
    gap: 3px;
  }

  // Color tiers
  &.level-tier-green {
    background: color-mix(in srgb, var(--success-color) 12%, transparent);
    color: var(--success-color);
    border: 1px solid color-mix(in srgb, var(--success-color) 20%, transparent);
  }

  &.level-tier-blue {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
    border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
  }

  &.level-tier-purple {
    background: color-mix(in srgb, #9b59b6 12%, transparent);
    color: #9b59b6;
    border: 1px solid color-mix(in srgb, #9b59b6 20%, transparent);
  }

  &.level-tier-gold {
    background: color-mix(in srgb, var(--warning-color) 12%, transparent);
    color: var(--warning-color);
    border: 1px solid color-mix(in srgb, var(--warning-color) 20%, transparent);
  }
}

.level-tooltip {
  .level-name {
    font-weight: 500;
    margin-bottom: 2px;
  }

  .level-exp {
    font-size: 12px;
    opacity: 0.8;
  }
}
</style>
