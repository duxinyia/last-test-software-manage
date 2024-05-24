<template>
	<el-tabs class="table-container layout-padding" v-model="activeName" @tab-click="handleClick">
		<el-tab-pane
			class="table-padding layout-padding-view layout-padding-auto"
			v-for="item in tabs"
			:key="item.name"
			:label="t(item.label)"
			:name="item.name"
		>
			<TableSearch
				ref="seachFormRef"
				:search="dialogState.tableData.search"
				@search="(data) => onSearch(data, dialogState.tableData, dialogTableRef)"
				:searchConfig="dialogState.tableData.searchConfig"
				labelWidth=" "
			/>
			<!-- <el-form ref="tableFormRef" :model="dialogState.tableData" size="default"> -->
			<Table
				ref="dialogTableRef"
				v-bind="dialogState.tableData"
				class="table"
				@pageChange="(page) => onTablePageChange(page, dialogState.tableData, 'import')"
				@toggleRowExpansion="toggleRowExpansion"
				@rowClick="toggleRowExpansion"
				:expandedRowKeys="expandedRowKeys"
				@onOpenOtherDialog="openDetailDialog"
				@onOpentopBtnOther="openDialog"
			>
				<template #expand="{ expandProps }">
					<el-table
						ref="singleTableRef"
						style="padding-bottom: 30px; border: 2px solid #a2d2ff"
						:data="expandData"
						v-loading="loading"
						:header-cell-style="headerCellStyle"
						:row-key="getRowKey"
						:empty-text="t('message.hint.nodata')"
						@selection-change="onInnerSelectionChange"
						:cell-style="cellStyle"
						@cell-click="cellClick"
					>
						<el-table-column type="selection" :reserve-selection="true" width="30" />
						<el-table-column
							align="center"
							v-for="(item, index) in setExpandHeader"
							:key="item.key"
							show-overflow-tooltip
							:prop="item.key"
							:width="item.colWidth"
							:label="$t(item.title)"
						>
						</el-table-column>
					</el-table>
				</template>
			</Table>
			<!-- </el-form> -->
			<div class="dialog-footer">
				<span>
					<span class="color-danger mr5">*</span>
					<span>{{ $t('message.pages.effectiveTime') }}：</span>
					<el-date-picker
						style="margin-right: 15px; height: 30px"
						v-model="validTime"
						type="datetime"
						:placeholder="t('message.pages.pleaseSelectAnEffectiveTime')"
						value-format="YYYY-MM-DD HH:mm:ss"
					/>
				</span>
				<el-button :loading="loadingBtn" size="default" type="primary" @click="addData"> {{ $t('message.pages.downloadable') }} </el-button>
			</div>
		</el-tab-pane>
		<!-- 新增编辑弹窗 -->
		<el-dialog
			v-model="stationDialogVisible"
			:title="$t('message.pages.importRecord')"
			width="80%"
			draggable
			:close-on-click-modal="false"
			@close="dialogType = 'import'"
		>
			<TableSearch
				ref="seachDialogFormRef"
				:search="state.tableData.search"
				@search="(data) => onSearch(data, state.tableData, tableRef)"
				:searchConfig="state.tableData.searchConfig"
			/>
			<Table
				ref="tableRef"
				v-bind="state.tableData"
				class="table"
				@pageChange="(page) => onTablePageChange(page, state.tableData, 'page')"
				@sortHeader="onSortHeader"
				:cellStyle="cellStyle"
				@cellclick="versionClick"
				@onOpenOtherDialog="lookImportStatus"
			>
			</Table>
		</el-dialog>
		<Dialog ref="importStatusDialogRef" :isFootBtn="false" dialogWidth="60%">
			<template #dialogTable="{ datas }">
				<el-form ref="tableFormRef" :model="importStatusdialogState.tableData" size="default">
					<Table v-bind="importStatusdialogState.tableData" class="table-dialog"> </Table>
				</el-form>
			</template>
		</Dialog>
		<!-- 詳情彈窗 -->
		<el-dialog draggable :close-on-click-modal="false" v-model="detaildialogVisible" :title="$t('message.pages.programReleaseDetails')" width="45%"
			><programReleaseDetailDialog :isDialog="true" :checkNoRef="checkNoRef"
		/></el-dialog>
	</el-tabs>
</template>

