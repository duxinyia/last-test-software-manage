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
				@onOpenOtherDialog="openBindDialog"
			/>
			<!-- 新增编辑弹窗 -->
			<Dialog
				ref="stationDialogRef"
				:dialogConfig="state.tableData.dialogConfig"
				@addData="addData"
				:loadingBtn="loadingBtn"
				dialogWidth="30%"
				:isFootBtn="true"
			>
			</Dialog>
			<!-- 綁定彈窗 -->
			<Dialog ref="bindDialogRef" dialogWidth="50%" @addData="onBind" :isFootBtn="isFootBtn">
				<template #dialogTable="{ datas }">
					<el-form ref="tableFormRef" :model="dialogState.tableData" size="default">
						<Table
							ref="dialogTableRef"
							v-bind="dialogState.tableData"
							class="table-dialog"
							@selectionChange="onSelectionChange"
							@onOpenOtherDialog="onUnBind"
						>
						</Table>
					</el-form>
				</template>
			</Dialog>
		</div>
	</div>
</template>

<script setup lang="ts" name="lines">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';

import {
	postLineQueryPageApi,
	postLineAddLineApi,
	putLineUpdateLineApi,
	deleteLineDeleteLineApi,
	postLineBindStationApi,
	getLineGetNotBoundStationApi,
	postLineQueryPageNotBoundStationApi,
	postLineQueryPageBoundStationApi,
	postLineUnBindStationApi,
} from '/@/api/basicInformation/lines';
import { postStationQueryPageApi } from '/@/api/basicInformation/position';
// 引入组件
const Table = defineAsyncComponent(() => import('/@/components/table/index.vue'));
const TableSearch = defineAsyncComponent(() => import('/@/components/search/search.vue'));
// 引入组件
const Dialog = defineAsyncComponent(() => import('/@/components/dialog/dialog.vue'));
// 定义变量内容
const { t } = useI18n();
const stationDialogRef = ref();
const tableRef = ref<RefType>();
const loadingBtn = ref(false);
const isFootBtn = ref(true);
const bindDialogRef = ref();
const state = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'line', colWidth: '', title: '線體名稱', type: 'text', isCheck: true },
			{ key: 'linecode', colWidth: '', title: '線體代碼', type: 'text', isCheck: true },
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
			operateWidth: 400,
			isBulkDeletionBtn: false,
		},
		topBtnConfig: [{ type: 'add', name: '新增線體', defaultColor: 'primary', isSure: true, disabled: true }],
		btnConfig: [
			{ type: 'bind', name: '綁定站位', isSure: false, icon: '', defaultColor: 'success' },
			{ type: 'unbind', name: '解綁站位', isSure: false, icon: '', color: '#dc362e' },
			{ type: 'edit', name: 'message.allButton.editBtn', isSure: false, icon: 'ele-Edit', defaultColor: 'warning' },
			{ type: 'del', name: 'message.allButton.deleteBtn', isSure: true, defaultColor: 'danger' },
		],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{
				label: '線體名稱',
				prop: 'line',
				required: false,
				type: 'input',
			},
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
				label: '線體名稱',
				prop: 'line',
				placeholder: '',
				required: true,
				type: 'input',
				standbyType: 'input',
				xs: 24,
				sm: 24,
				md: 24,
				lg: 24,
				xl: 24,
				isCheck: true,
			},
			{
				label: '線體代碼',
				prop: 'linecode',
				placeholder: '',
				required: true,
				type: 'input',
				standbyType: 'input',
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
const dialogState = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'stationname', colWidth: '', title: '站位名稱', type: 'text', isCheck: true },
			{ key: 'stationcode', colWidth: '', title: '站位代碼', type: 'text', isCheck: true },
		],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: true, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: true, // 是否显示表格序号
			isSelection: true, // 是否显示表格多选
			isOperate: false, // 是否显示表格操作栏
			isButton: false, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: true, //是否有分页
			operateWidth: 90,
			isBulkDeletionBtn: false,
			height: 300,
		},
		topBtnConfig: [],
		btnConfig: [{ type: 'unbind', name: '解綁', isSure: false, icon: '', defaultColor: 'danger' }],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [],
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
// 得到未綁定或者已綁定站位 unbind:點擊了解綁按鈕拿到已綁定的站位
const getStationData = async (type: string) => {
	let data = {
		lineCode: currentDilaoglineCode,
		page: dialogState.tableData.page,
	};
	const res =
		type === 'unbind'
			? await postLineQueryPageBoundStationApi(data)
			: await postLineQueryPageNotBoundStationApi({ page: dialogState.tableData.page });
	dialogState.tableData.data = res.data.data;
	dialogState.tableData.config.total = res.data.total;
	dialogState.tableData.config.loading = false;
};
// 初始化列表数据
const getTableData = async () => {
	state.tableData.config.loading = true;
	const form = state.tableData.form;
	let data = {
		...form,
		page: state.tableData.page,
	};
	const res = await postLineQueryPageApi(data);
	state.tableData.data = res.data.data;
	state.tableData.config.total = res.data.total;
	if (res.status) {
		state.tableData.config.loading = false;
	}
};

