<template>
	<div class="table-container layout-padding">
		<div class="table-padding layout-padding-view layout-padding-auto">
			<TableSearch :search="state.tableData.search" @search="onSearch" :searchConfig="state.tableData.searchConfig" />
			<Table
				ref="tableRef"
				v-bind="state.tableData"
				class="table"
				@delRow="onTableDelRow"
				@pageChange="onTablePageChange"
				@sortHeader="onSortHeader"
				@openAdd="openDialog"
				:cellStyle="cellStyle"
				@cellclick="projectnameClick"
			/>
			<!-- 新增编辑弹窗 -->
			<Dialog
				ref="projectDialogRef"
				:dialogConfig="state.tableData.dialogConfig"
				@addData="addData"
				:loadingBtn="loadingBtn"
				dialogWidth="50%"
				:isFootBtn="isFootBtn"
				@selectChange="onSelectChange"
				@dailogFormButton="dailogSelectLineButton"
			>
				<template #dialogTable="{ datas }">
					<el-form ref="tableFormRef" :model="dialogState.tableData" size="default">
						<Table
							ref="dialogTableRef"
							v-bind="dialogState.tableData"
							class="table-dialog"
							@pageChange="onDialogTablePageChange"
							@onOpenOtherDialog="onDelRow"
							@openAdd="openPositionDialog"
						>
						</Table>
					</el-form>
				</template>
			</Dialog>
			<!-- 選擇線體彈窗 -->
			<Dialog ref="selectLineDialogRef" dialogWidth="50%" :isFootBtn="true" @addData="lineSubmit">
				<template #dialogTable="{ datas }">
					<el-form ref="tableFormRef" :model="selectLinedialogState.tableData" size="default">
						<Table
							ref="dialogTableRef"
							v-bind="selectLinedialogState.tableData"
							class="table-dialog"
							@selectionChange="onSelectionChange"
							@pageChange="onLinePageChange"
						>
						</Table>
					</el-form>
				</template>
			</Dialog>
			<!-- 新增站位彈窗 -->
			<!-- <Dialog
				ref="projectPositionDialogRef"
				:dialogConfig="dialogState.tableData.dialogConfig"
				dialogWidth="20%"
				@remoteMethod="remoteMethod"
				@addData="addPositionData"
				:loadingBtn="loadingBtn"
			>
			</Dialog> -->
			<!-- 操作機台彈窗 -->
			<!-- <Dialog ref="machineDialogRef" dialogWidth="50%" :isFootBtn="false">
				<template #dialogTable="{ datas }">
					<el-form ref="tableFormRef" :model="dialogMachineState.tableData" size="default">
						<Table
							ref="dialogTableRef"
							v-bind="dialogMachineState.tableData"
							class="table-dialog"
							@delRow="onMachineDelRow"
							@openAdd="openAddMachineDialog"
						>
						</Table>
					</el-form>
				</template>
			</Dialog> -->
			<!-- 新增機台彈窗 -->
			<!-- <Dialog ref="machineOptionDialogRef" :dialogConfig="dialogMachineConfig" dialogWidth="25%" :loadingBtn="loadingBtn" @addData="addMachineData">
			</Dialog> -->
		</div>
	</div>
</template>