<script setup lang="ts" name="programImport">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import {
	getPublishGetPublishWaitImportMachineListApi,
	postPublishImportProgramApi,
	postPublishQueryImportStatusApi,
	postPublishQueryMachineImportApi,
	postPublishQueryWaitImportApi,
} from '/@/api/programManagement/programImport';
// 引入组件
const Table = defineAsyncComponent(() => import('/@/components/table/index.vue'));
const TableSearch = defineAsyncComponent(() => import('/@/components/search/search.vue'));
// 引入组件
const Dialog = defineAsyncComponent(() => import('/@/components/dialog/dialog.vue'));
const programReleaseDetailDialog = defineAsyncComponent(() => import('/@/views/link/programReleaseLink/index.vue'));
import type { TabsPaneContext } from 'element-plus';
import { getPublishDetailApi } from '/@/api/programManagement/programRelease';
const detaildialogVisible = ref(false);
const checkNoRef = ref();
const activeName = ref('first');
const tabs = ref([
	{ label: 'message.pages.toBeImported', name: 'first' },
	{ label: 'message.pages.historicalVersion', name: 'second' },
]);

// 定义变量内容
const { t } = useI18n();
const stationDialogRef = ref();
const stationDialogVisible = ref(false);
const tableRef = ref<RefType>();
const dialogTableRef = ref<RefType>();
const seachFormRef = ref();
const seachDialogFormRef = ref();
const loadingBtn = ref(false);
const loading = ref(true);
const dialogType = ref('import');
const singleTableRef = ref();
const validTime = ref('');
const importStatusDialogRef = ref();
const expandData = ref([]);
const setExpandHeader = ref([
	{ key: 'machineNo', colWidth: '', title: 'message.pages.machineNumber', type: 'text', isCheck: true, isRequired: false },
	{ key: 'line', colWidth: '', title: 'message.pages.line', type: 'text', isCheck: true, isRequired: false },
	{ key: 'lineCode', colWidth: '', title: 'message.pages.lineCode', type: 'text', isCheck: true, isRequired: false },
	{ key: 'stationName', colWidth: '', title: 'message.pages.stationName', type: 'text', isCheck: true, isRequired: false },
	{ key: 'stationCode', colWidth: '', title: 'message.pages.stationCode', type: 'text', isCheck: true, isRequired: false },
	{ key: 'machineType', colWidth: '', title: 'message.pages.machineType1', type: 'text', isCheck: true, isRequired: false },
]);
const state = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'projectName', colWidth: '', title: 'message.pages.projectName', type: 'text', isCheck: true },
			{ key: 'projectCode', colWidth: '', title: 'message.pages.projectCode', type: 'text', isCheck: true },
			{ key: 'productionLineType', colWidth: '', title: 'message.pages.productionlinetype', type: 'text', isCheck: true },
			{ key: 'stage', colWidth: '', title: 'message.pages.stage', type: 'text', isCheck: true },
			{ key: 'programName', colWidth: '', title: 'message.pages.programName', type: 'text', isCheck: false },
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
			{ key: 'version', colWidth: '', title: 'message.pages.programVersion', type: 'text', isCheck: true },
			{ key: 'fileSize', colWidth: '', title: 'message.pages.packageSize', type: 'text', isCheck: true },

			{ key: 'createtime', colWidth: '', title: 'message.pages.importTime', type: 'text', isCheck: false },
			{ key: 'line', colWidth: '', title: 'message.pages.line', type: 'text', isCheck: true },
			{ key: 'stationName', colWidth: '', title: 'message.pages.stationName', type: 'text', isCheck: true },
			{ key: 'stationCode', colWidth: '', title: 'message.pages.stationCode', type: 'text', isCheck: false },
			{ key: 'machineType', colWidth: '', title: 'message.pages.machineType1', type: 'text', isCheck: false },
			{ key: 'machineno', colWidth: '', title: 'message.pages.machineNumber', type: 'text', isCheck: true },
			{
				key: 'importStatus',
				colWidth: '',
				title: 'message.pages.importingState',
				type: 'text',
				isCheck: true,
				transfer: {
					0: 'message.pages.notDownloaded',
					1: 'message.pages.downloaded',
					2: 'message.pages.imported',
				},
			},
			{ key: 'validTime', colWidth: '', title: 'message.pages.effectiveTime', type: 'text', isCheck: true },
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: true, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: false, // 是否显示表格多选
			isOperate: false, // 是否显示表格操作栏
			isButton: false, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: true, //是否有表格右上角工具
			isPage: true, //是否有分页
			operateWidth: 150,
			isBulkDeletionBtn: false,
			height: 570,
		},
		topBtnConfig: [{ type: 'add', name: 'message.pages.programImport', defaultColor: 'primary', isSure: true, disabled: true }],
		btnConfig: [
			// { type: 'detail', name: '查看導入狀態', isSure: false, icon: 'ele-View', defaultColor: 'success' },
			// { type: 'del', name: 'message.allButton.deleteBtn', isSure: true, defaultColor: 'danger' },
		],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{ label: 'message.pages.projectName', placeholder: '', prop: 'projectName', required: false, type: 'input' },
			{ label: 'message.pages.projectCode', placeholder: '', prop: 'projectCode', required: false, type: 'input' },
			{ label: 'message.pages.stationName', prop: 'stationName', required: false, type: 'input' },
			{ label: 'message.pages.stationCode', placeholder: '', prop: 'stationCode', required: false, type: 'input' },
			{ label: 'message.pages.machineNumber', placeholder: '', prop: 'machineNo', required: false, type: 'input' },
			{ label: 'message.pages.importTime', prop: 'importTime', required: false, type: 'dateRange' },
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
		dialogConfig: [],
	},
});
const dialogState = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'projectName', colWidth: '', title: 'message.pages.projectName', type: 'text', isCheck: true },
			{ key: 'projectCode', colWidth: '', title: 'message.pages.projectCode', type: 'text', isCheck: true },
			{ key: 'productionLineType', colWidth: '', title: 'message.pages.productionlinetype', type: 'text', isCheck: true },
			{ key: 'stage', colWidth: '', title: 'message.pages.stage', type: 'text', isCheck: true },
			{ key: 'programName', colWidth: '', title: 'message.pages.programName', type: 'text', isCheck: true },
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
			{ key: 'version', colWidth: '', title: 'message.pages.programVersion', type: 'text', isCheck: true },
			{ key: 'fileSize', colWidth: '', title: 'message.pages.packageSize', type: 'text', isCheck: true },
			{ key: 'signOvertime', colWidth: '', title: 'message.pages.signatureCompletionTime', type: 'text', isCheck: true },
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: false, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: false, // 是否显示表格多选
			isOperate: true, // 是否显示表格操作栏
			isButton: true, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: true, //是否有分页
			operateWidth: 120,
			isBulkDeletionBtn: false,
			// height: 530,
			expand: true,
		},
		topBtnConfig: [{ type: 'record', name: 'message.pages.importRecord', defaultColor: 'primary', isSure: true, disabled: true }],
		btnConfig: [{ type: 'detail', name: 'message.pages.detail', isSure: false, icon: 'ele-View', defaultColor: 'success' }],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{ label: 'message.pages.projectName', placeholder: '', prop: 'projectName', required: false, type: 'input' },
			{ label: 'message.pages.projectCode', placeholder: '', prop: 'projectCode', required: false, type: 'input' },
			{ label: 'message.pages.versionNumber', placeholder: '', prop: 'version', required: false, type: 'input' },
		],
		searchConfig: {
			isSearchBtn: true,
		},
		// 给后端的数据
		form: {},
		page: {
			pageNum: 1,
			pageSize: 10,
		},
		// 打印标题
		printName: '',
		// 弹窗表单
		dialogConfig: [],
	},
});
const importStatusdialogState = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'line', colWidth: '', title: '線體', type: 'text', isCheck: true },
			{ key: 'stationName', colWidth: '', title: 'message.pages.stationName', type: 'text', isCheck: true },
			{ key: 'stationCode', colWidth: '', title: 'message.pages.stationCode', type: 'text', isCheck: true },
			{ key: 'machineType', colWidth: '', title: '機臺類型', type: 'text', isCheck: true },
			{ key: 'machineno', colWidth: '', title: '機臺號', type: 'text', isCheck: true },
			{ key: 'version', colWidth: '', title: '當前版本', type: 'text', isCheck: true },
			{
				key: 'importStatus',
				colWidth: '',
				title: '導入狀態',
				type: 'text',
				isCheck: true,
				transfer: {
					0: '未下載',
					1: '已下載',
					2: '已導入',
				},
			},
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: false, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: false, // 是否显示表格多选
			isOperate: false, // 是否显示表格操作栏
			isButton: true, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: true, //是否有分页
			operateWidth: 220,
			// height: 500,
		},
		topBtnConfig: [],
		btnConfig: [],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [],
		searchConfig: {
			isSearchBtn: true,
		},
		// 给后端的数据
		form: {},
		page: {
			pageNum: 1,
			pageSize: 10,
		},
	},
});
// 切換标签
const handleClick = (tab: TabsPaneContext, event: Event) => {
	activeName.value = tab.paneName as string;
	dialogState.tableData.form = {};
	if (tab.paneName === 'second') {
		seachFormRef.value[1].onReset();
		dialogTableRef.value[1]?.pageReset();
	} else {
		seachFormRef.value[0].onReset();
		dialogTableRef.value[0]?.pageReset();
	}
};
// 单元格字体颜色
const cellStyle = ({ row, column }: EmptyObjectType) => {
	const property = column.property;
	if (property === 'version') {
		return { color: 'var(--el-color-primary)', cursor: 'pointer', 'text-decoration': 'underline' };
	} else if (row.index + 1 && (property === 'line' || property === 'stationName')) {
		return { color: 'var(--el-color-primary)', cursor: 'pointer' };
	} else if (property === 'importStatus') {
		// 導入狀態
		let colorMap: EmptyObjectType = { 0: 'var(--el-color-danger)', 1: 'var(--el-color-success)', 2: 'var(--el-color-primary)' };
		let fontColor = colorMap[row.importStatus];
		return { color: fontColor };
	}
};
// 点击单元格触发row, column
const cellClick = (row: EmptyObjectType, column: EmptyObjectType) => {
	if (column.property === 'line') {
		expandData.value.forEach((item: any) => {
			if (activeName.value === 'first') {
				singleTableRef.value[2]!.toggleRowSelection(item, item.lineCode === row.lineCode ? true : false);
			} else {
				singleTableRef.value[3]!.toggleRowSelection(item, item.lineCode === row.lineCode ? true : false);
			}
		});
	} else if (column.property === 'stationName') {
		expandData.value.forEach((item: any) => {
			if (activeName.value === 'first') {
				singleTableRef.value[2]!.toggleRowSelection(item, item.stationCode === row.stationCode ? true : false);
			} else {
				singleTableRef.value[3]!.toggleRowSelection(item, item.stationCode === row.stationCode ? true : false);
			}
		});
	}
};
// 點擊版本下載文件
const versionClick = (row: EmptyObjectType, column: EmptyObjectType) => {
	if (column.property === 'version') {
		if (row.filepath && row.filepath.includes('/')) {
			window.open(`${row.filepath}`, '_blank');
		} else {
			ElMessage.warning(t('message.hint.thereAreNoPackagesOrPackageErrors'));
		}
	}
};
const headerCellStyle = ({ column }: any) => {
	let sty: EmptyObjectType = { backgroundColor: 'white', color: '#0047c5' };
	return sty;
};
const remove = (array: any[], val: any) => {
	const index = array.indexOf(val);
	if (index > -1) {
		array.splice(index, 1);
		return true;
	}
	return false;
};
const getRowKey = (row: EmptyObjectType) => {
	return row.index;
};
// 打開詳情彈窗
const openDetailDialog = async (scope: EmptyObjectType, type: string) => {
	if (type === 'detail') {
		const res = await getPublishDetailApi(scope.row.publishId);
		checkNoRef.value = res.data;
		detaildialogVisible.value = true;
	}
};
// 展開行
const expandedRowKeys = ref<string[]>([]);
const toggleRowExpansion = async (row: EmptyObjectType, column: EmptyObjectType, falg?: number) => {
	if (column.property === 'operation') return;
	loading.value = true;
	if (row.publishId && !remove(expandedRowKeys.value, row.publishId)) {
		// 實現手風琴展開
		expandedRowKeys.value = [];
		expandedRowKeys.value.push(row.publishId);
		const res = await getPublishGetPublishWaitImportMachineListApi(row.publishId);
		loading.value = false;
		res.data.forEach((item: any, index: number) => {
			item.index = index;
		});
		expandData.value = res.data;
	}
	// 先判断该行是否已经展开了
	if (!row.expand) {
		row.expand = true;
	} else if (falg === 1) {
		expandedRowKeys.value = [];
	} else {
		row.expand = false;
	}
};
let selectList = ref([] as EmptyObjectType[]);
// 選中裡面表格行
const onInnerSelectionChange = (val: EmptyObjectType[]) => {
	selectList.value = val;
};
// 初始化列表数据
const getTableData = async (datas: EmptyObjectType) => {
	datas.config.loading = true;
	const form = datas.form;
	let res = null;
	if (dialogType.value === 'page') {
		let data: EmptyObjectType = {
			...form,
			startTime: form.importTime && form.importTime[0],
			endTime: form.importTime && form.importTime[1],
			page: state.tableData.page,
		};
		delete data.importTime;
		res = await postPublishQueryMachineImportApi(data);
	} else {
		let data: EmptyObjectType = {
			...form,
			page: dialogState.tableData.page,
		};
		data.importStatus = activeName.value === 'first' ? 0 : 1;
		res = await postPublishQueryWaitImportApi(data);
		res.data.data.forEach((item: any) => {
			// item.downloadStatus = '未下載';
			// item.stationMachines.forEach((mat: any) => {
			// 	mat.publishId = item.publishId;
			// });
		});
	}
	datas.data = res!.data.data;
	datas.config.total = res!.data.total;
	if (res!.status) {
		datas.config.loading = false;
	}
};
// 搜索点击时表单回调
const onSearch = (data: EmptyObjectType, tableData: EmptyObjectType, tablesRef: any) => {
	tableData.form = Object.assign({}, tableData.form, { ...data });
	if (activeName.value === 'first' && dialogType.value === 'import') {
		tablesRef[0]?.pageReset();
	} else if (activeName.value === 'second' && dialogType.value === 'import') {
		tablesRef[1]?.pageReset();
	} else {
		tablesRef?.pageReset();
	}
};

