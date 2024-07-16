<script setup>
import { ref, onMounted } from 'vue'

const finished = ref(false)
const loading = ref(false)
const list = ref([])
const onLoad = () => {
  loading.value = false
  // setTimeout(() => {
  //   const items = Array.from({ length: 20 }).map(() => list.value.length + 1)
  //   list.value = list.value.concat(items)
  //   loading.value = false
  //   if (list.value.length >= 40) {
  //     finished.value = true
  //   }
  // }, 1000)
  list.value.push({
    id: 1,
    title: '1',
    desc: '1',
    count: 1
  })
  list.value.push({
    id: 2,
    title: '2',
    desc: '2',
    count: 2
  })
}

onMounted(() => {
  onLoad()
})
</script>

<template>
  <main>
    <!-- <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav> -->
    <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item>1</van-swipe-item>
      <van-swipe-item>2</van-swipe-item>
    </van-swipe>

    <div class="main">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell v-for="item in list" :key="item.id">
          <div class="item">
            <van-image
              width="100"
              height="100"
              src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
            />
            <div class="right">
              <div class="content">
                <div>{{ item.title }}</div>
                <div>{{ item.desc }}</div>
                <div>{{ item.count }}</div>
              </div>
              <div class="oper">
                <van-button type="primary" size="mini" plain>生成缩略图</van-button>
              </div>
            </div>
          </div>
        </van-cell>
      </van-list>
    </div>
  </main>
</template>

<style lang="less" scoped>
.my-swipe .van-swipe-item {
  /* color: #fff; */
  font-size: 20px;
  line-height: 50px;
  text-align: center;
  /* background-color: #39a9ed; */
}

.main {
  margin-top: 20px;

  .item {
    text-align: left;
    display: flex;

    .right {
      flex: 1;

      .oper {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
