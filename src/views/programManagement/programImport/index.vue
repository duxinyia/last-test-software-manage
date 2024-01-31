<template>
	<div class="table-container layout-padding">
		<div class="table-padding layout-padding-view layout-padding-auto">
			<TableSearch
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
				@openAdd="openDialog"
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
			<Dialog ref="stationDialogRef" @addData="addData" :loadingBtn="loadingBtn" dialogWidth="70%" :isFootBtn="isFootBtn">
				<template #dialogSearch="{ datas }">
					<el-form :model="dialogState.tableData" size="default">
						<TableSearch
							ref="seachFormRef"
							:search="dialogState.tableData.search"
							@search="(data) => onSearch(data, dialogState.tableData, dialogTableRef)"
							:searchConfig="dialogState.tableData.searchConfig"
						/>
					</el-form>
				</template>
				<template #dialogTable="{ datas }">
					<el-form ref="tableFormRef" :model="dialogState.tableData" size="default">
						<Table
							ref="dialogTableRef"
							v-bind="dialogState.tableData"
							class="table-dialog"
							@pageChange="(page) => onTablePageChange(page, dialogState.tableData, datas.dialog.type)"
							@toggleRowExpansion="toggleRowExpansion"
							@rowClick="toggleRowExpansion"
							:expandedRowKeys="expandedRowKeys"
						>
							<template #expand="{ expandProps }">
								<el-table
									ref="singleTableRef"
									style="padding-bottom: 30px; border: 2px solid #a2d2ff"
									:data="expandProps.row.child"
									v-loading="loading"
									:header-cell-style="headerCellStyle"
									empty-text="暫無收貨記錄"
									@selection-change="onInnerSelectionChange"
								>
									<el-table-column type="selection" :reserve-selection="true" width="30" />
									<el-table-column
										align="center"
										v-for="(item, index) in setExpandHeader"
										:key="index"
										show-overflow-tooltip
										:prop="item.key"
										:width="item.colWidth"
										:label="$t(item.title)"
									>
									</el-table-column>
								</el-table>
							</template>
						</Table>
					</el-form>
				</template>
				<template #dialogOtherFooter="{ datas }">
					<span class="color-danger mr5">*</span>
					<span>生效時間：</span>
					<el-date-picker
						style="margin-right: 15px; height: 30px"
						v-model="validTime"
						type="datetime"
						placeholder="請選擇生效時間"
						value-format="YYYY-MM-DD HH:mm:ss"
					/>
				</template>
			</Dialog>
		</div>
	</div>
</template>

