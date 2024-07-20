<template>
  <div class="main">
    <div class="header">
      <van-space>
        <van-button type="primary" size="small" plain @click="onOpenAddDialog">添加</van-button>
        <van-button type="primary" size="small" plain @click="onRefresh" :disabled="disableRefresh"
          >刷新</van-button
        >
      </van-space>
    </div>
    <div class="body">
      <van-empty description="暂无数据" v-if="!!firstRequest && list.length <= 0" />

      <van-grid :gutter="10" :border="true" :column-num="3">
        <van-grid-item v-for="(item, index) in list" :key="item.id">
          <van-image :src="item.imgurl" @click="onPreviewImage(index)" />
          <div>标题：{{ item.title }}</div>
          <div>描述：{{ item.description }}</div>
        </van-grid-item>
      </van-grid>
    </div>
  </div>

  <van-dialog
    v-model:show="showAddDialog"
    title="标题"
    :show-cancel-button="true"
    :before-close="() => false"
    @cancel="showAddDialog = false"
    @confirm="onAddConfirm"
  >
    <van-form @submit="onSubmit" ref="formAdd">
      <van-cell-group inset="">
        <van-field
          v-model="addForm.title"
          name="title"
          label="标题"
          placeholder=""
          :rules="[{ required: true, message: '请填写标题' }]"
        />
        <van-field
          v-model="addForm.description"
          name="description"
          label="描述"
          placeholder=""
          :rules="[]"
        />
        <van-field
          v-model.number="addForm.num_total"
          name="num_total"
          label="数量"
          placeholder=""
          :rules="[]"
          type="digit"
        />
        <van-field name="imgurl" label="图片上传">
          <template #input>
            <van-uploader
              :multiple="false"
              :max-count="1"
              v-model="fileList"
              :after-read="afterRead"
            />
          </template>
        </van-field>
      </van-cell-group>
      <div style="margin: 16px">
        <!-- <van-button round block type="primary" native-type="submit"> 提交 </van-button> -->
      </div>
    </van-form>
  </van-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import ajax from '@/lib/request'

// eslint-disable-next-line no-unused-vars
const router = useRouter()
const route = useRoute()

const firstRequest = ref(false)
const list = ref([])

onMounted(async () => {
  await getData(route.params.goodsId)
  firstRequest.value = true
})

async function getData(goodsId) {
  let response = await ajax.get(`/api/goods/${goodsId}/sku/list`)
  let data = response.data
  if (data.code != 0) {
    showToast('数据加载失败')
  } else {
    data.list.forEach((item) => {
      list.value.push(item)
    })
  }
}

async function refresh() {
  list.value = []
  await getData(route.params.goodsId)
}

const disableRefresh = ref(false)
async function onRefresh() {
  try {
    disableRefresh.value = true
    await refresh()
  } finally {
    disableRefresh.value = false
  }
}

const showAddDialog = ref(false)
const onOpenAddDialog = () => {
  addForm.imgurl = ''
  fileList.value = []
  showAddDialog.value = true
}

const formAdd = ref(null)
const addForm = reactive({
  title: '',
  description: '',
  imgurl: '',
  num_total: 0
})
async function onAddConfirm() {
  formAdd.value.submit()
}

async function onSubmit() {
  if (fileList.value.length <= 0) {
    showToast({
      type: 'fail',
      message: '请选择图片'
    })
    return
  }
  const imgurl = await uploadImage()
  if (!imgurl) {
    return
  }
  addForm.imgurl = imgurl
  const goodsId = route.params.goodsId
  console.log('addForm', addForm)
  let response = await ajax.post(`/api/goods/${goodsId}/sku/add`, addForm)
  let data = response.data
  if (data.code != 0) {
    showToast('操作失败，请稍后再试')
  } else {
    showToast('操作成功')
    showAddDialog.value = false
    await refresh()
  }
}

const fileList = ref([])

async function uploadImage() {
  const file = fileList.value[0]
  try {
    file.status = 'uploading'
    let response = await ajax.postForm('/api/image/upload', {
      file: file.file
    })
    const data = response.data
    if (data.code != 0) {
      showToast({
        type: 'fail',
        message: '上传图片失败:' + data.message
      })
    } else {
      file.status = 'done'
      return data.imagePath
    }
  } catch (e) {
    console.log('uploadImage', e)
    file.status = 'failed'
  }
}

const afterRead = async () => {
  // console.log('file', file)
  // let response = await ajax.postForm('/api/image/upload', {
  //   file: file.file
  // })
  // console.log(response)
  // console.log(fileList)
}

function onPreviewImage(index) {
  const imgList = list.value
    .filter((item) => {
      return !!item.imgurl
    })
    .map((item) => {
      return item.imgurl
    })
  console.log('imgList', imgList)
  showImagePreview({
    images: imgList,
    startPosition: index
  })
}
</script>

<style lang="less" scoped>
.main {
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
