<template>
	<div class="system-menu-dialog-container">
		<el-dialog
			destroy-on-close
			draggable
			:close-on-click-modal="false"
			:title="state.dialog.title"
			v-model="state.dialog.isShowDialog"
			:width="dialogWidth"
		>
			<slot name="dialogSearch" :datas="state"></slot>

			<el-form v-if="state.dialog.type !== 'imp'" ref="dialogFormRef" :model="state.formData" size="default" :label-width="labelWidth || 'auto'">
				<el-row :gutter="35">
					<el-col
						:xs="item.xs || 24"
						:sm="item.sm || 12"
						:md="item.md || 12"
						:lg="item.lg || 12"
						:xl="item.xl || 12"
						class="mb20"
						v-for="item in setShowData"
						:key="item.prop"
					>
						<el-form-item v-if="item.type != 'button' && item.type != 'null'" :label="$t(item.label)" :prop="item.prop" :rules="allRules(item)">
							<el-input
								:maxlength="item.maxlength"
								v-if="item.type === 'input'"
								v-model="state.formData[item.prop]"
								:placeholder="$t(item.placeholder) || `${$t('message.pages.pleaseEnter')} ${$t(item.label)}`"
								clearable
								:disabled="item.disabled"
								@blur="(FocusEvent: Event)=>inputBlur(item,FocusEvent)"
								@focus="(FocusEvent: Event)=>inputFocus(item,FocusEvent)"
							></el-input>
							<el-date-picker
								v-if="item.type === 'date'"
								value-format="YYYY-MM-DD"
								v-model="state.formData[item.prop]"
								type="date"
								:placeholder="$t(item.placeholder)"
								style="width: 100%"
							/>
							<!-- 数字输入框 -->
							<el-input-number
								v-if="item.type === 'number'"
								v-model="state.formData[item.prop]"
								:min="item.min || 0"
								:max="item.max"
								size="small"
								@change="(value:number)=>handleNumberInputChange(value)"
							/>
							<!-- 單選按鈕 -->
							<div v-if="item.type === 'radio'" class="mb-2 flex items-center">
								<el-radio-group v-model="state.formData[item.prop]" class="ml-4">
									<el-radio :label="0">有碼管理</el-radio>
									<el-radio :label="1">無碼管理</el-radio>
								</el-radio-group>
							</div>

							<!-- <el-input disabled v-if="item.type === 'inputFile'" v-model="state.formData[item.prop]" :placeholder="$t(item.placeholder)" clearable>
								<template #prepend
									><el-upload
										v-model:file-list="inputfileList"
										:auto-upload="false"
										ref="inputuploadRefs"
										action=""
										class="upload"
										drag
										:limit="1"
										:show-file-list="false"
										:on-exceed="inputHandleExceed"
										:on-change="inputHandleChange"
									>
										<el-button type="primary" class="ml1">瀏覽文件</el-button>
									</el-upload></template
								>
								<template #append v-if="state.formData[item.prop]"
									><el-button @click="inputsubmitUpload(item.prop, item.key)" type="primary" class="ml1">上傳文件</el-button>
									<el-button v-if="state.formData['drawPath'].includes('/')" class="look-file" @click="lookUpload(item.prop)">查看文件</el-button>
								</template>
							</el-input> -->
							<div v-if="item.type == 'tagsarea'">
								<el-tag v-for="tag in state.formData[item.prop]" :key="tag" closable class="mr10">
									{{ tag }}
								</el-tag>
							</div>
							<!-- 上傳文件優化 -->
							<el-upload
								style="width: 100%"
								v-if="item.type === 'optionFile'"
								v-model:file-list="state.formData[item.prop + 'file']"
								:auto-upload="false"
								ref="inputuploadRefs"
								action="#"
								class="upload"
								:accept="item.accept"
								drag
								:limit="1"
								:show-file-list="false"
								:on-exceed="(uploadFile:any) => newInputHandleExceed(uploadFile, item.prop)"
								:on-change="(uploadFile:any) => newInputHandleChange(uploadFile, item.prop)"
							>
								<el-input v-model="state.formData[item.prop]" :placeholder="$t(item.placeholder)" :readonly="true" :suffix-icon="FolderOpened">
									<template #append v-if="state.formData[item.prop]">
										<text class="look-file" @click.stop="lookUpload(item.prop)">{{ $t('message.pages.viewFile') }}</text>
									</template>
									>
								</el-input>
							</el-upload>
							<!-- 上传进度条弹窗 -->
							<el-dialog
								v-model="showProgress"
								:title="t('message.pages.uploadProgress')"
								width="30%"
								:close-on-click-modal="false"
								:modal="false"
								:show-close="false"
							>
								<div class="">
									<!-- 上传的文件名字 -->
									<!-- <div>{{ state.formData[item.prop] }}</div> -->
									<div class="">
										<!-- 进度条百分比 -->
										<el-progress :percentage="uploadPercentage" :format="format" max="100"></el-progress>
									</div>
								</div>
							</el-dialog>

							<!-- 上传图片 -->
							<el-upload
								ref="imageuploadRefs"
								v-model:file-list="imagefileList"
								v-if="item.type === 'uploadImage'"
								action="#"
								class="avatar-uploader"
								:show-file-list="true"
								:on-success="handleAvatarSuccess"
								:before-upload="beforeAvatarUpload"
								:http-request="httpRequest"
								:limit="1"
								:on-exceed="imageHandleExceed"
								:on-change="imageHandleChange"
							>
								<el-image class="avatar" v-if="imageUrl" :src="imageUrl" fit="contain" style="width: 148px; height: 148px" />
								<SvgIcon v-else class="avatar-uploader-icon" name="ele-Plus" />
							</el-upload>
							<el-select
								v-model="state.formData[item.prop]"
								:placeholder="$t(item.placeholder) || `${$t('message.pages.pleaseSelect')} ${$t(item.label)}`"
								:clearable="item.clearable"
								v-if="item.type === 'select'"
								style="width: 100%"
								:disabled="state.dialog.isdisable || state.formData[`${item.prop}disabled`]"
								@change="(val:any) => selectHandelChange(val,item.prop)"
								:filterable="item.filterable"
								:remote="item.remote"
								:reserve-keyword="false"
								:remote-show-suffix="item.remoteShowSuffix"
								:remote-method="(query:string) => remoteMethod(item,query)"
								:loading="item.loading"
								:multiple="item.multiple"
								:max-collapse-tags="item.maxCollapseTags"
								:collapse-tags="item.collapseTags"
								:collapse-tags-tooltip="item.collapseTagsTooltip"
							>
								<el-option v-for="val in item.options" :key="val.value || $t(val.label)" :label="$t(val.text)" :value="val.value">
									<slot name="optionFat" :row="val" :items="item"></slot>
								</el-option>
							</el-select>
							<el-switch
								v-if="item.type === 'switch'"
								v-model="state.formData[item.prop]"
								inline-prompt
								:active-text="$t('message.allButton.startup')"
								:inactive-text="$t('message.allButton.disable')"
							></el-switch>
							<el-input
								:width="224"
								v-if="item.type === 'textarea'"
								v-model="state.formData[item.prop]"
								type="textarea"
								:placeholder="$t(item.placeholder) || `${$t('message.pages.pleaseEnter')} ${$t(item.label)}`"
								:maxlength="item.maxlength || 5000"
								:autosize="{ minRows: item.minRows, maxRows: item.maxRows }"
							></el-input>
							<span v-if="item.type === 'text'" style="width: 100%; font-weight: 700; color: #1890ff">
								{{ state.formData[item.prop] }}
							</span>
						</el-form-item>

						<span v-if="item.type === 'button'">
							<el-button
								:disabled="item.disabled"
								:type="item.defaultColor || 'primary'"
								style="margin-left: 20px"
								plain
								v-if="item.type === 'button'"
								@click="dailogFormButton"
								:color="item.color"
								>{{ $t(item.label) }}</el-button
							>
						</span>
					</el-col>
				</el-row>
			</el-form>
			<slot name="dialogTable" :datas="state"></slot>
			<el-form v-if="state.dialog.type === 'imp'" class="drawer-multiColumn-form" label-width="100px">
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
						@click="submitUpload"
						>{{ $t('message.pages.startUploading') }}</el-button
					>
				</div>
			</el-form>
			<!-- 嵌套图片弹窗 -->
			<template>
				<el-dialog v-model="dialogVisible" width="50%" title="大圖展示" append-to-body
					><el-image fit="contain" :src="dialogImageUrl" alt="Preview Image"
				/></el-dialog>
			</template>
			<!-- 嵌套弹窗 -->
			<template v-if="dialogType == 'nestDialogConfig'">
				<el-dialog
					draggable
					:close-on-click-modal="false"
					:title="state.innerdialog.title"
					v-model="state.innerdialog.isShowInnerDialog"
					width="40%"
					append-to-body
				>
					<el-form ref="innnerDialogFormRef" :model="state.formInnerData" size="default">
						<el-row :gutter="35">
							<el-col
								:xs="item.xs || 24"
								:sm="item.sm || 12"
								:md="item.md || 12"
								:lg="item.md || 12"
								:xl="item.xl || 12"
								class="mb20"
								v-for="item in innerDialogConfig"
								:key="item.prop"
							>
								<el-form-item v-if="item.type != 'button'" :label="$t(item.label)" :prop="item.prop" :rules="allRules(item)">
									<el-input
										v-if="item.type === 'sacnstockqtyInput'"
										v-model="state.formInnerData[item.prop]"
										:placeholder="$t(item.placeholder)"
										clearable
										@input=" (val:any) => commonInputHandleChange(val,item.prop)"
										@keyup=" (target:any) => inputNum(target,item.prop)"
									></el-input>

									<div v-else-if="item.type == 'tagsarea'">
										<el-tag v-for="tag in state.formInnerData[item.prop]" :key="tag" closable @close="handleTagClose(tag)" class="mr10">
											{{ tag }}
										</el-tag>
									</div>
									<!-- 入库数量 -->
									<span v-else style="width: 100%; font-weight: 700; color: #1890ff">
										{{ state.formInnerData[item.prop] }}
									</span>
								</el-form-item>
								<!-- <span v-else>
									<el-button type="primary" plain v-if="item.type === 'button'" @click="dailogFormButton">{{ item.label }}</el-button>
								</span> -->
								<span v-else>
									<slot name="buttonFooter" :row="item" :data="state"></slot>
								</span>
							</el-col>
						</el-row>
					</el-form>

					<template #footer v-if="isFootBtn">
						<span class="dialog-footer">
							<slot name="dialogFooterBtn" :data="state"></slot>
							<el-button type="success" plain size="default" @click="onExportQrcodeData"> 導出二維碼 </el-button>
							<el-button @click="innnerDialogCancel" size="default">清 空</el-button>
							<el-button type="primary" @click="innnerDialogSubmit(innnerDialogFormRef)" size="default">確 定</el-button>
						</span>
					</template>
				</el-dialog>
			</template>
			<template #footer v-if="isFootBtn">
				<span class="dialog-footer">
					<slot name="dialogOtherFooter" :datas="state" :ref="dialogFormRef"></slot>
					<el-button @click="onCancel" size="default">{{ $t('message.allButton.cancel') }}</el-button>
					<slot name="dialogBtn" :data="state" :ref="dialogFormRef"></slot>
					<el-button :disabled="footBtnDisabled" :loading="loadingBtn" type="primary" @click="onSubmit(dialogFormRef)" size="default">{{
						state.dialog.submitTxt
					}}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemMenuDialog">