<script setup lang="ts" name="warehouse">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import {
	postProjectAddProjectApi,
	postProjectQueryPageApi,
	putProjectUpdateProjectApi,
	deleteProjectDeleteProjectApi,
	postProjectQueryPageProjectStationApi,
	putProjectUpdateProjectStationApi,
	postProjectAddProjectStationApi,
	deleteProjectDeleteProjectStationApi,
	getStageQueryNoPageApi,
	getMachineQueryNoPageApi,
	getStationQueryNoPageApi,
	postProjectAddStationMachineApi,
	getStationMachineListApi,
	postProjectUpdateStationMachineApi,
	deleteProjectDeleteStationMachineApi,
	postLineGetLineDetailListApi,
	getProjectLineMachineListApi,
	deleteProjectDeleteProjectLineApi,
	postProjectAddProjectLineApi,
} from '/@/api/projectConfiguration/projectManage';
import { truncate } from 'fs';
import { postLineQueryPageApi } from '/@/api/basicInformation/lines';
// 引入组件
const Table = defineAsyncComponent(() => import('/@/components/table/index.vue'));
const TableSearch = defineAsyncComponent(() => import('/@/components/search/search.vue'));
// 引入组件
const Dialog = defineAsyncComponent(() => import('/@/components/dialog/dialog.vue'));
// 定义变量内容
const { t } = useI18n();
const projectDialogRef = ref();
const tableRef = ref<RefType>();
const dialogTableRef = ref<RefType>();
const machineDialogRef = ref<RefType>();
const machineOptionDialogRef = ref<RefType>();
const projectPositionDialogRef = ref<RefType>();
const tableFormRef = ref();
const loadingBtn = ref(false);
const isFootBtn = ref(true);
const selectLineDialogRef = ref();

