<template>
  <div class="other">
    <h1>This is an other page</h1>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="username"
          name="username"
          label="用户名"
          placeholder="用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit"> 提交 </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import axios from 'axios'
import md5 from 'js-md5'

const router = useRouter()
// eslint-disable-next-line no-unused-vars
const route = useRoute()

const username = ref('')
const password = ref('')

const onSubmit = async (params) => {
  console.log('onSubmit', params)
  params.password = md5(params.password)
  let response = await axios.post('/api/login', params, {})

  // console.log('ret', response.data)
  let data = response.data

  if (data.code != 0) {
    showToast(data.message)
  } else {
    showToast('登录成功')
    setTimeout(() => {
      router.push({
        name: 'home'
      })
    }, 1500)
  }
}
</script>

<style lang="less" scoped>
.other {
  padding: 10px;
}
</style>
