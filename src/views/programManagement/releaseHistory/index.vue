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
				@importTable="onExportTableData"
				@pageChange="onTablePageChange"
				@sortHeader="onSortHeader"
			>
			</Table>
		</div>
	</div>
</template>

<script setup lang="ts" name="releaseHistory">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { getProjectQueryNoPageApi, getProjectQueryNopageProjectStationApi } from '/@/api/programManagement/programRelease';
import { getStageQueryNoPageApi } from '/@/api/projectConfiguration/projectManage';
import { postExportPublishStationApi, postPublishQueryPageByStationApi } from '/@/api/programManagement/releaseHistory';
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
			{ key: 'projectName', colWidth: '', title: 'message.pages.projectName', type: 'text', isCheck: true },
			{ key: 'productionLineType', colWidth: '', title: 'message.pages.productionlinetype', type: 'text', isCheck: true },
			{ key: 'stationName', colWidth: '', title: 'message.pages.stationName', type: 'text', isCheck: true },
			{ key: 'programName', colWidth: '', title: 'message.pages.packageName', type: 'text', isCheck: true },
			{ key: 'version', colWidth: '', title: 'message.pages.programVersion', type: 'text', isCheck: true },
			{ key: 'createTime', colWidth: '', title: 'message.pages.publicationStartTime', type: 'text', isCheck: true },
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
			isOperate: false, // 是否显示表格操作栏
			isButton: false, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: true, //是否有表格右上角工具
			exportIcon: true, //是否有导出icon(导出功能)
			isPage: true, //是否有分页
			operateWidth: 220,
			isBulkDeletionBtn: false,
		},
		topBtnConfig: [],
		btnConfig: [],
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
			// 	label: '發佈狀態',
			// 	prop: 'machineType',
			// 	required: false,
			// 	type: 'select',
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
		dialogConfig: [],
	},
});

// 初始化列表数据
const getTableData = async () => {
	const form = state.tableData.form;
	let data: EmptyObjectType = {
		...form,
		startTime: form.publishDate && form.publishDate[0],
		endTime: form.publishDate && form.publishDate[1],
		page: state.tableData.page,
	};
	delete data.publishDate;
	const res = await postPublishQueryPageByStationApi(data);
	if (res.data.data === null) res.data.data = [];
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
		return { value: item.runid, label: item.productionlinetype, text: item.projectname, selected: false };
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
// 導出
const onExportTableData = async (row: EmptyObjectType, hearder: EmptyObjectType) => {
	const form = state.tableData.form;
	let data: EmptyObjectType = {
		...form,
		startTime: form.publishDate && form.publishDate[0],
		endTime: form.publishDate && form.publishDate[1],
	};
	delete data.publishDate;
	const res = await postExportPublishStationApi(data);
	const result: any = res.data;
	let blob = new Blob([result], {
		// 这里一定要和后端对应，不然可能出现乱码或者打不开文件
		type: 'application/vnd.ms-excel',
	});
	const link = document.createElement('a');
	link.href = window.URL.createObjectURL(blob);
	const temp = res.headers['content-disposition'].split(';')[1].split('filename=')[1].replace(new RegExp('"', 'g'), '');
	link.download = decodeURIComponent(temp);
	// link.download = `${t('料號')} ${new Date().toLocaleString()}.xlsx`; // 在前端也可以设置文件名字
	link.click();
	//释放内存
	window.URL.revokeObjectURL(link.href);
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