const state = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'projectname', colWidth: '', title: 'message.pages.projectName', type: 'text', isCheck: true },
			{ key: 'projectcode', colWidth: '', title: 'message.pages.projectCode', type: 'text', isCheck: true },
			{ key: 'programname', colWidth: '', title: 'message.pages.programName', type: 'text', isCheck: true },
			{ key: 'productionlinetype', colWidth: '', title: 'message.pages.productionlinetype', type: 'text', isCheck: true },
			// { key: 'stage', colWidth: '', title: '階段', type: 'text', isCheck: true },
			{ key: 'describe', colWidth: '280', title: 'message.pages.projectDescribe', type: 'text', isCheck: true },
			// { key: 'machinetypeqty', colWidth: '', title: 'message.pages.machineTypeQty', type: 'text', isCheck: true },
			// { key: 'stationqty', colWidth: '', title: 'message.pages.stationQty', type: 'text', isCheck: true },
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
			operateWidth: 220,
			isBulkDeletionBtn: false,
		},
		topBtnConfig: [{ type: 'add', name: 'message.pages.addProject', defaultColor: 'primary', isSure: true, disabled: true }],
		btnConfig: [
			{ type: 'edit', name: 'message.allButton.editBtn', isSure: false, icon: 'ele-Edit', defaultColor: 'warning' },
			{ type: 'del', name: 'message.allButton.deleteBtn', isSure: true, defaultColor: 'danger' },
		],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{
				label: 'message.pages.projectName',
				prop: 'projectName',
				required: false,
				type: 'input',
			},
			{ label: 'message.pages.projectCode', placeholder: '', prop: 'projectCode', required: false, type: 'input' },
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
				prop: 'projectname',
				placeholder: '',
				required: true,
				type: 'input',
				standbyType: 'input',
				isCheck: true,
			},
			{
				label: 'message.pages.productionlinetype',
				prop: 'productionlinetype',
				placeholder: '',
				required: true,
				type: 'select',
				standbyType: 'select',
				isCheck: true,
				options: [
					{ value: 'NPI', label: 'NPI', text: 'NPI' },
					{ value: 'MP', label: 'MP', text: 'MP' },
				],
			},
			{
				label: 'message.pages.projectCode',
				prop: 'projectcode',
				placeholder: '',
				required: true,
				type: 'input',
				standbyType: 'input',
				isCheck: true,
			},
			{
				label: 'message.pages.programName',
				prop: 'programname',
				placeholder: '',
				required: true,
				type: 'input',
				standbyType: 'input',
				isCheck: true,
			},
			// {
			// 	label: '階段',
			// 	prop: 'stage',
			// 	placeholder: '请選擇階段',
			// 	required: false,
			// 	type: 'select',
			// 	standbyType: 'select',
			// 	isCheck: true,
			// 	options: [],
			// },
			{
				label: 'message.pages.projectDescribe',
				prop: 'describe',
				placeholder: '',
				required: true,
				type: 'textarea',
				standbyType: 'textarea',
				minRows: 5,
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
				isCheck: true,
			},
			{
				label: '選擇線體',
				prop: 'lineBtn',
				placeholder: '',
				required: true,
				type: 'button',
				defaultColor: 'success',
				standbyType: 'button',
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
				isCheck: true,
			},
		],
	},
});
// 彈窗表格
const dialogState = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'linecode', colWidth: '', title: '線體代碼', type: 'text', isCheck: true, isRequired: false },
			{ key: 'line', colWidth: '', title: '線體名稱', type: 'text', isCheck: true, isRequired: false },
			{ key: 'stationcode', colWidth: '', title: '站位代碼', type: 'text', isCheck: true, isRequired: false },
			{ key: 'stationname', colWidth: '', title: 'message.pages.stationName', type: 'text', isCheck: true, isRequired: false },
			{ key: 'machineno', colWidth: '', title: '機臺號', type: 'text', isCheck: true, isRequired: false },
			{ key: 'machinetype', colWidth: '', title: '機臺類型', type: 'text', isCheck: true, isRequired: false },
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: false, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: false, // 是否显示表格多选
			isOperate: true, // 是否显示表格操作栏
			isButton: false, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: true, //是否有分页
			height: 350,
			operateWidth: 100,
		},
		topBtnConfig: [],
		// 给后端的数据
		form: {},
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [],
		dialogConfig: [
			{
				label: '線體',
				prop: 'line',
				placeholder: '',
				required: true,
				type: 'input',
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
				isCheck: true,
			},
			{
				label: 'message.pages.stationName',
				prop: 'stationname',
				placeholder: '',
				required: true,
				type: 'input',
				// options: [],
				// loading: true,
				// filterable: true,
				// remote: true,
				// remoteShowSuffix: true,
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
				isCheck: true,
			},
			{
				label: '站位代碼',
				prop: 'stationcode',
				placeholder: '',
				required: true,
				type: 'input',
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
				isCheck: true,
			},
			// {
			// 	label: 'message.pages.machineType',
			// 	prop: 'machinetype',
			// 	placeholder: '',
			// 	required: false,
			// 	type: 'input',
			// 	// options: [],
			// 	// loading: true,
			// 	// filterable: true,
			// 	// remote: true,
			// 	// remoteShowSuffix: true,
			// 	xs: 24,
			// 	sm: 24,
			// 	md: 24,
			// 	lg: 24,
			// 	xl: 24,
			// 	isCheck: true,
			// },
		],
		btnConfig: [
			// { type: 'add', name: '操作機台', isSure: false, defaultColor: 'primary' },
			// { type: 'edit', name: 'message.allButton.editBtn', isSure: false, icon: 'ele-Edit', defaultColor: 'warning' },
			{ type: 'dels', name: 'message.allButton.deleteBtn', color: '#D33939', isSure: false },
		],
		// 搜索参数（不用传，用于分页、搜索时传给后台的值，`getTableData` 中使用）
		page: { pageNum: 1, pageSize: 10 },
	},
});
const selectLinedialogState = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'line', colWidth: '', title: '線體名稱', type: 'text', isCheck: true, isRequired: false },
			{ key: 'linecode', colWidth: '', title: '線體代碼', type: 'text', isCheck: true, isRequired: false },
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: false, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: true, // 是否显示表格多选
			isOperate: false, // 是否显示表格操作栏
			isButton: true, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: true, //是否有分页
			height: 300,
			operateWidth: 310,
		},
		topBtnConfig: [],
		// 给后端的数据
		form: {},
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [],
		dialogConfig: [],
		btnConfig: [],
		// 搜索参数（不用传，用于分页、搜索时传给后台的值，`getTableData` 中使用）
		page: { pageNum: 1, pageSize: 10 },
	},
});
// const dialogMachineConfig = ref([
// 	{
// 		label: '機臺號',
// 		prop: 'machineno',
// 		placeholder: '',
// 		required: true,
// 		type: 'input',
// 		xs: 24,
// 		sm: 24,
// 		md: 24,
// 		lg: 24,
// 		xl: 24,
// 		isCheck: true,
// 	},
// 	{
// 		label: '機臺型號',
// 		prop: 'machinetype',
// 		placeholder: '',
// 		required: true,
// 		type: 'input',
// 		xs: 24,
// 		sm: 24,
// 		md: 24,
// 		lg: 24,
// 		xl: 24,
// 		isCheck: true,
// 	},
// ]);
// 彈窗表格
// const dialogMachineState = reactive<TableDemoState>({
// 	tableData: {
// 		// 列表数据（必传）
// 		data: [],
// 		// 表头内容（必传，注意格式）
// 		header: [
// 			{ key: 'machineno', colWidth: '', title: '機臺號', type: 'text', isCheck: true, isRequired: false },
// 			{ key: 'machinetype', colWidth: '', title: '機臺型號', type: 'text', isCheck: true, isRequired: false },
// 		],
// 		// 配置项（必传）
// 		config: {
// 			total: 0, // 列表总数
// 			loading: false, // loading 加载
// 			isBorder: false, // 是否显示表格边框
// 			isSerialNo: true, // 是否显示表格序号
// 			isSelection: false, // 是否显示表格多选
// 			isOperate: true, // 是否显示表格操作栏
// 			isButton: true, //是否显示表格上面的新增删除按钮
// 			isInlineEditing: false, //是否是行内编辑
// 			isTopTool: false, //是否有表格右上角工具
// 			isPage: false, //是否有分页
// 			height: 300,
// 			operateWidth: 200,
// 		},
// 		topBtnConfig: [{ type: 'add', name: 'message.allButton.addBtn', defaultColor: 'primary', isSure: true, disabled: true }],
// 		// 给后端的数据
// 		form: {},
// 		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
// 		search: [],
// 		dialogConfig: [
// 			{
// 				label: '站位代碼',
// 				prop: 'stationcode',
// 				placeholder: '',
// 				required: true,
// 				type: 'input',
// 				xs: 24,
// 				sm: 24,
// 				md: 24,
// 				lg: 24,
// 				xl: 24,
// 				isCheck: true,
// 			},
// 			{
// 				label: 'message.pages.stationName',
// 				prop: 'stationname',
// 				placeholder: '',
// 				required: true,
// 				type: 'input',
// 				xs: 24,
// 				sm: 24,
// 				md: 24,
// 				lg: 24,
// 				xl: 24,
// 				isCheck: true,
// 			},
// 			{
// 				label: '機臺號',
// 				prop: 'machineno',
// 				placeholder: '',
// 				required: true,
// 				type: 'input',
// 				xs: 24,
// 				sm: 24,
// 				md: 24,
// 				lg: 24,
// 				xl: 24,
// 				isCheck: true,
// 			},
// 		],
// 		btnConfig: [
// 			{ type: 'edit', name: 'message.allButton.editBtn', isSure: false, icon: 'ele-Edit', defaultColor: 'warning' },
// 			{ type: 'del', name: 'message.allButton.deleteBtn', color: '#D33939', isSure: true },
// 		],
// 		// 搜索参数（不用传，用于分页、搜索时传给后台的值，`getTableData` 中使用）
// 		page: { pageNum: 1, pageSize: 10 },
// 	},
// });
// 點擊選擇線體按鈕
const dailogSelectLineButton = async () => {
	selectLineDialogRef.value.openDialog('line', {}, '選擇線體', '確 定');
	selectLinedialogState.tableData.config.loading = true;
	let data = {
		page: selectLinedialogState.tableData.page,
	};
	const res = await postLineQueryPageApi(data);
	selectLinedialogState.tableData.data = res.data.data;
	selectLinedialogState.tableData.config.total = res.data.total;
	if (res.status) {
		selectLinedialogState.tableData.config.loading = false;
	}
};
const selectList = ref([] as EmptyObjectType[]);
// 選中行
const onSelectionChange = (selectlist: EmptyArrayType) => {
	selectList.value = selectlist;
};
let noPageTbaleData: EmptyArrayType = [];
// 選擇好線體提交
const lineSubmit = async () => {
	if (selectList.value.length <= 0) {
		ElMessage.warning(t(`請選擇線體`));
		return;
	}
	let linecodes: EmptyArrayType = [];
	selectList.value.forEach((item) => {
		linecodes.push(item.linecode);
	});
	dialogState.tableData.config.loading = true;
	if (dialogType === 'add') {
		const res = await postLineGetLineDetailListApi(linecodes);
		if (res.status) {
			selectLineDialogRef.value.closeDialog();
			dialogState.tableData.config.total = res.data.length;
			noPageTbaleData = res.data;
			dialogState.tableData.data = res.data.slice(
				(dialogState.tableData.page.pageNum - 1) * dialogState.tableData.page.pageSize,
				dialogState.tableData.page.pageNum * dialogState.tableData.page.pageSize
			);
			dialogState.tableData.config.loading = false;
			ElMessage.success(`操作成功`);
		}
	} else {
		const addres = await postProjectAddProjectLineApi({ projectId, lineCodeList: linecodes });
		if (addres.status) {
			getPositionTableData(projectId);
			// const res = await postLineGetLineDetailListApi(linecodes);
			// if (res.status) {
			selectLineDialogRef.value.closeDialog();
			// 	dialogState.tableData.config.total = res.data.length;
			// 	noPageTbaleData = res.data;
			// 	dialogState.tableData.data = res.data.slice(
			// 		(dialogState.tableData.page.pageNum - 1) * dialogState.tableData.page.pageSize,
			// 		dialogState.tableData.page.pageNum * dialogState.tableData.page.pageSize
			// 	);

			ElMessage.success(`操作成功`);
			// }
		}
		dialogState.tableData.config.loading = false;
	}
};

