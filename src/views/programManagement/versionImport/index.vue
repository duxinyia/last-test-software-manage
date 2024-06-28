<template>
	<div class="table-container layout-padding">
		<div class="table-padding layout-padding-view layout-padding-auto">
			<el-form class="drawer-multiColumn-form" label-width="100px">
				<el-button size="default" class="buttonBorder mb10" @click="ondownloadTemp" type="primary" plain>{{
					$t('message.pages.downloadTemplate')
				}}</el-button>
				<div class="download-form">
					<el-input :readonly="true" v-model="fileListName" :placeholder="t('message.pages.pleaseClickTheBrowseFileButton')" />
					<el-upload
						v-model:file-list="fileList"
						:auto-upload="false"
						ref="uploadRefs"
						action=""
						class="upload"
						drag
						accept=".xlsx, .xls"
						:limit="1"
						:show-file-list="false"
						:on-exceed="handleExceed"
						:on-change="handleChange"
					>
						<el-button type="primary" size="default" class="ml10 buttonBorder bottonDownload" plain>{{ $t('message.pages.browseFile') }}</el-button>
					</el-upload>
					<el-button
						:disabled="fileListName ? false : true"
						size="default"
						class="ml10 buttonBorder bottonDownload"
						type="primary"
						plain
						@click="submitUpload(uploadForm)"
						>{{ $t('開始導入') }}</el-button
					>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts" name="releaseHistory">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, FormInstance, genFileId, UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { getUploadFileApi } from '/@/api/global';
import { postImportVersionFromExcelApi } from '/@/api/programManagement/versionImport';

// 定义变量内容
const { t } = useI18n();
const fileListName = ref();
const fileList = ref<UploadUserFile[]>([]);
const uploadRefs = ref<UploadInstance>();
const uploadForm = ref();
// 下載模板
const ondownloadTemp = () => {
	window.open(
		`${import.meta.env.MODE === 'development' ? import.meta.env.VITE_API_URL : window.webConfig.webApiBaseUrl}/VersionImportTemplate.xlsx`,
		'_blank'
	);
};
//可以在选中时自动替换上一个文件
const handleExceed: UploadProps['onExceed'] = (files) => {
	uploadRefs.value!.clearFiles();
	const file = files[0] as UploadRawFile;
	file.uid = genFileId();
	uploadRefs.value!.handleStart(file);
};
const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
	fileListName.value = uploadFile.name;
	uploadForm.value = uploadFile;
};
// 上传文件
const submitUpload = async (formEl: EmptyObjectType | undefined) => {
	const res = await getUploadFileApi(0, formEl!.raw);
	if (res.status) {
		const res1 = await postImportVersionFromExcelApi(res.data.relativePath);
		if (res1.status) {
			ElMessage.success(res1.message);
		}
	}
};
// 页面加载时
onMounted(() => {});
</script>

<style scoped lang="scss">
.table-container {
	.table-padding {
		padding: 15px;
		.table {
			flex: 1;
			overflow: hidden;
		}
	}
}
.bottonDownload {
	margin-top: 5px;
}
.download-form {
	display: flex;
}
:deep(.el-upload-dragger) {
	border: 0;
	padding: 0;
	background-color: transparent;
	border-radius: unset;
}
:deep(.el-input-group__prepend) {
	padding: 0;
}
</style>