// 打开程式導入弹窗
const openDialog = (type: string, row: EmptyObjectType) => {
	// expandedRowKeys.value = [];
	// validTime.value = '';
	stationDialogVisible.value = true;
	dialogType.value = 'page';
	state.tableData.form = {};
	if (seachDialogFormRef.value) seachDialogFormRef?.value.onReset();
	getTableData(state.tableData);
};
// 打開查看導入狀態彈窗
const lookImportStatus = async (scope: EmptyObjectType, type: string) => {
	let importStatusdialogStateData = importStatusdialogState.tableData;
	importStatusDialogRef.value.openDialog(type, scope.row, '查看導入狀態');
	let data = {
		importId: scope.row.importId,
		page: importStatusdialogStateData.page,
	};
	importStatusdialogStateData.config.loading = true;
	const res = await postPublishQueryImportStatusApi(data);
	importStatusdialogStateData.data = res.data.data;
	if (res.status) {
		importStatusdialogStateData.config.loading = false;
	}
};
// 導入數據
const addData = async () => {
	let data = selectList.value;
	if (!validTime.value) return ElMessage.warning(t('message.hint.pleaseEnterTheEffectiveTime'));
	if (data.length <= 0) return ElMessage.warning(t('message.hint.selectTheProjectYouWantToImport'));
	loadingBtn.value = true;
	const stationList = data.map((item) => {
		return {
			publishId: item.publishId,
			line: item.line,
			machineType: item.machineType,
			stationCode: item.stationCode,
			stationName: item.stationName,
			machineNo: item.machineNo,
			lineCode: item.lineCode,
			importStatus: item.importStatus,
		};
	});
	const res = await postPublishImportProgramApi({ publishId: data[0].publishId, stationList, validTime: validTime.value });
	if (res.status) {
		ElMessage.success(t(`message.hint.importSuccessfully`));
		dialogType.value = 'import';
		// stationDialogVisible.value = false;
		// stationDialogRef.value.closeDialog();
		singleTableRef.value[2]!.clearSelection();
		singleTableRef.value[3]!.clearSelection();
		getTableData(dialogState.tableData);
		expandedRowKeys.value = [];
		validTime.value = '';
	}
	loadingBtn.value = false;
};
// 分页改变时回调
const onTablePageChange = (page: TableDemoPageType, tableData: EmptyObjectType, type: string) => {
	tableData.page.pageNum = page.pageNum;
	tableData.page.pageSize = page.pageSize;
	dialogType.value = type;
	getTableData(tableData);
};
// 拖动显示列排序回调
const onSortHeader = (data: TableHeaderType[]) => {
	state.tableData.header = data;
};

// 页面加载时
onMounted(() => {
	getTableData(dialogState.tableData);
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
:deep(.el-tabs__item) {
	font-weight: 700;
	font-size: 14px;
}
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	margin-top: 20px;
}
:deep(.el-tabs__content) {
	height: 100%;
}
</style>