import { defineAsyncComponent, reactive, onMounted, ref, nextTick, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { debounce } from '/@/utils/debounceAndThrottle';
import { ElMessage, genFileId, UploadRawFile, FormRules, FormInstance, ElMessageBox } from 'element-plus';
import type { UploadInstance, UploadProps, UploadUserFile, UploadRequestOptions, UploadFile } from 'element-plus';
import { FolderOpened } from '@element-plus/icons-vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { getUploadFile2S3Api, getUploadFileApi } from '/@/api/global/index';
import { verifyPhone, verifyTelPhone, verifyEmail, verifiyNumberInteger } from '/@/utils/toolsValidate';
import { useI18n } from 'vue-i18n';
import table2excel from 'js-table2excel';
import { useRouter } from 'vue-router';
const router = useRouter();
// 引入组件
const IconSelector = defineAsyncComponent(() => import('/@/components/iconSelector/index.vue'));
const emit = defineEmits([
	'downloadTemp',
	'importTableData',
	'addData',
	'dailogFormButton',
	'innerDialogData',
	'commonInputHandleChange',
	'handleTagClose',
	'innnerDialogCancel',
	'selectChange',
	'innnerDialogSubmit',
	'openInnerDialog',
	'editDialog',
	'otherDialog',
	'remoteMethod',
	'handleNumberInputChange',
	'inputHandleChange',
	'beforeAvatarUpload',
	'newInputHandleExceed',
	'inputBlur',
	'inputFocus',
]);
// 定义父组件传过来的值
const props = defineProps({
	// 弹出框内容
	dialogConfig: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	innerDialogConfig: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	dialogType: {
		type: String,
		default: () => '',
	},
	isFootBtn: {
		type: Boolean,
		default: () => true,
	},
	footBtnDisabled: {
		type: Boolean,
		default: () => false,
	},
	dialogWidth: {
		type: String,
		default: () => '769px',
	},
	tagsData: {
		type: Array,
		default: () => [],
	},
	loadingBtn: {
		type: Boolean,
		default: () => false,
	},
	labelWidth: {
		type: String,
		default: () => 'auto',
	},
});
const { t } = useI18n();
const uploadRefs = ref<UploadInstance>();
const inputuploadRefs = ref<UploadInstance>();
const imageuploadRefs = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);
const inputfileList = ref<UploadUserFile[]>([]);
const imagefileList = ref<UploadUserFile[]>([]);
const fileListName = ref();
// 定义变量内容
const dialogFormRef = ref();
const innnerDialogFormRef = ref();
const uploadForm = ref();
const inputuploadForm = ref();
const imageUrl = ref('');
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const showProgress = ref(false);
const iscontu = ref(false);
let rules = reactive<EmptyObjectType>({});
const state = reactive<dialogFormState>({
	formData: {},
	vendors: [],
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
		isdisable: false,
	},
	formInnerData: {},
	innerdialog: {
		isShowInnerDialog: false,
		type: '',
		title: '',
		submitTxt: '',
		isdisable: false,
	},
});
// 輸入框失去焦點
const inputBlur = (item: EmptyObjectType, FocusEvent: Event) => {
	emit('inputBlur', state.formData, item, FocusEvent);
};
// 輸入框獲取焦點
const inputFocus = (item: EmptyObjectType, FocusEvent: Event) => {
	emit('inputFocus', state.formData, item, FocusEvent);
};
const ondownloadTemp = () => {
	emit('downloadTemp');
};
const dailogFormButton = () => {
	emit('dailogFormButton', state.formData);
};
// 改变number的值
const handleNumberInputChange = (value: number) => {
	emit('handleNumberInputChange', value, state.formData);
};
// 校验表单
const validatePass = (rule: any, value: any, callback: any, item: EmptyObjectType) => {
	const validateForm = item.validateForm;
	if (value === '') {
		callback(new Error(`${t(item.label)} ${t('message.hint.noEmpty')}`));
	} else if (
		(validateForm && validateForm === 'phone' && !verifyPhone(value) && !verifyTelPhone(value)) ||
		(validateForm === 'email' && !verifyEmail(value)) ||
		(validateForm === 'number' && !verifiyNumberInteger(value))
	) {
		callback(new Error(item.message));
	} else {
		callback();
	}
};
const allRules = (item: EmptyObjectType) => {
	rules = {
		default: [
			{
				required: item.required,
				message: `${t(item.label)} ${t('message.hint.noEmpty')}`,
				trigger:
					item.type === 'input' || item.type === 'inputFile' || item.type === 'textarea' || item.type === 'select' || item.type === 'optionFile'
						? 'blur'
						: 'change',
				// type:'number',
			},
		],
		other: [
			{ validator: (rule: any, value: any, callback: any) => validatePass(rule, value, callback, item), trigger: 'change', required: item.required },
		],
	};
	return item.validateForm ? rules['other'] : rules['default'];
};