// 搜索点击时表单回调
const onSearch = (data: EmptyObjectType) => {
	state.tableData.form = Object.assign({}, state.tableData.form, { ...data });
	tableRef.value?.pageReset();
};
// 打开新增編輯弹窗
const openDialog = (type: string, row: EmptyObjectType) => {
	stationDialogRef.value.openDialog(type, row, 'message.pages.line');
};
let currentDilaoglineCode = '';
// 打開綁定彈窗
const openBindDialog = (scope: EmptyObjectType, type: string) => {
	dialogState.tableData.data = [];
	dialogState.tableData.config.loading = true;
	selectList.value = [];
	bindDialogRef.value.openDialog(type, scope.row, type === 'unbind' ? '解除站位' : '綁定站位', '綁定');
	currentDilaoglineCode = scope.row.linecode;
	changeDialogConfig(type);
	getStationData(type);
};
const changeDialogConfig = (type: string) => {
	isFootBtn.value = type === 'unbind' ? false : true;
	dialogState.tableData.config.isSelection = type === 'bind' ? true : false;
	dialogState.tableData.config.isOperate = type === 'unbind' ? true : false;
};
const selectList = ref([] as EmptyObjectType[]);
// 選中行
const onSelectionChange = (selectlist: EmptyArrayType) => {
	selectList.value = selectlist;
};
// 解綁
const onUnBind = async (scope: EmptyObjectType, type: string) => {
	ElMessageBox.confirm('確定解綁嗎?', '提示', {
		confirmButtonText: '確 定',
		cancelButtonText: '取 消',
		type: 'warning',
		draggable: true,
	})
		.then(async () => {
			const rows = scope.row;
			let res = await postLineUnBindStationApi({ lineCode: rows.linecode, stationId: rows.runid });
			if (res.status) {
				ElMessage.success('解綁成功');
				getStationData('unbind');
			}
		})
		.catch(() => {});
};

// 綁定
const onBind = async () => {
	let data = selectList.value;
	if (data.length <= 0) return ElMessage.warning(t('請選擇要綁定的站位'));
	let stationIdList: EmptyArrayType = [];
	data.forEach((item) => {
		stationIdList.push(item.runid);
	});
	loadingBtn.value = true;
	let res = await postLineBindStationApi({ lineCode: currentDilaoglineCode, stationIdList });
	if (res.status) {
		ElMessage.success('綁定成功');
		bindDialogRef.value.closeDialog();
		getTableData();
	}
	loadingBtn.value = false;
};

// 新增数据  修改数据
const addData = async (ruleForm: EmptyObjectType, type: string) => {
	loadingBtn.value = true;
	const editData = { runId: ruleForm.runid, line: ruleForm.line, lineCode: ruleForm.linecode };
	const res = type === 'add' ? await postLineAddLineApi({ line: ruleForm.line, lineCode: ruleForm.linecode }) : await putLineUpdateLineApi(editData);
	if (res.status) {
		type === 'add' ? ElMessage.success(t(`message.hint.addSuccess`)) : ElMessage.success(t(`message.hint.modifiedSuccess`));
		stationDialogRef.value.closeDialog();
		getTableData();
	}
	loadingBtn.value = false;
};
// 表格删除当前项回调
const onTableDelRow = async (row: EmptyObjectType, type: string) => {
	const res = await deleteLineDeleteLineApi(row.runid);
	if (res.status) {
		ElMessage.success(`${t('message.allButton.deleteBtn')} ${t('message.hint.success')}`);
		getTableData();
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

// 页面加载时
onMounted(() => {
	getTableData();
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
</style>