// 单元格字体颜色
const cellStyle = ({ column }: EmptyObjectType) => {
	const property = column.property;
	if (property === 'projectname') {
		return { color: 'var(--el-color-primary)', cursor: 'pointer', 'text-decoration': 'underline' };
	}
};
let detailRow: EmptyObjectType = {};
// 點擊專案名稱彈出詳情頁面
const projectnameClick = (row: EmptyObjectType, column: EmptyObjectType) => {
	detailRow = row;
	projectId = row.runid;
	dialogState.tableData.page.pageNum = 1;
	dialogState.tableData.page.pageSize = 10;
	dialogType = 'detail';
	if (column.property === 'projectname') {
		changeType('detail', false, [], 0);
		projectDialogRef.value.openDialog('detail', row, 'message.pages.detail');
		getPositionTableData(row.runid);
	}
};
// 點擊不同的按鈕狀態不一樣
const changeType = (type: string, isShow: boolean, operateBtn: EmptyArrayType, operateWidth: Number) => {
	state.tableData.dialogConfig!.forEach((item: any) => {
		if (item.type === 'button' && type != 'detail') {
			item.isCheck = isShow;
		}
		item.type = type === 'detail' ? 'text' : item.standbyType;
		item.required = isShow;
	});
	dialogState.tableData.btnConfig = operateBtn;
	dialogState.tableData.config.operateWidth = operateWidth;
	dialogState.tableData.config.isOperate = isFootBtn.value = dialogState.tableData.config.isButton = isShow;
};

