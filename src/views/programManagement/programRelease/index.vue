<template>
	<div class="table-container layout-padding">
		<div class="table-padding layout-padding-view layout-padding-auto">
			<TableSearch ref="tableSearchRef" :search="state.tableData.search" @search="onSearch" :searchConfig="state.tableData.searchConfig">
				<template #optionSearchFat="{ row }">
					<span style="float: left">專案名：{{ row.text }}</span>
					<span style="float: right; color: var(--el-text-color-secondary)">產線類型:{{ row.label }}</span>
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
							<el-table-column show-overflow-tooltip align="center" prop="stationName" label="站位名稱" />
							<el-table-column show-overflow-tooltip align="center" prop="machineType" label="機台型號" />
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
				<template #dialogTable="{ data }">
					<el-form ref="tableFormRef" :model="satusState.tableData" size="default">
						<Table v-if="data.dialog.type === 'publish'" ref="dialogTableRef" v-bind="satusState.tableData" class="table-dialog">
							<template #column="{ row }">
								<a target="_blank" href="javascript:;" style="display: block" v-for="item in row.attList" @click="clickLink(item.fileUrl)">
									{{ item.fileName }}
								</a>
							</template>
						</Table>
					</el-form>
				</template>
				<template #optionFat="{ row, items }">
					<span v-if="items.prop === 'stationName'" style="float: left">站位：{{ row.value2 }}</span>
					<span v-if="items.prop === 'stationName'" style="float: right; color: var(--el-text-color-secondary); font-size: 13px"
						>機台型號：{{ row.label }}</span
					>
					<span v-if="items.prop === 'projectId'" style="float: left">專案名：{{ row.text }}</span>
					<span v-if="items.prop === 'projectId'" style="float: right; color: var(--el-text-color-secondary)">產線類型:{{ row.label }}</span>
				</template>
			</Dialog>
			<el-dialog draggable :close-on-click-modal="false" v-model="detaildialogVisible" title="程式發佈詳情" width="45%"
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
			{ key: 'projectName', colWidth: '', title: '專案名', type: 'slot', isCheck: true },
			{ key: 'programName', colWidth: '', title: '程式包名', type: 'text', isCheck: true },
			{ key: 'version', colWidth: '', title: '程式版本', type: 'text', isCheck: true },
			{ key: 'createTime', colWidth: '', title: '發佈開始時間', type: 'text', isCheck: true },
			{ key: 'programType', colWidth: '', title: '發佈包類型', type: 'text', isCheck: true },
			{ key: 'fileSize', colWidth: '', title: '程式包大小', type: 'text', isCheck: true },
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
			operateWidth: 320,
			isBulkDeletionBtn: false,
		},
		topBtnConfig: [{ type: 'add', name: '發佈程式', defaultColor: 'primary', isSure: true, disabled: true }],
		btnConfig: [
			{ type: 'signProgress', name: '簽核進度', isSure: false, defaultColor: 'warning', icon: '' },
			{ type: 'send', name: '送簽', isSure: false, defaultColor: 'success', icon: 'ele-TopRight' },
			{ type: 'detail', name: '詳情', isSure: false, defaultColor: 'primary', icon: 'ele-View' },
			{ type: 'del', name: 'message.allButton.deleteBtn', isSure: true, defaultColor: 'danger' },
		],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{ label: '專案名', prop: 'projectId', required: false, type: 'select', options: [] },
			{
				label: '站位名稱',
				prop: 'stationName',
				required: false,
				type: 'input',
			},
			{
				label: '發佈狀態',
				prop: 'machineType',
				required: false,
				type: 'select',
			},
			{ label: '發佈時間', prop: 'publishDate', required: false, type: 'dateRange' },
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
		printName: '表格打印演示',
		// 弹窗表单
		dialogConfig: [
			{
				label: '專案名稱',
				prop: 'projectId',
				placeholder: '请選擇專案名稱',
				required: true,
				type: 'select',
				standbyType: 'select',
				isCheck: true,
				options: [],
			},

			{
				label: '發佈類型',
				prop: 'programType',
				placeholder: '请選擇發佈類型',
				required: true,
				type: 'select',
				standbyType: 'select',
				isCheck: true,
				options: [
					{ value: 3, label: '完整包', text: '完整包' },
					{ value: 2, label: '補丁包', text: '補丁包' },
					{ value: 1, label: '基礎包', text: '基礎包' },
				],
			},
			{
				label: '產線類型',
				prop: 'productionlinetype',
				placeholder: '',
				required: false,
				type: 'text',
				standbyType: 'text',
				isCheck: true,
			},
			{
				label: '階段',
				prop: 'stage',
				placeholder: '',
				required: false,
				type: 'text',
				standbyType: 'text',
				isCheck: true,
			},
			{
				label: '站位名稱',
				prop: 'stationName',
				placeholder: '请選擇站位名稱',
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
				label: '上傳程式',
				prop: 'programFilePath',
				placeholder: '請點擊此處上傳文件',
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
				label: '程式版本',
				prop: 'version',
				placeholder: '请輸入程式版本',
				required: false,
				type: 'text',
				standbyType: 'text',
				isCheck: true,
			},
			{
				label: 'LWS',
				prop: 'lwsFilePath',
				placeholder: '請點擊此處上傳文件',
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
				placeholder: '請輸入CheckSum',
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
				label: '更新描述',
				placeholder: '請輸入更新描述',
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
			{ key: 'signFlowOrderUserId', colWidth: '', title: '簽核人員', type: 'text', isCheck: true },
			{ key: 'signUserRemarks', colWidth: '', title: '簽核節點', type: 'text', isCheck: true },
			{ key: 'updateTime', colWidth: '', title: '簽核時間', type: 'text', isCheck: true },
			{ key: 'signFlowNodeMemo', colWidth: '', title: '簽核意見', type: 'text', isCheck: true },
			{ key: 'programType', colWidth: '470', title: '電子文檔', type: 'slot', isCheck: true },
			{ key: 'proxyUserId', colWidth: '', title: '代理人', type: 'text', isCheck: true },
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
		ElMessageBox.confirm('確定送簽嗎?', '提示', {
			confirmButtonText: '確 定',
			cancelButtonText: '取 消',
			type: 'warning',
			draggable: true,
			closeOnClickModal: false,
		})
			.then(async () => {
				const res = await postPublishSubmitSignApi({ comKey: scope.row.publishId });
				if (res.status) {
					ElMessage.success(t('送簽成功'));
					getTableData();
				}
			})
			.catch(() => {});
	} else if (type === 'signProgress') {
		satusState.tableData.config.loading = true;
		btnType.value = 'publish';
		stationDialogRef.value.openDialog('publish', scope.row, '程式簽核信息');
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
	const programTypeMap: EmptyObjectType = {
		1: '基礎包',
		2: '補丁包',
		3: '完整包',
	};
	let data: EmptyObjectType = {
		...form,
		startTime: form.publishDate && form.publishDate[0],
		endTime: form.publishDate && form.publishDate[1],
		page: state.tableData.page,
	};
	delete data.publishDate;
	const res = await postPublishQueryPageApi(data);
	res.data.data.forEach((item: any) => {
		item.programType = t(programTypeMap[item.programType]);
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
	stationDialogRef.value.openDialog(type, row, '程式發佈信息', '發佈');
};
const newInputHandleExceed = (uploadFile: any, prop: string, formData: EmptyObjectType) => {};
// 文件改變
const onInputHandleChange = (uploadFile: any, prop: string, formData: EmptyObjectType) => {
	if (prop === 'programFilePath') {
		formData.version = uploadFile.name.split('_')[6];
		if (formData.version && formData.version.substr(0, 1) == 'V') {
			formData.error = 1;
		} else {
			ElMessage.error(`命名錯誤,請重新命名文件再上傳`);
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
		data.productionlinetype = res.data[0].productionlinetype;
		data.stage = res.data[0].stage;
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
		return { stationName: item.split(',')[0], machineType: item.split(',')[1] };
	});
	const getData = {
		projectId,
		productionlinetype,
		stage,
		programType,
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
		ElMessage.success(`發佈成功`);
		stationDialogRef.value.closeDialog();
		getTableData();
	}
};
// 表格删除当前项回调
const onTableDelRow = async (row: EmptyObjectType, type: string) => {
	if (row.signStatus === 0) {
		const res = await deletePublishDeletePublishApi(row.publishId);
		if (res.status) {
			ElMessage.success(`${t('message.allButton.deleteBtn')}${t('message.hint.success')}`);
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
			value: item.stationname + ',' + item.machinetype,
			label: item.machinetype,
			text: `站位：${item.stationname}，機台型號：${item.machinetype}`,
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
