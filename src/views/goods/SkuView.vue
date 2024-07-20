<template>
  <div class="main">
    <div class="header">
      <van-nav-bar title="" left-text="返回" left-arrow @click-left="onClickBack" />

      <van-space style="margin-top: 6px">
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
          <div class="sku-item-content">
            <div class="left">
              <p>标题：{{ item.title }}</p>
              <p>描述：{{ item.description }}</p>
            </div>
            <div class="right">
              <van-button
                icon="setting-o"
                type="primary"
                size="mini"
                plain
                @click="onOpenEditDialog(item)"
              />
              <van-button
                icon="cross"
                type="danger"
                size="mini"
                plain
                @click="onDeleteGoodsItem(item, index)"
              />
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>
  </div>

  <van-dialog
    v-model:show="showAddDialog"
    title="新建"
    :show-cancel-button="true"
    :before-close="() => false"
    @cancel="showAddDialog = false"
    @confirm="onAddConfirm"
  >
    <van-form @submit="onAddSubmit" ref="formAddEl">
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
          label="总数量"
          placeholder=""
          :rules="[]"
          type="digit"
        />
        <van-field
          v-model.number="addForm.num_remain"
          name="num_remain"
          label="剩余数量"
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
    </van-form>
  </van-dialog>

  <van-dialog
    v-model:show="showEditDialog"
    title="修改"
    :show-cancel-button="true"
    :before-close="() => false"
    @cancel="showEditDialog = false"
    @confirm="onEditConfirm"
  >
    <van-form @submit="onEditSubmit" ref="formEditEl">
      <van-cell-group inset="">
        <van-field
          v-model="editForm.title"
          name="title"
          label="标题"
          placeholder=""
          :rules="[{ required: true, message: '请填写标题' }]"
        />
        <van-field
          v-model="editForm.description"
          name="description"
          label="描述"
          placeholder=""
          :rules="[]"
        />
        <van-field
          v-model.number="editForm.num_total"
          name="num_total"
          label="总数量"
          placeholder=""
          :rules="[]"
          type="digit"
        />
        <van-field
          v-model.number="editForm.num_remain"
          name="num_remain"
          label="剩余数量"
          placeholder=""
          :rules="[]"
          type="digit"
        />
        <van-field name="imgurl" label="图片上传">
          <template #input>
            <van-uploader
              :multiple="false"
              :max-count="1"
              v-model="fileListEdit"
              :after-read="afterRead"
            />
          </template>
        </van-field>
      </van-cell-group>
    </van-form>
  </van-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog, showImagePreview } from 'vant'
import ajax from '@/lib/request'

// eslint-disable-next-line no-unused-vars
const router = useRouter()
const route = useRoute()

function onClickBack() {
  router.back()
}

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

// 新增
const showAddDialog = ref(false)
const onOpenAddDialog = () => {
  addForm.imgurl = ''
  fileList.value = []
  showAddDialog.value = true
}

const formAddEl = ref(null)
const addForm = reactive({
  title: '',
  description: '',
  imgurl: '',
  num_total: 0,
  num_remain: 0
})
async function onAddConfirm() {
  formAddEl.value.submit()
}

async function onAddSubmit() {
  if (fileList.value.length <= 0) {
    showToast({
      type: 'fail',
      message: '请选择图片'
    })
    return
  }
  const imgurl = await uploadImage(fileList)
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

async function uploadImage(imageList) {
  const file = imageList.value[0]
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
    startPosition: index,
    closeable: true
  })
}

const onDeleteGoodsItem = async (item, index) => {
  showDialog({
    showCancelButton: true,
    // theme: 'round-button',
    message: '确认删除吗？'
  })
    .then(async () => {
      const goodsId = route.params.goodsId
      let response = await ajax.post(`/api/goods/${goodsId}/sku/del`, {
        id: item.id
      })
      let data = response.data
      if (data.code != 0) {
        showToast('操作失败，请稍后再试')
      } else {
        showToast('操作成功')
        setTimeout(() => {
          list.value.splice(index, 1)
        }, 200)
      }
    })
    .catch((e) => {
      console.log(e)
    })
}

// 编辑对话框
const showEditDialog = ref(false)
const onOpenEditDialog = (item) => {
  editForm.id = item.id
  editForm.title = item.title
  editForm.description = item.description
  editForm.imgurl = item.imgurl
  editForm.num_total = item.num_total
  editForm.num_remain = item.num_remain

  fileListEdit.value = [{ url: editForm.imgurl }]
  showEditDialog.value = true
}

const formEditEl = ref(null)
const editForm = reactive({
  id: '',
  title: '',
  description: '',
  imgurl: '',
  num_total: 0,
  num_remain: 0
})
async function onEditConfirm() {
  formEditEl.value.submit()
}

async function onEditSubmit() {
  if (fileListEdit.value.length <= 0) {
    showToast({
      type: 'fail',
      message: '请选择图片'
    })
    return
  } else {
    const firstFile = fileListEdit.value[0]
    if (firstFile.file) {
      // 重新选了新的文件，需要上传
      const imgurl = await uploadImage(fileListEdit)
      if (!imgurl) {
        return
      }
      editForm.imgurl = imgurl
    }
  }

  const goodsId = route.params.goodsId
  console.log('editForm', editForm)
  let response = await ajax.post(`/api/goods/${goodsId}/sku/${editForm.id}`, editForm)
  let data = response.data
  if (data.code != 0) {
    showToast('操作失败，请稍后再试')
  } else {
    showToast('操作成功')
    showEditDialog.value = false
    await refresh()
  }
}

const fileListEdit = ref([])
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

    .sku-item-content {
      width: 100%;
      display: flex;
      flex-direction: column;

      .left {
        flex: 1;
        color: rgb(34, 34, 34);
      }

      .right {
        display: flex;
        // flex-direction: column;
        justify-content: space-between;
      }
    }
  }
}
</style>
