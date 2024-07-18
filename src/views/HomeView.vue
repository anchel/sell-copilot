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
  for (let i = 0; i < 10; i++) {
    list.value.push({
      id: i,
      title: i,
      desc: i,
      count: i
    })
  }
}

onMounted(() => {})
</script>

<template>
  <div class="main">
    <!-- <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav> -->
    <van-space class="top">
      <van-button type="primary" size="mini" plain>添加</van-button>
      <van-button type="primary" size="mini" plain>刷新</van-button>
    </van-space>

    <div class="body">
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
  </div>
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
  display: flex;
  flex-direction: column;

  .top {
    padding: 10px;
  }

  .body {
    flex: 1;
    margin-top: 20px;
    border-top: 1px solid #ddd;

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
}
</style>