// 打开弹窗
const openDialog = (type: string, row?: any, title?: string, submitTxt?: string) => {
	if (type === 'add') {
		state.dialog.isdisable = false;
		state.dialog.title = t('message.allButton.addBtn') + ' ' + t(title!) || t('message.allButton.addBtn');
		if (submitTxt) {
			state.dialog.submitTxt = t(submitTxt);
		} else {
			state.dialog.submitTxt = t('message.allButton.addSubmit');
		}
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			state.formData = {};
			// if (imageUrl.value) {
			// 	inputuploadForm.value = '';
			// 	// 清除图片
			// 	let upload_list: any = imageuploadRefs.value;
			// 	upload_list[0]!.clearFiles();
			// 	imagefileList.value = [];
			// 	imageUrl.value = '';
			// }
			dialogFormRef.value?.resetFields();
		});
	} else if (type === 'edit') {
		nextTick(() => {
			dialogFormRef.value?.clearValidate();
		});
		state.dialog.title = t('message.allButton.editBtn') + ' ' + t(title!) || t('message.allButton.editBtn');
		state.dialog.submitTxt = t('message.allButton.editSubmit');
		// 解决表单重置不成功的问题
		nextTick(() => {
			state.formData = JSON.parse(JSON.stringify(row));
			imagefileList.value = [];
			if (row.picture) imagefileList.value.push({ name: 'figure.png', url: state.formData.picture });
			imageUrl.value = state.formData.picture;
			emit('editDialog', state.formData);
		});
		props.dialogConfig.forEach((v) => {
			if (v.editDisable) {
				state.dialog.isdisable = true;
			}
		});
	} else if (type === 'imp') {
		fileListName.value = '';
		state.dialog.title = t('message.pages.uploadFile');
		state.dialog.submitTxt = '開始上傳';
	} else {
		state.dialog.title = t(title!);
		state.dialog.submitTxt = submitTxt ? t(submitTxt!) : t('提交');
		nextTick(() => {
			if (row) state.formData = JSON.parse(JSON.stringify(row));
			dialogFormRef.value && dialogFormRef.value.resetFields();
			innnerDialogFormRef.value && innnerDialogFormRef.value.resetFields();
		});
	}
	state.dialog.type = type;
	state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 打开嵌套弹窗
