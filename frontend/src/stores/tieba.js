import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tiebaApi } from '@/api/tieba'

export const useTiebaStore = defineStore('tieba', () => {
  const categories = ref([])
  const currentTieba = ref(null)
  const posts = ref([])
  const postsPagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })

  async function fetchCategories() {
    const res = await tiebaApi.getCategories()
    categories.value = res.data
  }

  async function fetchTieba(id) {
    const res = await tiebaApi.getTieba(id)
    currentTieba.value = res.data
  }

  async function fetchPosts(tiebaId, params = {}) {
    const res = await tiebaApi.getTiebaPosts(tiebaId, params)
    posts.value = res.data.list
    postsPagination.value = res.data.pagination
  }

  async function toggleFollow(tiebaId) {
    const res = await tiebaApi.followTieba(tiebaId)
    if (currentTieba.value && currentTieba.value.id === tiebaId) {
      currentTieba.value.isFollowed = res.data.isFollowed
      currentTieba.value.member_count += res.data.isFollowed ? 1 : -1
    }
    return res.data
  }

  function clearCurrent() {
    currentTieba.value = null
    posts.value = []
  }

  return {
    categories,
    currentTieba,
    posts,
    postsPagination,
    fetchCategories,
    fetchTieba,
    fetchPosts,
    toggleFollow,
    clearCurrent
  }
})
