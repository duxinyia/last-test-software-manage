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
				@onOpenOtherDialog="openOtherDialog"
				@toggleRowExpansion="toggleRowExpansion"
				@rowClick="toggleRowExpansion"
				:expandedRowKeys="expandedRowKeys"
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
					>
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
						<el-table-column prop="operation" fixed="right" align="right" header-align="center" :label="$t('message.pages.operation')" :width="100">
							<template v-slot="scope">
								<el-button class="button" type="danger" size="small" @click="onDelRow(scope)">{{ $t('message.allButton.deleteBtn') }}</el-button>
							</template>
						</el-table-column>
					</el-table>
				</template>
			</Table>

			<!-- 新增编辑弹窗 -->
			<Dialog
				ref="stationDialogRef"
				:dialogConfig="state.tableData.dialogConfig"
				@addData="addData"
				:loadingBtn="loadingBtn"
				dialogWidth="30%"
				:isFootBtn="isFootBtn"
			>
			</Dialog>
		</div>
	</div>
</template>

<script setup lang="ts" name="lines">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import {
	deleteAreaDeleteApi,
	getAreaQueryBuildingApi,
	getAreaQueryFloorApi,
	postAddBuildingApi,
	postAddFloorApi,
} from '/@/api/basicInformation/area';

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
const lineDialogTableFormRef = ref();
const setExpandHeader = ref([
	{ key: 'building', colWidth: '', title: 'message.pages.building', type: 'text', isCheck: true, isRequired: false },
	{ key: 'floor', colWidth: '', title: 'message.pages.floor', type: 'text', isCheck: true, isRequired: false },
]);
const state = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [{ key: 'building', colWidth: '', title: 'message.pages.building', type: 'text', isCheck: true }],
		// 配置项（必传）
		config: {
			total: 0, // 列表总数
			loading: true, // loading 加载
			isBorder: false, // 是否显示表格边框
			isSerialNo: false, // 是否显示表格序号
			isSelection: false, // 是否显示表格多选
			isOperate: true, // 是否显示表格操作栏
			isButton: true, //是否显示表格上面的新增删除按钮
			isInlineEditing: false, //是否是行内编辑
			isTopTool: false, //是否有表格右上角工具
			isPage: false, //是否有分页
			operateWidth: 200,
			expand: true,
		},
		topBtnConfig: [{ type: 'add', name: 'message.pages.addBuilding', defaultColor: 'primary', isSure: true, disabled: true }],
		btnConfig: [
			{ type: 'floor', name: 'message.pages.addFloor', isSure: false, icon: '', defaultColor: 'success' },
			// { type: 'edit', name: 'message.allButton.editBtn', isSure: false, icon: 'ele-Edit', defaultColor: 'warning' },
			{ type: 'del', name: 'message.allButton.deleteBtn', isSure: true, defaultColor: 'danger' },
		],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [{ label: 'message.pages.building', prop: 'name', required: false, type: 'select', placeholder: '', options: [] }],
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
				label: 'message.pages.building',
				prop: 'building',
				placeholder: '',
				required: true,
				type: 'input',

				isCheck: true,
			},
			{
				label: 'message.pages.floor',
				prop: 'floor',
				placeholder: '',
				required: true,
				type: 'input',
				isCheck: false,
			},
		],
	},
});
// 表頭顏色
const headerCellStyle = ({ column }: any) => {
	let sty: EmptyObjectType = { backgroundColor: 'white', color: '#0047c5' };
	return sty;
};
const getRowKey = (row: EmptyObjectType) => {
	return row.index;
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
const loading = ref(false);
const expandData = ref([]);
const expandedRowKeys = ref<string[]>([]);
const toggleRowExpansion = async (row: EmptyObjectType, column: EmptyObjectType, falg?: number) => {
	if (column.property === 'operation') return;
	loading.value = true;
	if (row.runid && !remove(expandedRowKeys.value, row.runid)) {
		// 實現手風琴展開
		expandedRowKeys.value = [];
		expandedRowKeys.value.push(row.runid);
		const res = await getAreaQueryFloorApi(row.building);
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

// 初始化列表数据
const getTableData = async () => {
	state.tableData.config.loading = true;
	const form = state.tableData.form;
	const res = await getAreaQueryBuildingApi(form.name);
	res.data.forEach((item: any) => {
		item.hasChildren = true;
	});

	state.tableData.data = res.data;
	state.tableData.search[0].options = res.data.map((item: any) => {
		return {
			value: item.building,
			label: item.building,
			text: item.building,
		};
	});
	if (res.status) {
		state.tableData.config.loading = false;
	}
};

// 搜索点击时表单回调
const onSearch = (data: EmptyObjectType) => {
	state.tableData.form = Object.assign({}, state.tableData.form, { ...data });
	tableRef.value?.pageReset();
};
let dialogType = '';

// 打开新增編輯弹窗
const openDialog = async (type: string, row: EmptyObjectType) => {
	dialogType = type;
	state.tableData.dialogConfig![1].isCheck = false;
	state.tableData.dialogConfig![0].type = 'input';
	stationDialogRef.value.openDialog(type, row, '');
};
const openOtherDialog = (scope: EmptyObjectType, type: string) => {
	state.tableData.dialogConfig![1].isCheck = true;
	state.tableData.dialogConfig![0].type = 'text';
	stationDialogRef.value.openDialog(type, scope.row, 'message.pages.addFloor', 'message.allButton.addBtn');
};
// 新增数据 修改數據
const addData = async (ruleForm: EmptyObjectType, type: string) => {
	console.log(type);
	const { runid, building, floor } = ruleForm;
	loadingBtn.value = true;
	try {
		const res = type === 'add' ? await postAddBuildingApi({ ...ruleForm }) : await postAddFloorApi({ parentid: runid, building, floor });
		if (res.status) {
			ElMessage.success(t(`message.hint.addSuccess`));
			stationDialogRef.value.closeDialog();
			if (type === 'add') {
				getTableData();
			} else {
				const res = await getAreaQueryFloorApi(ruleForm.building);
				res.data.forEach((item: any, index: number) => {
					item.index = index;
				});
				expandData.value = res.data;
			}
		}
	} catch (error) {
		loadingBtn.value = false;
	}
	loadingBtn.value = false;
};
// 刪除樓層
const onDelRow = async (scope: EmptyObjectType) => {
	ElMessageBox.confirm(t('message.hint.suredel'), t('message.hint.tips'), {
		confirmButtonText: t('message.allButton.ok'),
		cancelButtonText: t('message.allButton.cancel'),
		type: 'warning',
		draggable: true,
		closeOnClickModal: false,
	})
		.then(async () => {
			const res = await deleteAreaDeleteApi(scope.row.runid);
			if (res.status) {
				ElMessage.success(`${t('message.allButton.deleteBtn')} ${t('message.hint.success')}`);
				const res = await getAreaQueryFloorApi(scope.row.building);
				res.data.forEach((item: any, index: number) => {
					item.index = index;
				});
				expandData.value = res.data;
			}
		})
		.catch(() => {});
};
// 表格删除当前项回调
const onTableDelRow = async (row: EmptyObjectType, type: string) => {
	const res = await deleteAreaDeleteApi(row.runid);
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
onMounted(async () => {
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
:deep(.download-form) {
	margin-bottom: 50px !important;
}
</style>