const openInnerDialog = (title?: string) => {
	state.innerdialog.title = title;
	state.innerdialog.isShowInnerDialog = true;
	emit('openInnerDialog', state);
};
const closeInnerDialog = () => {
	state.innerdialog.isShowInnerDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 導出二維碼編碼
const onExportQrcodeData = () => {
	const { meta } = router.currentRoute.value;
	let { formInnerData } = state;
	if (formInnerData.codeList.length <= 0) return ElMessage.warning('請先錄入二維碼');
	let codes = formInnerData.codeList.map((item: any) => {
		return { code: item };
	});
	table2excel(
		[{ key: 'code', title: '二維碼編碼', type: 'text' }],
		codes,
		`${meta.title}- ${state.dialog.title}二維碼 ${new Date().toLocaleString()}.xls`
	);
};
const innnerDialogCancel = () => {
	emit('innnerDialogCancel', state.formData, state.formInnerData);
	// closeInnerDialog();
};
//内嵌弹窗提交
const innnerDialogSubmit = (formEl: EmptyObjectType | undefined) => {
	if (!formEl) return;
	formEl.validate((valid: boolean) => {
		if (valid) {
			emit('innnerDialogSubmit', state.formInnerData, state.formData);
			closeInnerDialog();
		} else {
		}
	});
};
// 提交
const onSubmit = (formEl: EmptyObjectType | undefined) => {
	if (!formEl) return;
	formEl.validate((valid: boolean) => {
		if (valid) {
			emit('addData', state.formData, state.dialog.type, state.formInnerData);
		}
	});
};
// 初始化 form 字段，取自父组件 prop
const initFormField = () => {
	if (props.dialogConfig.length <= 0 || props.innerDialogConfig.length <= 0) return false;
	props.dialogConfig.forEach((v) => {
		if (v.type === 'optionFile') {
			state.formData[v.prop + 'file'] = [];
		} else {
			state.formData[v.prop] = '';
		}
	});
	props.innerDialogConfig.forEach((v) => {
		(state.formInnerData[v.prop] = ''), (state.formInnerData['codeList'] = []);
	});
};
// 设置顯示的数据
const setShowData = computed(() => {
	return props.dialogConfig.filter((v) => v.isCheck);
});
// 输入框一输入变化（不需要光标移开）
const commonInputHandleChange = (val: any, prop: string) => {
	emit('commonInputHandleChange', val, prop, state, iscontu.value);
};
let arr: EmptyArrayType = [];
// 判斷是鍵盤輸入還是掃描槍輸入
const inputNum = (target: EmptyObjectType, prop: string) => {
	let timenow = target.timeStamp;
	arr.push(timenow);
	for (let i in arr) {
		if (Math.ceil(arr[arr.length - 1]) - Math.ceil(arr[arr.length - 2]) >= 30) {
			iscontu.value = false;
		} else {
			iscontu.value = true;
		}
		if (i && arr.length == parseInt(i) + 1) {
			if (iscontu.value == true) {
				return;
			}
		}
	}
};
// 关闭tag标签
const handleTagClose = (tag: any) => {
	emit('handleTagClose', tag, state);
};
// 下拉框数据变化
const selectHandelChange = (val: string, prop: string) => {
	emit('selectChange', val, prop, state.formData);
};
// 能搜索的下拉框
const remoteMethod = (item: EmptyObjectType, query: string) => {
	emit('remoteMethod', query, state.formData, item);
};

let flag = true;
// 優化的 可以在选中时自动替换上一个文件
const newInputHandleExceed: UploadProps['onExceed'] = (files, prop) => {
	flag = false;
	let upload_list: any = inputuploadRefs.value;
	upload_list[0]!.clearFiles();
	const file = files[0] as UploadRawFile;
	file.uid = genFileId();
	upload_list[0]!.handleStart(file);
	emit('inputHandleChange', files[0], prop, state.formData, dialogFormRef.value);
	const props = prop + '';
	if (props == 'programFilePath' && state.formData.error === 0) {
		flag = true;
		return;
	}
	inputuploadForm.value = files[0];
	getFileData(files[0], prop);
	emit('newInputHandleExceed', files, prop, state.formData);
	flag = true;
};
// 格式化进度，使用百分比进行展示
const format = (percentage: any) => `${percentage}%`;
// 上传百分比
const uploadPercentage = ref(0);
let times = null;

// 優化的 文件input框里面的数据
const newInputHandleChange: UploadProps['onChange'] = async (uploadFile, prop) => {
	if (!flag) return;
	// if (uploadFile.type !== 'application/x-zip-compressed' ) {
	// 	ElMessage.error('文件必須是.zip格式!');return
	// }
	dialogFormRef.value?.clearValidate();
	emit('inputHandleChange', uploadFile, prop, state.formData, dialogFormRef.value);
	const props = prop + '';
	if (props == 'programFilePath' && state.formData.error === 0) {
		return;
	}
	inputuploadForm.value = uploadFile;
	getFileData(uploadFile, prop);
};
const getFileData = async (uploadFile: EmptyObjectType, prop: any) => {
	// 打开进度条弹窗
	showProgress.value = true;
	uploadPercentage.value = 0;
	times = setInterval(() => {
		uploadPercentage.value = (uploadPercentage.value % 100) + 10;
	}, 1000);

	const uploadTypeMap: EmptyObjectType = { programFilePath: 1, lwsFilePath: 2 };
	let res = null;
	if (prop === 'programFilePath') {
		const { projectName, projectCode, productionLineType } = state.formData;
		res = await getUploadFile2S3Api(projectName, projectCode, productionLineType, uploadTypeMap[prop + ''], inputuploadForm.value.raw);
	} else {
		res = await getUploadFileApi(uploadTypeMap[prop + ''], inputuploadForm.value.raw);
	}

	if (res!.code === 203) {
		showProgress.value = false;
		ElMessageBox.confirm(t('程式包已上傳，是否使用上次上傳的文件'), t('message.hint.tips'), {
			confirmButtonText: t('message.allButton.ok'),
			cancelButtonText: t('message.allButton.cancel'),
			type: 'warning',
			draggable: true,
			closeOnClickModal: false,
		})
			.then(async () => {
				props.dialogConfig.forEach((v) => {
					if (v.type === 'optionFile' && v.prop === prop) {
						state.formData[v.prop] = uploadFile.name;
					}
				});
				state.formData[prop + 'fileUrl'] = res!.data;
			})
			.catch(() => {
				state.formData[prop + 'fileUrl'] = '';
				state.formData[prop + 'file'] = [];
				state.formData[prop + ''] = '';
				showProgress.value = false;
				ElMessage.warning(res!.message);
			});
	} else if (res!.code !== 203 && res!.status) {
		uploadPercentage.value = 100;
		ElMessage.success(`上傳成功`);
		props.dialogConfig.forEach((v) => {
			if (v.type === 'optionFile' && v.prop === prop) {
				state.formData[v.prop] = uploadFile.name;
			}
		});
		state.formData[prop + 'fileUrl'] = res!.data;
		showProgress.value = false;
	} else {
		state.formData[prop + 'fileUrl'] = '';
		state.formData[prop + 'file'] = [];
		state.formData[prop + ''] = '';
		showProgress.value = false;
		// ElMessageBox.confirm('上傳失敗! 請檢查此文件是否已經上傳過', '警告', {
		// 	type: 'error',
		// 	draggable: true,
		// 	closeOnClickModal: false,
		// 	showCancelButton: false,
		// })
		// 	.then(async () => {})
		// 	.catch(() => {});
	}
};
watch(
	() => uploadPercentage.value,
	() => {
		if (uploadPercentage.value >= 90) clearInterval(times!);
	},
	{
		deep: true,
	}
);

// 查看上传的文件
const lookUpload = (prop: string) => {
	// window.open(
	// 	`${import.meta.env.MODE === 'development' ? import.meta.env.VITE_API_URL : window.webConfig.webApiBaseUrl}${state.formData[prop + 'fileUrl']}`,
	// 	'_blank'
	// );
	window.open(`${state.formData[prop + 'fileUrl']}`, '_blank');
};
// // 上传错误提示
// const handleError = () => {
// 	ElMessage.error('导入数据失败，请您重新上传！');
// };

// //上传成功提示
// const handleSuccess = () => {
// 	ElMessage.success('导入数据成功！');
// 	// ElNotification({
// 	// 	title: '温馨提示',
// 	// 	message: '导入数据成功！',
// 	// 	type: 'success',
// 	// });
// };
// 文件上传
// const uploadExcel = async (param: any) => {
// 	console.log(param);
// 	let fileFormData = new FormData();
// 	fileFormData.append('file', param.file, param.file.name);

// 	console.log(param);
// 	console.log(formdata.get(file));

// 	emit('importTableData');
// 	// const res = await importUrl(fileFormData);
// 	// if (res.code !== 0) return param.onError();
// 	// closeDialog(); // 关闭弹窗
// };
const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
	fileListName.value = uploadFile.name;
	uploadForm.value = uploadFile;
};

