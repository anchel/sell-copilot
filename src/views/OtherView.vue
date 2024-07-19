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

    <div>
      <van-uploader v-model="fileList" :after-read="afterRead" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import md5 from 'js-md5'

const username = ref('')
const password = ref('')

const onSubmit = async (params) => {
  console.log('onSubmit', params)
  params.password = md5(params.password)
  let response = await axios.post('/api/login', params, {})

  console.log('ret', response.data)
}

const fileList = ref([])

const afterRead = async (file) => {
  console.log('file.status', file)
  let response = await axios.postForm('/api/image/upload', {
    file: file.file
  })
  console.log(response)
}
</script>

<style lang="less" scoped>
.other {
  padding: 10px;
}
</style>
