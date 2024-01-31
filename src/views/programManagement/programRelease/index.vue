<template>
	<div class="table-container layout-padding">
		<div class="table-padding layout-padding-view layout-padding-auto">
			<TableSearch ref="tableSearchRef" :search="state.tableData.search" @search="onSearch" :searchConfig="state.tableData.searchConfig">
				<template #optionSearchFat="{ row }">
					<span style="float: left">{{ t('message.pages.projectName') }}：{{ row.text }}</span>
					<span style="float: right; color: var(--el-text-color-secondary)">{{ t('message.pages.productionlinetype') }}：{{ row.label }}</span>
				</template>
			</TableSearch>
			<Table
				ref="tableRef"
				v-bind="state.tableData"
				class="table"
				@delRow="onTableDelRow"
				@pageChange="onTablePageChange"
				@sortHeader="onSortHeader"
				@openAdd="openDialog"
				@onOpenOtherDialog="onOtherBtn"
			>
				<template #slotCol="{ row }">
					<el-popover placement="bottom-start" width="20%" trigger="hover">
						<el-table class="popover-table" :data="row.stationMachines" style="width: 100%" stripe max-height="250">
							<el-table-column show-overflow-tooltip align="center" prop="stationName" :label="$t('message.pages.stationName')" />
							<el-table-column show-overflow-tooltip align="center" prop="stationCode" :label="$t('機臺編號')" />
							<el-table-column show-overflow-tooltip align="center" prop="machineType" :label="$t('message.pages.machineType')" />
						</el-table>
						<template #reference>
							<span style="text-align: center; width: 100%; cursor: pointer"> {{ row.projectName }} </span>
						</template>
					</el-popover>
				</template>
			</Table>
			<!-- 新增编辑弹窗 -->
			<Dialog
				ref="stationDialogRef"
				:dialogConfig="btnType !== 'publish' ? state.tableData.dialogConfig : []"
				@addData="addData"
				:loadingBtn="loadingBtn"
				:dialogWidth="btnType === 'publish' ? '70%' : '50%'"
				:isFootBtn="btnType !== 'publish' ? true : false"
				@selectChange="onSelectChange"
				@inputHandleChange="onInputHandleChange"
				@newInputHandleExceed="newInputHandleExceed"
			>
				<template #dialogTable="{ datas }">
					<el-form ref="tableFormRef" :model="satusState.tableData" size="default">
						<Table v-if="datas.dialog.type === 'publish'" ref="dialogTableRef" v-bind="satusState.tableData" class="table-dialog">
							<template #column="{ row }">
								<a target="_blank" href="javascript:;" style="display: block" v-for="item in row.attList" @click="clickLink(item.fileUrl)">
									{{ item.fileName }}
								</a>
							</template>
						</Table>
					</el-form>
				</template>
				<template #optionFat="{ row, items }">
					<span v-if="items.prop === 'stationName'" style="float: left">{{ t('message.pages.position') }}：{{ row.value2 }}</span>
					<span v-if="items.prop === 'stationName'" style="float: right; color: var(--el-text-color-secondary); font-size: 13px"
						>{{ t('機臺編號') }}：{{ row.label }}</span
					>
					<span v-if="items.prop === 'projectId'" style="float: left">{{ t('message.pages.projectName') }}：{{ row.text }}</span>
					<span v-if="items.prop === 'projectId'" style="float: right; color: var(--el-text-color-secondary)"
						>{{ t('message.pages.productionlinetype') }}:{{ row.label }}</span
					>
				</template>
			</Dialog>
			<el-dialog draggable :close-on-click-modal="false" v-model="detaildialogVisible" :title="$t('message.pages.programReleaseDetails')" width="45%"
				><programReleaseDetailDialog :isDialog="true" :checkNoRef="checkNoRef"
			/></el-dialog>
		</div>
	</div>
</template>

