<template>
  <div class="sku">
    <div class="header">
      <van-space>
        <van-button type="primary" size="small" plain>添加</van-button>
        <van-button type="primary" size="small" plain>刷新</van-button>
      </van-space>
    </div>
    <div class="body">
      <van-grid :gutter="10" :border="true" :column-num="3">
        <van-grid-item v-for="item in skuList" :key="item.id">
          <van-image src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg" />
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import ajax from '@/lib/request'

// eslint-disable-next-line no-unused-vars
const router = useRouter()

const route = useRoute()

const skuList = ref([])

onMounted(async () => {
  await getSkuList(route.params.goodsId)
})

async function getSkuList(goodsId) {
  let response = await ajax.get(`/api/goods/${goodsId}/sku/list`)
  let data = response.data
  if (data.code != 0) {
    showToast('数据加载失败')
  } else {
    data.list.forEach((item) => {
      skuList.value.push(item)
    })
  }
}
</script>

<style lang="less" scoped>
.sku {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    padding: 10px;
  }

  .body {
    flex: 1;
    overflow: auto;
  }
}
</style>