//彈窗删除
const onDelRow = async (row: EmptyObjectType, i: number) => {
	ElMessageBox.confirm(`確定刪除線體：<span style="color:red">${row.row.line}</span>?`, '提示', {
		confirmButtonText: '確 定',
		cancelButtonText: '取 消',
		dangerouslyUseHTMLString: true, // 注意此属性
		type: 'warning',
		draggable: true,
	})
		.then(async () => {
			if (dialogType === 'add') {
				let datas: EmptyArrayType = [];
				noPageTbaleData.forEach((item, index) => {
					if (item.linecode != row.row.linecode) {
						datas.push(item);
					}
				});
				dialogState.tableData.config.total = datas.length;
				noPageTbaleData = datas;
				dialogState.tableData.data = datas;
				ElMessage.success(`${t('message.allButton.deleteBtn')}${t('message.hint.success')}`);
			} else {
				const res = await deleteProjectDeleteProjectLineApi(projectId, row.row.linecode);
				if (res.status) {
					getPositionTableData(projectId);
					ElMessage.success(`${t('message.allButton.deleteBtn')}${t('message.hint.success')}`);
				}
			}
		})
		.catch(() => {});
};

// 初始化列表数据
const getTableData = async () => {
	state.tableData.config.loading = true;
	const form = state.tableData.form;
	let data = {
		...form,
		page: state.tableData.page,
	};
	const res = await postProjectQueryPageApi(data);
	state.tableData.data = res.data.data;
	state.tableData.config.total = res.data.total;
	if (res.status) {
		state.tableData.config.loading = false;
	}
};
// 得到線體-站位-機台列表
const getPositionTableData = async (projectId: string) => {
	dialogState.tableData.config.loading = true;
	const res = await getProjectLineMachineListApi(projectId);
	noPageTbaleData = res.data;
	dialogState.tableData.config.total = res.data.length;
	dialogState.tableData.data = res.data.slice(
		(dialogState.tableData.page.pageNum - 1) * dialogState.tableData.page.pageSize,
		dialogState.tableData.page.pageNum * dialogState.tableData.page.pageSize
	);
	if (res.status) {
		dialogState.tableData.config.loading = false;
	}
};
// 搜索点击时表单回调
const onSearch = (data: EmptyObjectType) => {
	state.tableData.form = Object.assign({}, state.tableData.form, { ...data });
	tableRef.value?.pageReset();
};