<script setup lang="ts" name="programImport">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { postPublishImportProgramApi, postPublishQueryPageImportApi, postPublishQueryWaitImportApi } from '/@/api/programManagement/programImport';
// 引入组件
const Table = defineAsyncComponent(() => import('/@/components/table/index.vue'));
const TableSearch = defineAsyncComponent(() => import('/@/components/search/search.vue'));
// 引入组件
const Dialog = defineAsyncComponent(() => import('/@/components/dialog/dialog.vue'));
// 定义变量内容
const { t } = useI18n();
const stationDialogRef = ref();
const tableRef = ref<RefType>();
const dialogTableRef = ref<RefType>();
const seachFormRef = ref();
const loadingBtn = ref(false);
const loading = ref(false);
const isFootBtn = ref(true);
const dialogType = ref('page');
const validTime = ref('');
const setExpandHeader = ref([
	{ key: 'stationName', colWidth: '', title: 'message.pages.stationName', type: 'text', isCheck: true, isRequired: false },
	{ key: 'stationCode', colWidth: '', title: '機臺編號', type: 'text', isCheck: true, isRequired: false },
	{ key: 'machineType', colWidth: '', title: '機臺類型', type: 'text', isCheck: true, isRequired: false },
]);
const state = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'projectName', colWidth: '', title: 'message.pages.projectName', type: 'slot', isCheck: true },
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
			{ key: 'validTime', colWidth: '', title: '生效時間', type: 'text', isCheck: true },
			{ key: 'createtime', colWidth: '', title: '導入時間', type: 'text', isCheck: true },
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: true, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: false, // 是否显示表格多选
			isOperate: false, // 是否显示表格操作栏
			isButton: true, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: true, //是否有分页
			operateWidth: 220,
			isBulkDeletionBtn: false,
		},
		topBtnConfig: [{ type: 'add', name: 'message.pages.programImport', defaultColor: 'primary', isSure: true, disabled: true }],
		btnConfig: [
			// { type: 'edit', name: 'message.allButton.editBtn', isSure: false, icon: 'ele-Edit', defaultColor: 'warning' },
			// { type: 'del', name: 'message.allButton.deleteBtn', isSure: true, defaultColor: 'danger' },
		],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{ label: 'message.pages.projectName', placeholder: '', prop: 'projectName', required: false, type: 'input' },
			{ label: 'message.pages.projectCode', placeholder: '', prop: 'projectCode', required: false, type: 'input' },
			{ label: 'message.pages.stationName', prop: 'stationName', required: false, type: 'input' },
			{ label: '機臺編號', placeholder: '', prop: 'stationCode', required: false, type: 'input' },
			{ label: '導入時間', prop: 'importTime', required: false, type: 'dateRange' },
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
			{ key: 'lwsFileName', colWidth: '', title: 'LWS文件名', type: 'text', isCheck: true },
			{ key: 'signOvertime', colWidth: '', title: '簽核完成時間', type: 'text', isCheck: true },
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
			isBulkDeletionBtn: false,
			height: 500,
			expand: true,
		},
		topBtnConfig: [],
		btnConfig: [],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{ label: 'message.pages.projectName', placeholder: '', prop: 'projectName', required: false, type: 'input' },
			{ label: 'message.pages.projectCode', placeholder: '', prop: 'projectCode', required: false, type: 'input' },
			{ label: 'message.pages.programName', prop: 'programName', required: false, type: 'input' },
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
// 展開行
const expandedRowKeys = ref<string[]>([]);
const toggleRowExpansion = async (row: EmptyObjectType, falg?: number) => {
	if (row.publishId && !remove(expandedRowKeys.value, row.publishId)) {
		// 實現手風琴展開
		expandedRowKeys.value = [];
		expandedRowKeys.value.push(row.publishId);
	}
	// 先判断该行是否已经展开了
	if (!row.expand) {
		dialogState.tableData.data.forEach((item: any, index: any) => {
			// 找到当前点击的行，把动态获取到的数据赋值进去
			if (item.publishId === row.publishId) {
				dialogState.tableData.data[index].child = item.stationMachines;
				row.expand = true;
			}
		});
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
		res = await postPublishQueryPageImportApi(data);
	} else {
		let data: EmptyObjectType = {
			...form,
			page: dialogState.tableData.page,
		};
		res = await postPublishQueryWaitImportApi(data);
		res.data.data.forEach((item: any) => {
			item.stationMachines.forEach((mat: any) => {
				mat.publishId = item.publishId;
			});
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
	tablesRef?.pageReset();
};

// 打开新增編輯弹窗
const openDialog = (type: string, row: EmptyObjectType) => {
	expandedRowKeys.value = [];
	validTime.value = '';
	stationDialogRef.value.openDialog('import', row, 'message.pages.programImport', '導入');
	dialogType.value = 'import';
	dialogState.tableData.form = {};
	if (seachFormRef.value) seachFormRef?.value.onReset();
	getTableData(dialogState.tableData);
};

// 導入數據
const addData = async (ruleForm: EmptyObjectType, type: string) => {
	let data = selectList.value;
	if (!validTime.value) return ElMessage.warning(t('請填寫生效時間'));
	if (data.length <= 0) return ElMessage.warning(t('請選擇要導入的專案'));
	loadingBtn.value = true;
	const stationList = data.map((item) => {
		return { machineType: item.machineType, stationCode: item.stationCode, stationName: item.stationName };
	});
	const res = await postPublishImportProgramApi({ publishId: data[0].publishId, stationList, validTime: validTime.value });
	if (res.status) {
		ElMessage.success(t(`導入成功`));
		dialogType.value = 'page';
		stationDialogRef.value.closeDialog();
		getTableData(state.tableData);
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
	getTableData(state.tableData);
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
</style>
