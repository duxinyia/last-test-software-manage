<template>
	<div class="table-container layout-padding">
		<div class="table-padding layout-padding-view layout-padding-auto">
			<TableSearch ref="tableSearchRef" :search="state.tableData.search" @search="onSearch" :searchConfig="state.tableData.searchConfig" />
			<Table ref="tableRef" v-bind="state.tableData" class="table" @pageChange="onTablePageChange" @sortHeader="onSortHeader"> </Table>
		</div>
	</div>
</template>

<script setup lang="ts" name="releaseHistory">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { getProjectQueryNoPageApi, getProjectQueryNopageProjectStationApi } from '/@/api/programManagement/programRelease';
import { postStageQueryNoPageApi } from '/@/api/projectConfiguration/projectManage';
import { postPublishQueryPageByStationApi } from '/@/api/programManagement/releaseHistory';
// 引入组件
const Table = defineAsyncComponent(() => import('/@/components/table/index.vue'));
const TableSearch = defineAsyncComponent(() => import('/@/components/search/search.vue'));
// 引入组件
const Dialog = defineAsyncComponent(() => import('/@/components/dialog/dialog.vue'));
// 定义变量内容
const { t } = useI18n();
const stationDialogRef = ref();
const tableSearchRef = ref();
const tableRef = ref<RefType>();
const loadingBtn = ref(false);
const isFootBtn = ref(true);
const row = ref();
const state = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'projectName', colWidth: '', title: '專案名', type: 'text', isCheck: true },
			{ key: 'productionLineType', colWidth: '', title: '機台類型', type: 'text', isCheck: true },
			{ key: 'stationName', colWidth: '', title: '站位名稱', type: 'text', isCheck: true },
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
			isOperate: false, // 是否显示表格操作栏
			isButton: false, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: true, //是否有分页
			operateWidth: 220,
			isBulkDeletionBtn: false,
		},
		topBtnConfig: [],
		btnConfig: [],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{ label: '專案名', prop: 'projectId', required: false, type: 'select', options: [] },
			{
				label: '站位名稱',
				prop: 'stationName',
				required: false,
				type: 'input',
			},
			// {
			// 	label: '發佈狀態',
			// 	prop: 'machineType',
			// 	required: false,
			// 	type: 'select',
			// },
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
		printName: '',
		// 弹窗表单
		dialogConfig: [],
	},
});

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
	const res = await postPublishQueryPageByStationApi(data);
	if (res.data.data === null) res.data.data = [];
	res.data.data.forEach((item: any) => {
		item.programType = programTypeMap[item.programType];
	});
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
		return { value: item.runid, lable: item.projectname, text: item.projectname, selected: false };
	});
	state.tableData.search[0].options = options;
	// state.tableData.dialogConfig![0].options = options;
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
</style>
