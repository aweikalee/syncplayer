<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="formRules"
    label-width="80px"
    label-position="top"
  >
    <el-form-item label="视频" prop="src">
      <el-input
        v-model="form.src"
        @change="form.filename = form.src"
        clearable
        placeholder="或输入视频地址"
      >
        <template #prepend>
          <el-button type="primary" @click="srcRef?.click()">
            选择文件
            <input
              type="file"
              ref="srcRef"
              :style="{ display: 'none' }"
              @input="onSrcInput"
              :accept="config.ext.video.join(',')"
            />
          </el-button>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="字幕" prop="subtitle">
      <el-input
        v-model="form.subtitle"
        @change="form.subtitleFilename = form.subtitle"
        clearable
        placeholder="或输入字幕地址"
      >
        <template #prepend>
          <el-button @click="subtitleRef?.click()">
            选择文件
            <input
              type="file"
              ref="subtitleRef"
              :style="{ display: 'none' }"
              @input="onSubtitleInput"
              :accept="config.ext.subtitle.join(',')"
            />
          </el-button>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="弹幕" prop="danmu">
      <template #label>
        弹幕
        <el-popover
          placement="top-start"
          title="弹幕来源说明"
          :width="400"
          :popper-style="{ maxWidth: '100%' }"
        >
          <template #reference>
            <el-icon><InfoFilled /></el-icon>
          </template>

          支持 <b>XML</b>(B站为代表) 与 <b>JSON</b>(巴哈姆特为代表)
          两种格式的弹幕文件。<br />

          非B站来源，请注意跨域。推荐下载后，使用本地文件。<br />
          <br />

          可直接输入<b>cid=xxxx</b>形式获取B站弹幕(cid可从B站视频页面接口中寻找)
        </el-popover>
      </template>

      <el-input
        v-model="form.danmu"
        @change="form.danmuFilename = form.danmu"
        clearable
        placeholder="或输入弹幕地址"
      >
        <template #prepend>
          <el-button @click="danmuRef?.click()">
            选择文件
            <input
              type="file"
              ref="danmuRef"
              :style="{ display: 'none' }"
              @input="onDanmuInput"
              :accept="config.ext.danmu.join(',')"
            />
          </el-button>
        </template>
      </el-input>
    </el-form-item>
  </el-form>

  <Dropbox @drop="onFileDrop" />
</template>

<script lang="ts" setup>
import { ElMessage, FormRules } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { InfoFilled } from '@element-plus/icons-vue'
import Dropbox from '@/components/Dropbox.vue'

import { store } from '@/store'
import { getExt, isUrl, isBlobUrl, isCid } from '@/utils'

const { source, config } = store

const isValidUrl = (val: string) => isUrl(val) || isBlobUrl(val)

const formRef = ref()
const form = reactive({
  ...source,
})

const formRules: FormRules = {
  src: [
    {
      validator(_, value, cb) {
        if (value && !isValidUrl(value)) {
          return cb(new Error('不是有效的视频地址'))
        }

        cb()
      },
      trigger: 'change',
    },
  ],
  subtitle: [
    {
      validator(_, value, cb) {
        if (value && !isValidUrl(value)) {
          return cb(new Error('不是有效的字幕地址'))
        }

        cb()
      },
    },
  ],
  danmu: [
    {
      validator(_, value, cb) {
        if (value && !(isValidUrl(value) || isCid(value))) {
          return cb(new Error('不是有效的弹幕地址'))
        }

        cb()
      },
    },
  ],
}

const srcRef = ref()
const subtitleRef = ref()
const danmuRef = ref()

function onSrcInput(e: Event) {
  const file = (e.target as any)?.files?.[0]
  form.src = file ? URL.createObjectURL(file) : ''
  form.filename = file?.name || ''
}

function onSubtitleInput(e: Event) {
  const file = (e.target as any)?.files?.[0]
  form.subtitle = file ? URL.createObjectURL(file) : ''
  form.subtitleFilename = file?.name || ''
}

function onDanmuInput(e: Event) {
  const file = (e.target as any)?.files?.[0]
  form.danmu = file ? URL.createObjectURL(file) : ''
  form.danmuFilename = file?.name || ''
}

function onFileDrop(file: File) {
  const filename = file.name
  const src = URL.createObjectURL(file)

  const exts = store.config.ext
  const ext = getExt(filename)

  if (exts.video.includes(ext)) {
    form.src = src
    form.filename = filename
  } else if (exts.subtitle.includes(ext)) {
    form.subtitle = src
    form.subtitleFilename = filename
  } else if (exts.danmu.includes(ext)) {
    form.danmu = src
    form.danmuFilename = filename
  } else {
    ElMessage({
      type: 'warning',
      message: '无法识别的文件类型，请通过“选择文件”按钮选择该文件',
    })
  }
}

defineExpose({
  async submit() {
    await formRef.value.validate()
    Object.assign(store.source, form)
  },
})
</script>
