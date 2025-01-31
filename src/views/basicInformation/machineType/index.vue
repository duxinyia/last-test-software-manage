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
				@onOpentopBtnOther="onOpentopBtnOther"
			/>
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
			<Dialog ref="importDialogRef" :isFootBtn="false" dialogWidth="40%" @downloadTemp="downloadTemp" @importTableData="submitUpload"> </Dialog>
		</div>
	</div>
</template>

<script setup lang="ts" name="machineType">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';
import {
	postMachineTypeQueryPageApi,
	postMachineTypeAddMachineTypeApi,
	putMachineTypeUpdateMachineTypeApi,
	deleteMachineTypeDeleteMachineTypeApi,
	postMachineTypeImportMachineApi,
	postExportMachineLineStationApi,
} from '/@/api/basicInformation/machineType';
import { getUploadFileApi } from '/@/api/global';
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
const importDialogRef = ref();

const state = reactive<TableDemoState>({
	tableData: {
		// 列表数据（必传）
		data: [],
		// 表头内容（必传，注意格式）
		header: [
			{ key: 'machineno', colWidth: '', title: 'message.pages.machineno', type: 'text', isCheck: true },
			{ key: 'machinetype', colWidth: '', title: 'message.pages.machineType', type: 'text', isCheck: true },
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
		topBtnConfig: [
			{ type: 'add', name: 'message.pages.newMachine', defaultColor: 'primary', isSure: true, disabled: true },
			{ type: 'import', name: 'message.pages.bulkImport', defaultColor: 'success', isSure: true, disabled: true },
			{ type: 'exports', name: '下載', defaultColor: 'warning', isSure: true, disabled: true },
		],
		btnConfig: [
			{ type: 'edit', name: 'message.allButton.editBtn', isSure: false, icon: 'ele-Edit', defaultColor: 'warning' },
			{ type: 'del', name: 'message.allButton.deleteBtn', isSure: true, defaultColor: 'danger' },
		],
		// 搜索表单，动态生成（传空数组时，将不显示搜索，注意格式）
		search: [
			{
				label: 'message.pages.machineno',
				prop: 'machineNo',
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
				label: 'message.pages.machineno',
				prop: 'machineno',
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
				label: 'message.pages.machineType',
				prop: 'machinetype',
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
// 打開批量導入彈窗
const onOpentopBtnOther = async (_: any, type: string) => {
	if (type === 'exports') {
		const form = state.tableData.form;
		let data: EmptyObjectType = {
			...form,
		};
		if (state.tableData.data.length <= 0) return ElMessage.warning(t('沒有可以導出的機台'));
		const res = await postExportMachineLineStationApi(data);
		const result: any = res.data;
		let blob = new Blob([result], {
			// 这里一定要和后端对应，不然可能出现乱码或者打不开文件
			type: 'application/vnd.ms-excel',
		});
		const link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		const temp = res.headers['content-disposition'].split(';')[1].split('filename=')[1].replace(new RegExp('"', 'g'), '');
		link.download = decodeURIComponent(temp);
		// link.download = `${t('文件')} ${new Date().toLocaleString()}.xlsx`; // 在前端也可以设置文件名字
		link.click();
		//释放内存
		window.URL.revokeObjectURL(link.href);
	} else {
		importDialogRef.value.openDialog('imp', {}, 'message.tooltip.import');
	}
};
// 下載模板
const downloadTemp = () => {
	window.open(
		`${import.meta.env.MODE === 'development' ? import.meta.env.VITE_API_URL : window.webConfig.webApiBaseUrl}/機台數據導入模板.xlsx`,
		'_blank'
	);
};
// 上传文件
const submitUpload = async (formEl: EmptyObjectType | undefined) => {
	const res = await getUploadFileApi(0, formEl!.raw);
	if (res.status) {
		const res1 = await postMachineTypeImportMachineApi(res.data);
		if (res1.status) {
			ElMessage.success(res1.message);
			importDialogRef.value.closeDialog();
			getTableData();
		}
	}
};
// 初始化列表数据
const getTableData = async () => {
	state.tableData.config.loading = true;
	const form = state.tableData.form;
	let data = {
		...form,
		page: state.tableData.page,
	};
	const res = await postMachineTypeQueryPageApi(data);
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
	stationDialogRef.value.openDialog(type, row, 'message.pages.machine');
	const machineNodialogConfig = state.tableData.dialogConfig![0];
	machineNodialogConfig.type = type === 'edit' ? 'text' : 'input';
	machineNodialogConfig.required = type === 'edit' ? false : true;
};

// 新增数据  修改数据
const addData = async (ruleForm: EmptyObjectType, type: string) => {
	loadingBtn.value = true;
	const editData = { machineNo: ruleForm.machineno, machineType: ruleForm.machinetype };
	const res =
		type === 'add'
			? await postMachineTypeAddMachineTypeApi({ machineNo: ruleForm.machineno, machineType: ruleForm.machinetype })
			: await putMachineTypeUpdateMachineTypeApi(editData);
	if (res.status) {
		type === 'add' ? ElMessage.success(t(`message.hint.addSuccess`)) : ElMessage.success(t(`message.hint.modifiedSuccess`));
		stationDialogRef.value.closeDialog();
		getTableData();
	}
	loadingBtn.value = false;
};
// 表格删除当前项回调
const onTableDelRow = async (row: EmptyObjectType, type: string) => {
	const res = await deleteMachineTypeDeleteMachineTypeApi(row.machineno);
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
:deep(.download-form) {
	margin-bottom: 50px !important;
}
</style>
