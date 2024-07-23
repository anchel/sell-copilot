<template>
  <div class="main">
    <van-space class="header">
      <van-button type="primary" size="mini" plain @click="onOpenAddDialog">添加</van-button>
      <van-button type="primary" size="mini" plain @click="onRefresh" :disabled="disableRefresh"
        >刷新</van-button
      >
    </van-space>

    <div class="body">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell v-for="(item, index) in list" :key="item.id">
          <div class="item">
            <van-image
              width="100"
              height="100"
              :src="item.thumbnail"
              @click="onPreviewImage(item)"
            />
            <div class="right">
              <div class="content">
                <p class="title" @click="onClickGoodsItem(item)">标题：{{ item.title }}</p>
                <p>描述：{{ item.description }}</p>
                <p>数量：{{ item.goods_sku_total }}</p>
              </div>
              <div class="oper">
                <div class="top">
                  <van-button
                    icon="cross"
                    type="danger"
                    size="mini"
                    plain
                    @click="onDeleteGoodsItem(item, index)"
                  />
                </div>
                <van-space>
                  <van-button
                    icon="setting-o"
                    type="primary"
                    size="mini"
                    plain
                    @click="onOpenEditDialog(item)"
                  />
                  <van-button type="primary" size="mini" plain @click="onMergeImage(item)"
                    >生成缩略图</van-button
                  >
                </van-space>
              </div>
            </div>
          </div>
        </van-cell>
      </van-list>
    </div>
  </div>
  <!--新增对话框-->
  <van-dialog
    v-model:show="showAddDialog"
    title="新增"
    :show-cancel-button="true"
    :before-close="() => false"
    @cancel="showAddDialog = false"
    @confirm="onAddConfirm"
  >
    <van-form @submit="onSubmit" ref="formAddEl">
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
          v-model.number="addForm.goods_sku_total"
          name="goods_sku_total"
          label="sku数量"
          placeholder=""
          :rules="[]"
          type="digit"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <!-- <van-button round block type="primary" native-type="submit"> 提交 </van-button> -->
      </div>
    </van-form>
  </van-dialog>

  <!--修改对话框-->
  <van-dialog
    v-model:show="showEditDialog"
    title="修改"
    :show-cancel-button="true"
    :before-close="() => false"
    @cancel="showEditDialog = false"
    @confirm="onEditConfirm"
  >
    <van-form @submit="onSubmitEdit" ref="formEditEl">
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
          v-model.number="editForm.goods_sku_total"
          name="goods_sku_total"
          label="sku数量"
          placeholder=""
          :rules="[]"
          type="digit"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <!-- <van-button round block type="primary" native-type="submit"> 提交 </van-button> -->
      </div>
    </van-form>
  </van-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast, showLoadingToast, closeToast, showImagePreview } from 'vant'
import ajax from '@/lib/request'

const router = useRouter()

const finished = ref(false)
const loading = ref(false)

const list = ref([])

// const showInitLoading = computed(() => {
//   return !firstRequest.value && !!loading.value
// })
// const showEmptyStatus = computed(() => {
//   return !!firstRequest.value && list.value.length <= 0
// })

const onLoad = async () => {
  await getData()
}

onMounted(() => {})

const offset = ref(0)
const limit = 10

const getData = async () => {
  loading.value = true
  let response = await ajax
    .get(`/api/goods/list`, {
      params: {
        offset: offset.value,
        limit
      }
    })
    .catch((e) => {
      console.log('e', e)
      finished.value = true
    })
  loading.value = false
  if (!response || !response.data) {
    return
  }
  let data = response.data
  if (data.code != 0) {
    showToast('数据加载失败')
  } else {
    data.list.forEach((item) => {
      list.value.push(item)
    })
    offset.value += data.list.length
    if (data.list.length <= 0) {
      finished.value = true
    }
  }
}

async function refresh() {
  finished.value = false
  list.value = []
  offset.value = 0
  await getData()
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

const onClickGoodsItem = async (item) => {
  router.push({
    name: 'GoodsPanel',
    params: {
      goodsId: item.id
    }
  })
}

function onPreviewImage(item) {
  showImagePreview({
    images: [item.thumbnail],
    startPosition: 0,
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
      let response = await ajax.post(`/api/goods/del`, {
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

const onMergeImage = async (item) => {
  showDialog({
    showCancelButton: true,
    // theme: 'round-button',
    message: '确认生成缩略图吗？'
  })
    .then(async () => {
      showLoadingToast({
        message: '操作执行中...'
      })
      let response = await ajax.post(`/api/goods/merge-image`, {
        id: item.id
      })
      closeToast()
      let data = response.data
      if (data.code != 0) {
        showToast('操作失败，请稍后再试')
      } else {
        item.thumbnail = data.imagePath
        showToast('操作成功')
      }
    })
    .catch((e) => {
      console.log(e)
    })
}

// 新增
const formAddEl = ref(null)
const addForm = reactive({
  title: '',
  description: '',
  goods_sku_total: 0
})
const showAddDialog = ref(false)
const onOpenAddDialog = () => {
  showAddDialog.value = true
}

const onSubmit = async () => {
  console.log('addForm', addForm)
  let response = await ajax.post(`/api/goods/add`, addForm)
  let data = response.data
  if (data.code != 0) {
    showToast('操作失败，请稍后再试')
  } else {
    showToast('操作成功')
    showAddDialog.value = false
    await refresh()
  }
}
const onAddConfirm = async function () {
  // console.log('addForm', addForm)
  formAddEl.value.submit()
}

// 修改
const formEditEl = ref(null)
const editForm = reactive({
  id: 0,
  title: '',
  description: '',
  goods_sku_total: 0
})
const showEditDialog = ref(false)
const onOpenEditDialog = (item) => {
  editForm.id = item.id
  editForm.title = item.title
  editForm.description = item.description
  editForm.goods_sku_total = item.goods_sku_total

  showEditDialog.value = true
}

const onSubmitEdit = async () => {
  console.log('editForm', editForm)
  let response = await ajax.post(`/api/goods/${editForm.id}`, editForm)
  let data = response.data
  if (data.code != 0) {
    showToast('操作失败，请稍后再试')
  } else {
    showToast('操作成功')
    showEditDialog.value = false
    await refresh()
  }
}
const onEditConfirm = async function () {
  // console.log('editForm', editForm)
  formEditEl.value.submit()
}
</script>

<style lang="less" scoped>
.my-swipe .van-swipe-item {
  /* color: #fff; */
  font-size: 20px;
  line-height: 50px;
  text-align: center;
  /* background-color: #39a9ed; */
}

.main {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    padding: 10px;
  }

  .body {
    flex: 1;
    margin-top: 10px;
    border-top: 1px solid #ddd;
    overflow: auto;

    .item {
      text-align: left;
      display: flex;

      .right {
        flex: 1;
        display: flex;
        // flex-direction: column;

        .content {
          flex: 1;
          padding-left: 10px;

          .title {
            color: rgb(33, 33, 33);
            font-weight: bold;
          }
        }

        .oper {
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .top {
            display: flex;
            justify-content: flex-end;

            .del {
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}
</style>