<script setup lang="ts" name="programRelease">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import {
	deletePublishDeletePublishApi,
	getProjectQueryNoPageApi,
	getProjectQueryNopageProjectStationApi,
	getPublishGetSignFlowApi,
	postPublishAddPublishApi,
	postPublishQueryPageApi,
	postPublishSubmitSignApi,
} from '/@/api/programManagement/programRelease';
import { getStageQueryNoPageApi } from '/@/api/projectConfiguration/projectManage';
// 引入组件
const Table = defineAsyncComponent(() => import('/@/components/table/index.vue'));
const TableSearch = defineAsyncComponent(() => import('/@/components/search/search.vue'));
// 引入组件
const Dialog = defineAsyncComponent(() => import('/@/components/dialog/dialog.vue'));
const programReleaseDetailDialog = defineAsyncComponent(() => import('/@/views/link/programReleaseLink/index.vue'));
// 定义变量内容
const { t } = useI18n();
const stationDialogRef = ref();
const tableSearchRef = ref();
const tableRef = ref<RefType>();
const loadingBtn = ref(false);
const isFootBtn = ref(true);
const btnType = ref();
const detaildialogVisible = ref(false);
const checkNoRef = ref();
const state = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'projectName', colWidth: '', title: 'message.pages.projectName', type: 'slot', isCheck: true },
			{ key: 'programAttName', colWidth: '', title: 'message.pages.packageName', type: 'text', isCheck: true },
			{ key: 'version', colWidth: '', title: 'message.pages.programVersion', type: 'text', isCheck: true },
			{ key: 'createTime', colWidth: '', title: 'message.pages.releaseTime', type: 'text', isCheck: true },
			{
				key: 'programType',
				colWidth: '',
				title: 'message.pages.releasePackageType',
				type: 'text',
				isCheck: true,
				transfer: {
					1: 'message.pages.basePackage',
					2: 'message.pages.patchPackage',
					3: 'message.pages.completePackage',
				},
			},
			{ key: 'fileSize', colWidth: '', title: 'message.pages.packageSize', type: 'text', isCheck: true },
			// { key: 'runStatusText', colWidth: '', title: '發佈狀態', type: 'text', isCheck: true },
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: true, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: false, // 是否显示表格多选
			isOperate: true, // 是否显示表格操作栏
			isButton: true, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: true, //是否有分页
			operateWidth: 350,
			isBulkDeletionBtn: false,
		},
		topBtnConfig: [{ type: 'add', name: 'message.pages.publisher', defaultColor: 'primary', isSure: true, disabled: true }],
		btnConfig: [
			{ type: 'signProgress', name: 'message.pages.signingProgress', isSure: false, defaultColor: 'warning', icon: '' },
			{ type: 'send', name: 'message.pages.send', isSure: false, defaultColor: 'success', icon: 'ele-TopRight' },
			{ type: 'detail', name: 'message.pages.detail', isSure: false, defaultColor: 'primary', icon: 'ele-View' },
			{ type: 'del', name: 'message.allButton.deleteBtn', isSure: true, defaultColor: 'danger' },
		],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{ label: 'message.pages.projectName', placeholder: '', prop: 'projectId', required: false, type: 'select', options: [] },
			{
				label: 'message.pages.stationName',
				prop: 'stationName',
				required: false,
				type: 'input',
			},
			// {
			// 	label: 'message.pages.releaseStatus',
			// 	placeholder: '',
			// 	prop: 'machineType',
			// 	required: false,
			// 	type: 'select',
			// 	options: [],
			// },
			{ label: 'message.pages.releaseTime', prop: 'publishDate', required: false, type: 'dateRange' },
		],
		searchConfig: {
			isSearchBtn: true,
		},
		// 给后端的数据
		form: {},
		// 搜索参数（不用传，用于分页、搜索时传给后台的值，`getTableData` 中使用）
		page: {
			pageNum: 1,
			pageSize: 10,
		},
		// 打印标题
		printName: '',
		// 弹窗表单
		dialogConfig: [
			{
				label: 'message.pages.projectName',
				prop: 'projectId',
				placeholder: '',
				required: true,
				type: 'select',
				standbyType: 'select',
				isCheck: true,
				options: [],
			},
			{
				label: 'message.pages.projectCode',
				prop: 'projectCode',
				placeholder: '',
				required: false,
				type: 'text',
				standbyType: 'text',
				isCheck: true,
			},

			{
				label: 'message.pages.productionlinetype',
				prop: 'productionlinetype',
				placeholder: '',
				required: false,
				type: 'text',
				standbyType: 'text',
				isCheck: true,
			},

			{
				label: 'message.pages.programName',
				prop: 'programName',
				placeholder: '',
				required: false,
				type: 'text',
				standbyType: 'text',
				isCheck: true,
			},
			{
				label: 'message.pages.releaseType',
				prop: 'programType',
				placeholder: '',
				required: true,
				type: 'select',
				standbyType: 'select',
				isCheck: true,
				options: [
					{ value: 3, label: 'message.pages.completePackage', text: 'message.pages.completePackage' },
					{ value: 2, label: 'message.pages.patchPackage', text: 'message.pages.patchPackage' },
					{ value: 1, label: 'message.pages.basePackage', text: 'message.pages.basePackage' },
				],
			},
			{
				label: 'message.pages.stage',
				prop: 'stage',
				placeholder: '',
				required: true,
				type: 'input',
				standbyType: 'input',
				isCheck: true,
			},
			{
				label: 'message.pages.stationName',
				prop: 'stationName',
				placeholder: '',
				required: true,
				type: 'select',
				standbyType: 'select',
				isCheck: true,
				options: [],
				multiple: true,
				maxCollapseTags: 4,
				collapseTags: true,
				collapseTagsTooltip: true,
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
			},
			// {
			// 	label: '機台型號',
			// 	prop: 'machineType',
			// 	placeholder: '',
			// 	required: false,
			// 	type: 'text',
			// 	standbyType: 'text',
			// 	isCheck: true,
			// },

			// {
			// 	label: '產線類型',
			// 	prop: 'productionLineType',
			// 	placeholder: '请選擇產線類型',
			// 	required: true,
			// 	type: 'select',
			// 	standbyType: 'select',
			// 	isCheck: true,
			// 	options: [
			// 		{ value: 'NPI', label: 'NPI', text: 'NPI' },
			// 		{ value: 'MP', label: 'MP', text: 'MP' },
			// 	],
			// },

			{
				label: 'message.pages.uploadProgram',
				prop: 'programFilePath',
				placeholder: 'message.pages.pleaseClickUploadFile',
				required: true,
				type: 'optionFile',
				isCheck: true,
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
			},
			{
				label: 'message.pages.programVersion',
				prop: 'version',
				placeholder: '',
				required: false,
				type: 'text',
				standbyType: 'text',
				isCheck: true,
			},
			{
				label: 'LWS',
				prop: 'lwsFilePath',
				placeholder: 'message.pages.pleaseClickUploadFile',
				required: true,
				type: 'optionFile',
				isCheck: true,
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
			},
			{
				type: 'textarea',
				label: 'CheckSum',
				placeholder: '',
				prop: 'checkSum',
				minRows: 4,
				required: true,
				isCheck: true,
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
			},
			{
				type: 'textarea',
				label: 'message.pages.updateDescription',
				placeholder: '',
				minRows: 4,
				prop: 'describe',
				required: true,
				isCheck: true,
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
			},
		],
	},
});
const satusState = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'signFlowOrderUserId', colWidth: '', title: 'message.pages.signatory', type: 'text', isCheck: true },
			{ key: 'signUserRemarks', colWidth: '', title: 'message.pages.signingCoreNode', type: 'text', isCheck: true },
			{ key: 'updateTime', colWidth: '', title: 'message.pages.signatureTime', type: 'text', isCheck: true },
			{ key: 'signFlowNodeMemo', colWidth: '', title: 'message.pages.signIdea', type: 'text', isCheck: true },
			{ key: 'programType', colWidth: '470', title: 'message.pages.electronicDocument', type: 'slot', isCheck: true },
			{ key: 'proxyUserId', colWidth: '', title: 'message.pages.agent', type: 'text', isCheck: true },
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: false, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: false, // 是否显示表格多选
			isOperate: false, // 是否显示表格操作栏
			isButton: false, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: false, //是否有分页
			isBulkDeletionBtn: false,
			height: 500,
		},
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [],
		// 给后端的数据
		form: {},
		// 搜索参数（不用传，用于分页、搜索时传给后台的值，`getTableData` 中使用）
		page: {
			pageNum: 1,
			pageSize: 10,
		},
	},
});
// 點擊詳情或者送簽按鈕
const onOtherBtn = async (scope: EmptyObjectType, type: string) => {
	if (type === 'detail') {
		checkNoRef.value = scope.row;
		detaildialogVisible.value = true;
	} else if (type === 'send') {
		ElMessageBox.confirm(t('message.hint.signature'), t('message.hint.tips'), {
			confirmButtonText: t('message.allButton.ok'),
			cancelButtonText: t('message.allButton.cancel'),
			type: 'warning',
			draggable: true,
			closeOnClickModal: false,
		})
			.then(async () => {
				const res = await postPublishSubmitSignApi({ comKey: scope.row.publishId });
				if (res.status) {
					ElMessage.success(t('message.hint.sendSuccess'));
					getTableData();
				}
			})
			.catch(() => {});
	} else if (type === 'signProgress') {
		satusState.tableData.config.loading = true;
		btnType.value = 'publish';
		stationDialogRef.value.openDialog('publish', scope.row, 'message.pages.programSigningInformation');
		const res = await getPublishGetSignFlowApi(scope.row.publishId);
		if (res.data) {
			res.data.forEach((item: any) => {
				item.signFlowOrderUserId = `${item.signFlowOrderUserId} / ${item.signFlowOrderUserName}`;
				item.proxyUserId = item.proxyUserId && `${item.proxyUserId} / ${item.proxyUserName}`;
				// 電子文檔
				let file: EmptyObjectType = {};
				let filename: EmptyArrayType = [];
				if (item.attList && item.attList.length > 0) {
					item.attList.forEach((item: any) => {
						filename.push(item.fileName);
						file[item.programType] = item.programTypeLink;
					});
					item.programType = filename.join(',');
					// item.programType = item.attList[0].fileName;
					// item.programTypeLink = item.attList[0].fileUrl;
				}
			});
			satusState.tableData.data = res.data;
		} else {
			satusState.tableData.data = [];
		}
		satusState.tableData.config.loading = false;
	}
};
// 初始化列表数据
const getTableData = async () => {
	const form = state.tableData.form;
	// const programTypeMap: EmptyObjectType = {
	// 	1: '基礎包',
	// 	2: '補丁包',
	// 	3: '完整包',
	// };
	let data: EmptyObjectType = {
		...form,
		startTime: form.publishDate && form.publishDate[0],
		endTime: form.publishDate && form.publishDate[1],
		page: state.tableData.page,
	};
	delete data.publishDate;
	const res = await postPublishQueryPageApi(data);
	res.data.data.forEach((item: any) => {
		// item.programType = programTypeMap[item.programType];
		item.sendIsShow = item.delDisabled = item.signStatus === 0 ? false : true;
		item.signProgressIsShow = !item.sendIsShow;
	});
	state.tableData.data = res.data.data;
	state.tableData.config.total = res.data.total;
	if (res.status) {
		state.tableData.config.loading = false;
	}
};
// 點擊單子文檔
const clickLink = (row: string) => {
	window.open(row);
};
// 单元格内容换行
// const formatArray = (row: any) => {
// if (row.programType && row.programType.includes(',')) {
// 	return row.programType.split(',').join('<br>');
// } else {
// 	return row.programType;
// }
// };
// 搜索点击时表单回调
const onSearch = (data: EmptyObjectType) => {
	state.tableData.form = Object.assign({}, state.tableData.form, { ...data });
	tableRef.value?.pageReset();
};
// 打开新增編輯弹窗
const openDialog = (type: string, row: EmptyObjectType) => {
	btnType.value = type;
	stationDialogRef.value.openDialog(type, row, 'message.pages.programReleaseInformation', 'message.pages.publish');
};
const newInputHandleExceed = (uploadFile: any, prop: string, formData: EmptyObjectType) => {};
// 文件改變
const onInputHandleChange = (uploadFile: any, prop: string, formData: EmptyObjectType) => {
	if (prop === 'programFilePath') {
		formData.version = uploadFile.name.split('_')[6];
		if (formData.version && formData.version.substr(0, 1) == 'V') {
			formData.error = 1;
		} else {
			ElMessage.error(t(`message.hint.rename`));
			formData.error = 0;
			formData.programFilePath = '';
			formData.programFilePathfile = [];
			formData.programFilePathfileUrl = '';
		}
	}
};
// 下拉框改變
const onSelectChange = async (val: string, prop: string, data: EmptyObjectType) => {
	if (prop === 'productionLineType') {
		// state.tableData.dialogConfig?.forEach((item) => {
		// 	if (item.prop === 'configInfo') {
		// 		item.disabled = val === 'NPI' ? false : true;
		// 		data.configInfo = '';
		// 	}
		// });
	} else if (prop === 'projectId') {
		let projectName = '';
		options.forEach((item) => {
			if (item.value === data.projectId) {
				projectName = item.text;
			}
		});
		const res = await getProjectQueryNoPageApi(projectName);
		res.data.forEach((item: any) => {
			if (item.projectname === projectName) {
				data.productionlinetype = item.productionlinetype;
				data.projectCode = item.projectcode;
				data.programName = item.programname;
			}
		});
		if (data.productionlinetype) {
			// 階段的下拉框
			// const res = await getStageQueryNoPageApi(data.productionlinetype);
			// state.tableData.dialogConfig?.forEach((item) => {
			// 	if (item.prop === 'stage') {
			// 		item.options = res.data.map((item: any) => {
			// 			return { value: item.stage, lable: item.stage, text: item.stage, selected: false };
			// 		});
			// 	}
			// });
		}

		// data.productionlinetype = res.data[0].productionlinetype;
		// data.stage = res.data[0].stage;
		data.stage = '';
		data.stationName = '';
		getStationSelect(val);
	}
};
// 發佈數據
const addData = async (ruleForm: EmptyObjectType, type: string) => {
	// console.log(ruleForm);
	let {
		projectId,
		productionlinetype,
		stage,
		programType,
		projectCode,
		programName,
		// productionLineType,
		// configInfo,
		version,
		checkSum,
		describe,
		programFilePathfileUrl,
		lwsFilePathfileUrl,
		programFilePathfile,
		stationName,
	} = ruleForm;
	stationName = stationName.map((item: any) => {
		return { stationName: item.split(',')[0], stationCode: item.split(',')[1], machineType: item.split(',')[2] };
	});
	const getData = {
		projectId,
		productionlinetype,
		stage,
		programType,
		projectCode,
		programName,
		// productionLineType,
		// configInfo,
		version,
		checkSum,
		describe,
		stationList: stationName,
		programFilePath: programFilePathfileUrl,
		lwsFilePath: lwsFilePathfileUrl,
		fileSize: Number((programFilePathfile[0].size / (1024 * 1024)).toFixed(2)),
	};
	loadingBtn.value = true;
	// console.log(getData);
	const res = await postPublishAddPublishApi(getData);
	loadingBtn.value = false;
	if (res.status) {
		state.tableData.search[0].options!.forEach((item) => {
			if (item.value === getData.projectId) {
				state.tableData.form.projectId = item.value;
				item.selected = true;
				tableSearchRef.value.initFormField();
			}
		});
		ElMessage.success(t(`message.hint.publishSuccess`));
		stationDialogRef.value.closeDialog();
		getTableData();
	}
};
// 表格删除当前项回调
const onTableDelRow = async (row: EmptyObjectType, type: string) => {
	if (row.signStatus === 0) {
		const res = await deletePublishDeletePublishApi(row.publishId);
		if (res.status) {
			ElMessage.success(`${t('message.allButton.deleteBtn')} ${t('message.hint.success')}`);
			getTableData();
		}
	}
};
// 分页改变时回调
const onTablePageChange = (page: TableDemoPageType) => {
	state.tableData.page.pageNum = page.pageNum;
	state.tableData.page.pageSize = page.pageSize;
	getTableData();
};
// 拖动显示列排序回调
const onSortHeader = (data: TableHeaderType[]) => {
	state.tableData.header = data;
};
// 專案下拉
let options: EmptyArrayType = [];
const getSelect = async () => {
	const res = await getProjectQueryNoPageApi();
	options = res.data.map((item: any) => {
		return {
			value: item.runid,
			label: item.productionlinetype,
			text: item.projectname,
			selected: false,
		};
	});
	state.tableData.search[0].options = options;
	state.tableData.dialogConfig![0].options = options;
};
// 站位下拉
const getStationSelect = async (val: string) => {
	const res = await getProjectQueryNopageProjectStationApi(val);
	let options = res.data.map((item: any) => {
		return {
			value: item.stationname + ',' + item.stationcode + ',' + item.machinetype,
			label: item.stationcode,
			text: `${t('message.pages.position')}：${item.stationname}，${t('機臺編號')}：${item.stationcode}`,
			value2: item.stationname,
		};
	});
	// state.tableData.search[1].options = options;
	state.tableData.dialogConfig?.forEach((item) => {
		if (item.prop === 'stationName') {
			item.options = options;
		}
	});
};
// 页面加载时
onMounted(() => {
	getTableData();
	getSelect();
});
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
.popover-table :deep(thead .el-table__cell) {
	color: var(--el-text-color-primary) !important;
}
.popover-table :deep(.el-table__cell) {
	padding: 7px 0 !important;
}
:deep(.el-table--default .el-table__cell) {
	padding: 13px 0 !important;
}
</style>
