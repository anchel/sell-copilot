<template>
  <div class="main">
    <van-space class="top">
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
              src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
              @click="onClickGoodsItem(item)"
            />
            <div class="right">
              <div class="content">
                <div>{{ item.title }}</div>
                <div>{{ item.description }}</div>
                <div>{{ item.goods_sku_total }}</div>
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
                  <van-button type="primary" size="mini" plain>生成缩略图</van-button>
                </van-space>
              </div>
            </div>
          </div>
        </van-cell>
      </van-list>
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
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'
import ajax from '@/lib/request'

const router = useRouter()

const finished = ref(false)
const loading = ref(false)
const list = ref([])

const onLoad = async () => {
  await getData()
}

onMounted(() => {})

const offset = ref(0)
const limit = 20

const getData = async () => {
  loading.value = true
  let response = await ajax.get(`/api/goods/list`, {
    params: {
      offset: offset.value,
      limit
    }
  })
  loading.value = false
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

const onDeleteGoodsItem = async (item, index) => {
  showDialog({
    showCancelButton: true,
    theme: 'round-button',
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

const formAdd = ref(null)
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
  formAdd.value.submit()
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
        display: flex;
        // flex-direction: column;

        .content {
          flex: 1;
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