let projectId = '';
let dialogType = '';
// 打开新增編輯弹窗
let positionRow: EmptyObjectType = {};
const openDialog = (type: string, row: EmptyObjectType) => {
	dialogState.tableData.page.pageNum = 1;
	dialogState.tableData.page.pageSize = 10;
	positionRow = row;
	changeType(type, true, [{ type: 'dels', name: 'message.allButton.deleteBtn', color: '#D33939', isSure: false }], 90);
	projectDialogRef.value.openDialog(type, row, 'message.pages.project');
	dialogType = type;
	if (type != 'add') {
		projectId = row.runid;

		getPositionTableData(row.runid);
		// onSelectChange('', 'productionlinetype', row, 1);
	} else {
		dialogState.tableData.data = [];
	}
};
// 新增数据  修改数据
const addData = async (ruleForm: EmptyObjectType, type: string) => {
	loadingBtn.value = true;
	const editData = {
		runId: ruleForm.runid,
		projectName: ruleForm.projectname,
		describe: ruleForm.describe,
		productionLineType: ruleForm.productionlinetype,
		projectCode: ruleForm.projectcode,
		programName: ruleForm.programname,
	};

	let lineCodeList: EmptyArrayType = [];
	noPageTbaleData.forEach((item) => {
		lineCodeList.push(item.linecode);
	});
	lineCodeList = Array.from(new Set(lineCodeList));
	// console.log({ projectName, projectCode, programName, describe, productionLineType, lineCodeList: noPageTbaleData });
	const { runId, projectName, projectCode, programName, describe, productionLineType } = editData;
	const res =
		type === 'add'
			? await postProjectAddProjectApi({ projectName, projectCode, programName, describe, productionLineType, lineCodeList })
			: await putProjectUpdateProjectApi(editData);
	loadingBtn.value = false;
	if (res.status) {
		type === 'add' ? ElMessage.success(t(`message.hint.addSuccess`)) : ElMessage.success(t(`message.hint.modifiedSuccess`));
		projectDialogRef.value.closeDialog();
		getTableData();
	}
};
// 表格删除当前项回调
const onTableDelRow = async (row: EmptyObjectType, type: string) => {
	const res = await deleteProjectDeleteProjectApi(row.runid);
	if (res.status) {
		ElMessage.success(`${t('message.allButton.deleteBtn')} ${t('message.hint.success')}`);
		getTableData();
	}
};
const onLinePageChange = (page: TableDemoPageType) => {
	selectLinedialogState.tableData.page.pageNum = page.pageNum;
	selectLinedialogState.tableData.page.pageSize = page.pageSize;
	dailogSelectLineButton();
};
// 分页改变时回调
const onTablePageChange = (page: TableDemoPageType) => {
	state.tableData.page.pageNum = page.pageNum;
	state.tableData.page.pageSize = page.pageSize;
	getTableData();
};