//可以在选中时自动替换上一个文件
const handleExceed: UploadProps['onExceed'] = (files) => {
	uploadRefs.value!.clearFiles();
	const file = files[0] as UploadRawFile;
	file.uid = genFileId();
	uploadRefs.value!.handleStart(file);
};

// 上传文件
const submitUpload = () => {
	// uploadRefs.value!.submit();
	emit('importTableData', uploadForm.value);
	// closeDialog();
};
// 上传图片
const handleAvatarSuccess: UploadProps['onSuccess'] = async (response, uploadFile) => {
	// console.log(imagefileList.value[0]);
	// let arr = imagefileList.value;
	// imagefileList.value = [];
	// imagefileList.value.push(arr[arr.length - 1]);
};
// 图片改变时
const imageHandleChange: UploadProps['onChange'] = async (uploadFile, uploadFiles) => {
	imageUrl.value = URL.createObjectURL(uploadFile.raw!);
	imagefileList.value = uploadFiles;
};
//可以在选中时自动替换上一个文件
const imageHandleExceed: UploadProps['onExceed'] = async (files, uploadFiles) => {
	if (files[0].type !== 'image/jpeg' && files[0].type !== 'image/png') {
		ElMessage.error('圖片必須是JPG或者PNG格式!');
	} else {
		let upload_list: any = imageuploadRefs.value;
		upload_list[0]!.clearFiles();
		const file = files[0] as UploadRawFile;
		file.uid = genFileId();
		upload_list[0]!.handleStart(file);
		httpRequest();
	}
};
// 查看大图
const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
	dialogImageUrl.value = uploadFile.url!;
	dialogVisible.value = true;
};
const handlePictureChange = (file: UploadFile) => {};
const httpRequest = async () => {
	const res = await getUploadFileApi(5, imagefileList.value[0].raw);
	if (res.status) {
		props.dialogConfig.forEach((item) => {
			if (item.type === 'uploadImage') {
				state.formData[item.prop] = res.data;
			}
		});
	}
};
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
	if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
		ElMessage.error('圖片必須是JPG或者PNG格式!!');
	}
	//  else if (rawFile.size / 1024 / 1024 > 2) {
	// 	ElMessage.error('图片大小不能超过2MB!');
	// 	return false;
	// }
	return true;
};
// 页面加载时
onMounted(() => {
	initFormField();
});

// 暴露变量
defineExpose({
	openDialog,
	closeDialog,
	openInnerDialog,
	closeInnerDialog,
});
</script>

<style scoped lang="scss">
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
.input-file {
	display: flex;
}
.look-file {
	text-align: center;
	color: var(--el-color-primary) !important;
}
:deep(.el-upload-list--picture-card) {
	flex-wrap: nowrap !important;
}
.avatar-uploader .avatar {
	width: 148px;
	height: 148px;
	display: block;
}

.avatar-uploader {
	width: 148px;
	height: 148px;
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
	border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 148px;
	height: 148px;
	text-align: center;
}
</style>