const onDialogTablePageChange = (page: TableDemoPageType) => {
	dialogState.tableData.page.pageNum = page.pageNum;
	dialogState.tableData.page.pageSize = page.pageSize;
	if (dialogType === 'add') {
		dialogState.tableData.data = noPageTbaleData.slice(
			(dialogState.tableData.page.pageNum - 1) * dialogState.tableData.page.pageSize,
			dialogState.tableData.page.pageNum * dialogState.tableData.page.pageSize
		);
		// lineSubmit();
	} else {
		getPositionTableData(projectId);
	}
};
// 拖动显示列排序回调
const onSortHeader = (data: TableHeaderType[]) => {
	state.tableData.header = data;
};

// 页面加载时
onMounted(() => {
	getTableData();
});
// 打開新增站位彈窗
const openPositionDialog = (type: string, row: EmptyObjectType) => {
	// projectPositionDialogRef.value.openDialog(type, row, 'message.pages.projectStation');
};
// 打開新增機台彈窗
const openAddMachineDialog = (type: string, row: EmptyObjectType) => {
	// machineOptionDialogRef.value.openDialog(type, row, '機台');
};
let rows: EmptyObjectType = {};
// 獲取機台數據
const getMachineData = async (row: EmptyObjectType, projectcode: string) => {
	// const res = await getStationMachineListApi(row.stationcode, row.line, projectcode);
	// dialogMachineState.tableData.data = res.data;
};
// 點擊不同的按鈕狀態不一樣
const changeMachine = (isShow: boolean) => {
	// isFootBtn.value = dialogMachineState.tableData.config.isOperate = dialogMachineState.tableData.config.isButton = isShow;
};
// 打開操作機台彈窗
const onOpenMachineDialog = async (scope: EmptyObjectType, type: string) => {
	// rows = scope.row;
	// changeMachine(type === 'add' ? true : false);
	// getMachineData(scope.row, type === 'add' ? positionRow.projectcode : detailRow.projectcode);
	// machineDialogRef.value.openDialog('addChine', scope.row, type === 'add' ? '操作機台' : '機台');
};
// 下拉框改變
let options: EmptyArrayType = [];
const onSelectChange = async (val: string, prop: string, data: EmptyObjectType, flag?: number) => {
	// if (prop === 'productionlinetype') {
	// 	const res = await getStageQueryNoPageApi(data.productionlinetype);
	// 	if (flag != 1) data.stage = '';
	// 	options = res.data.map((item: any) => {
	// 		return { value: item.stage, lable: item.stage, text: item.stage, selected: false };
	// 	});
	// 	state.tableData.dialogConfig?.forEach((item) => {
	// 		if (item.prop === 'stage') {
	// 			item.options = options;
	// 		}
	// 	});
	// }
};
// 搜索下拉
const remoteMethod = (query: string, data: EmptyObjectType, prop: EmptyObjectType) => {
	// let dialogConfig = dialogState.tableData.dialogConfig;
	// dialogConfig?.forEach((item) => {
	// 	if (prop.prop === item.prop) item.loading = true;
	// });
	// if (prop.prop === 'machinetype') {
	// 	if (query) {
	// 		setTimeout(async () => {
	// 			dialogConfig?.forEach(async (item) => {
	// 				if (item.prop === 'machinetype') {
	// 					const res = await getMachineQueryNoPageApi(query);
	// 					item.loading = false;
	// 					item.options = res.data.map((item: EmptyObjectType) => {
	// 						return { ...item, value: `${item.machinetypename}`, label: `${item.machinetypename}`, text: `${item.machinetypename}` };
	// 					});
	// 				}
	// 			});
	// 		}, 500);
	// 	} else {
	// 		dialogConfig?.forEach((item) => {
	// 			item.options = [];
	// 		});
	// 	}
	// } else {
	// 	if (query) {
	// 		setTimeout(async () => {
	// 			dialogConfig?.forEach(async (item) => {
	// 				if (item.prop === 'stationname') {
	// 					const res = await getStationQueryNoPageApi(query);
	// 					item.loading = false;
	// 					item.options = res.data.map((item: EmptyObjectType) => {
	// 						return { ...item, value: `${item.stationname}`, label: `${item.stationname}`, text: `${item.stationname}` };
	// 					});
	// 				}
	// 			});
	// 		}, 500);
	// 	} else {
	// 		dialogConfig?.forEach((item) => {
	// 			item.options = [];
	// 		});
	// 	}
	// }
};
// 刪除站位下的機台
const onMachineDelRow = async (row: EmptyObjectType, i: number) => {
	// const res = await deleteProjectDeleteStationMachineApi(row.runid);
	// if (res.status) {
	// 	ElMessage.success(`${t('message.allButton.deleteBtn')}${t('message.hint.success')}`);
	// 	getMachineData(row, positionRow.projectcode);
	// }
};
// 新增專案站位數據
// const addPositionData = async (ruleForm: EmptyObjectType, type: string) => {
// 	loadingBtn.value = true;
// 	const editData = {
// 		runId: ruleForm.runid,
// 		line: ruleForm.line,
// 		// machineType: ruleForm.machinetype,
// 		stationName: ruleForm.stationname,
// 		stationCode: ruleForm.stationcode,
// 		// projectCode: positionRow.projectcode,
// 	};
// 	const { stationName, stationCode, line } = editData;
// 	const res =
// 		type === 'add'
// 			? await postProjectAddProjectStationApi({ stationCode, stationName, projectId, line })
// 			: await putProjectUpdateProjectStationApi(editData);
// 	if (res.status) {
// 		type === 'add' ? ElMessage.success(t(`message.hint.addSuccess`)) : ElMessage.success(t(`message.hint.modifiedSuccess`));
// 		projectPositionDialogRef.value.closeDialog();
// 		getPositionTableData(projectId);
// 	}
// 	loadingBtn.value = false;
// };
// // 新增站位下的機台
// const addMachineData = async (ruleForm: EmptyObjectType, type: string) => {
// 	loadingBtn.value = true;
// 	const editData = {
// 		runId: ruleForm.runid,
// 		stationCode: rows.stationcode,
// 		stationName: rows.stationname,
// 		machineNo: ruleForm.machineno,
// 		machineType: ruleForm.machinetype,
// 		projectCode: positionRow.projectcode,
// 		line: rows.line,
// 	};
// 	const { stationName, stationCode, machineNo, machineType, runId, projectCode, line } = editData;
// 	const res =
// 		type === 'add'
// 			? await postProjectAddStationMachineApi({ stationCode, stationName, machineNo, machineType, projectCode, line })
// 			: await postProjectUpdateStationMachineApi({ runId, machineNo, machineType, projectCode, line });
// 	if (res.status) {
// 		type === 'add' ? ElMessage.success(t(`message.hint.addSuccess`)) : ElMessage.success(t(`message.hint.modifiedSuccess`));
// 		machineOptionDialogRef.value.closeDialog();
// 		getMachineData(rows, positionRow.projectcode);
// 	}
// 	loadingBtn.value = false;
// };
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
:deep(.el-dialog .mt20) {
	margin-top: 0 !important;
}
</style>
