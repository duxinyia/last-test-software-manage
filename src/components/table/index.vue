<template>
	<div class="table-container">
		<div class="table-top" v-if="config.isButton || config.isInlineEditing || config.isTopTool">
			<!-- 新增弹窗按钮以及批量删除按钮 -->
			<div v-if="config.isButton" class="allBtn mt20" v-for="topbtn in topBtnConfig" :key="topbtn.name">
				<el-button
					v-if="topbtn.type === 'add'"
					size="default"
					class="ml10"
					@click="onOpenAdd('add')"
					:color="topbtn.color"
					:type="topbtn.defaultColor"
					plain
					><el-icon class="mr5"><ele-Plus /></el-icon>{{ $t(topbtn.name) }}</el-button
				>
				<el-popconfirm v-else-if="topbtn.type === 'bulkDel'" :title="$t('確定刪除選中項嗎？')" @confirm="onBulkDeletion">
					<template #reference>
						<el-button size="default" :disabled="state.selectlist.length <= 0" class="ml10" color="#D33939" plain
							><el-icon><ele-Delete /></el-icon>{{ $t('message.allButton.bulkDeletionBtn') }}</el-button
						>
					</template>
				</el-popconfirm>
				<el-button v-else-if="topbtn.type === 'export'" @click="onExportTable" size="default" class="" type="primary" plain>{{
					$t('message.tooltip.export')
				}}</el-button>
				<el-button
					@click="onOpentopBtnOther(topbtn.type)"
					v-else-if="topbtn.isSure"
					size="default"
					class="ml10"
					:color="topbtn.color"
					plain
					:type="topbtn.defaultColor"
					:disabled="topbtn.isNoSelcetDisabled ? state.selectlist.length <= 0 : false"
					><SvgIcon class="mr5" :name="topbtn.icon" /> {{ $t(topbtn.name) }}</el-button
				>
			</div>
			<div class="add-row" v-if="config.isInlineEditing && config.isAddRowBtn">
				<el-button size="default" class="" @click="onAddRow" type="primary" plain
					><el-icon class="mr5"><ele-Plus /></el-icon>{{ $t('message.allButton.addBtn') }}</el-button
				>
			</div>
			<slot name="topButton"></slot>
			<div class="table-top-tool" v-if="config.isTopTool">
				<!-- <SvgIcon name="iconfont icon-dayinji" :size="19" title="打印" @click="onPrintTable" /> -->
				<!-- <SvgIcon name="iconfont icon-btn-daoru" :size="22" :title="$t('message.tooltip.import')" @click="onImportTable('imp')" /> -->
				<!-- <el-button @click="onExportTable" v-if="config.exportIcon" size="default" class="" type="primary" plain>{{
					$t('message.tooltip.export')
				}}</el-button> -->
				<slot name="toolIcon"></slot>
				<el-icon v-if="config.exportIcon" name="iconfont icon-btn-daochu" :size="22" :title="$t('message.tooltip.download')" @click="onExportTable"
					><ele-Download
				/></el-icon>
				<!-- <el-icon v-if="config.exportIcon" name="iconfont icon-btn-daochu" :size="22" :title="$t('message.tooltip.export')" @click="onExportTable"
					><ele-Upload
				/></el-icon> -->
				<!-- <SvgIcon v-if="config.exportIcon" name="iconfont icon-btn-daochu" :size="22" :title="$t('message.tooltip.export')" @click="onExportTable" /> -->
				<!-- <SvgIcon name="iconfont icon-refresh-line" :size="23" :title="$t('message.tooltip.refresh')" @click="onRefreshTable" /> -->
				<el-icon name="iconfont icon-refresh-line" :size="22" :title="$t('message.tooltip.refresh')" @click="onRefreshTable"><ele-Refresh /></el-icon>
				<el-popover
					placement="top-end"
					trigger="click"
					transition="el-zoom-in-top"
					popper-class="table-tool-popper"
					:width="300"
					:persistent="false"
					@show="onSetTable"
				>
					<template #reference>
						<el-icon name="iconfont icon-shezhi" :size="22" :title="$t('message.tooltip.setting')"><ele-Setting /></el-icon>
						<!-- <SvgIcon name="iconfont icon-shezhi" :size="20" :title="$t('message.tooltip.setting')" /> -->
					</template>
					<template #default>
						<div class="tool-box">
							<el-tooltip :content="$t('message.pages.dragsort')" placement="top-start">
								<el-icon class="ml11" color="#909399" :size="17"><ele-QuestionFilled /></el-icon>
							</el-tooltip>
							<el-checkbox
								v-model="state.checkListAll"
								:indeterminate="state.checkListIndeterminate"
								class="ml10 mr1"
								:label="$t('message.pages.columndisplay')"
								@change="onCheckAllChange"
							/>
							<el-checkbox v-model="getConfig.isSerialNo" class="ml12 mr1" :label="$t('message.pages.no')" />
							<el-checkbox v-model="getConfig.isSelection" class="ml12 mr1" :label="$t('message.pages.moreoptions')" />
						</div>
						<el-scrollbar>
							<div ref="toolSetRef" class="tool-sortable">
								<div class="tool-sortable-item" v-for="v in header" :key="v.key" :data-key="v.key">
									<el-icon :size="17" class="handle cursor-pointer"><ele-Rank /></el-icon>
									<el-checkbox v-model="v.isCheck" size="default" class="ml12 mr8" :label="$t(v.title)" @change="onCheckChange" />
								</div>
							</div>
						</el-scrollbar>
					</template>
				</el-popover>
			</div>
		</div>
		<el-table
			ref="tableRef"
			:height="config.height"
			id="elTable"
			:class="!config.isDialogTab ? 'mt12' : ''"
			:row-class-name="tableRowClassName"
			:data="data"
			:border="setBorder"
			v-bind="$attrs"
			:row-key="selRowKey"
			:stripe="objectSpanMethod ? false : true"
			style="width: 100%"
			:header-row-style="{ background: '' }"
			v-loading="config.loading"
			@selection-change="onSelectionChange"
			@cell-click="cellClick"
			@row-click="rowClick"
			:cell-style="cellStyle"
			:span-method="objectSpanMethod"
			:expand-row-keys="expandedRowKeys"
			@expand-change="toggleRowExpansion"
			@current-change="handleCurrentChange"
		>
			<el-table-column type="selection" :reserve-selection="true" width="30" v-if="config.isSelection" />
			<el-table-column align="center" type="index" :index="indexMethod" :label="$t('message.pages.no')" width="70" v-if="config.isSerialNo" />
			<el-table-column type="expand" v-if="config.expand">
				<template #default="props">
					<slot name="expand" :expandProps="props"></slot>
				</template>
			</el-table-column>
			<el-table-column
				align="center"
				v-for="(item, index) in setHeader"
				:key="index"
				show-overflow-tooltip
				:prop="item.key"
				:width="item.colWidth"
				:label="$t(item.title)"
			>
				<template v-if="config.isInlineEditing" v-slot:header>
					<span v-if="item.isRequired" class="color-danger">*</span>
					<span class="pl5">{{ $t(item.title) }}</span>
				</template>

				<template v-slot="scope">
					<slot v-if="item.type === 'slot'" name="slotCol" :row="scope.row"></slot>
					<el-form-item
						v-if="config.isInlineEditing"
						:prop="`data.${scope.$index}.${item.key}`"
						:rules="[{ required: item.isRequired, message: '不能為空', trigger: item.type === 'time' ? 'blur' : 'change' }]"
					>
						<el-popover
							v-if="item.type === 'textarea'"
							effect="dark"
							trigger="hover"
							placement="top"
							width="auto"
							:disabled="data[scope.$index][item.key]?.length > 8 ? false : true"
						>
							<template #default>
								<div style="font-size: 12px">{{ data[scope.$index][item.key] }}</div>
							</template>
							<template #reference>
								<el-input
									v-if="item.type === 'textarea'"
									v-model="data[scope.$index][item.key]"
									type="textarea"
									placeholder="請輸入"
									:autosize="{ minRows: 1, maxRows: 1 }"
									:maxlength="item.maxlength || 500"
								></el-input>
							</template>
						</el-popover>

						<!-- 输入框 :disabled="route.path == '/basics/warehouseManage' ? (data[scope.$index].disabled === false ? false : true) : false"-->
						<el-input
							:disabled="data[scope.$index][`${item.key}disabled`]"
							:maxlength="item.maxlength"
							v-if="item.type === 'input'"
							style="height: 30px"
							v-model="data[scope.$index][item.key]"
							placeholder="請輸入"
							clearable
							@change="changedata(scope.$index, item.key)"
							@input="inputdata"
							@blur="inputBlur(scope.$index)"
						></el-input>
						<!-- 数字输入框 -->
						<el-input-number
							style="text-align: center; width: 100%; display: flex; justify-content: center"
							v-else-if="item.type === 'number'"
							v-model="data[scope.$index][item.key]"
							:min="data[scope.$index][`${item.key}min`] || 0"
							:max="data[scope.$index][`${item.key}max`]"
							size="small"
							@change="(value:number)=>handleNumberInputChange(value,scope.$index)"
							@blur="(value:number)=>handleNumberInputBlur(value, scope.$index)"
						/>
						<!-- 自动补全输入框 -->
						<el-autocomplete
							:debounce="500"
							clearable
							style="width: 100%"
							v-else-if="item.type === 'autocomplete'"
							v-model="data[scope.$index][item.key]"
							:fetch-suggestions="querySearchAsync"
							placeholder="請輸入"
							@change="changeData(scope.$index)"
							@select="(item:any) => handleSelect(scope.$index, item)"
						/>
						<!-- 下拉框 -->
						<el-select
							style="width: 100% !important"
							v-else-if="item.type === 'select'"
							:clearable="item.clearable"
							v-model="data[scope.$index][item.key]"
							:filterable="item.isfilterable"
							:placeholder="$t(item.placeholder!) || `${$t('message.pages.pleaseSelect')} ${$t(item.title)}`"
							remote
							:reserve-keyword="item.reserveKeyword"
							@change="(item:any) => changeSelect(scope.$index, item)"
							remote-show-suffix
							:remote-method="(query:string) => remoteMethod(scope.$index,query,item)"
							:loading="item.loading"
							:multiple="item.multiple"
							:max-collapse-tags="item.maxCollapseTags"
							:collapse-tags="item.collapseTags"
							:collapse-tags-tooltip="item.collapseTagsTooltip"
							@focus="selectFocus(scope)"
							@blur="selectBlur(scope)"
						>
							<template v-if="item.rowOption">
								<el-option v-for="i in data[scope.$index][`${item.key}option`]" :key="i.label" :label="i.text" :value="i.value" />
							</template>

							<template v-else>
								<el-option v-for="i in item.option" :key="i.label" :label="i.text" :value="i.value" />
							</template>
						</el-select>
						<!-- 多选下拉框 -->
						<el-select
							:disabled="data[scope.$index][`${item.key}disabled`]"
							v-if="item.type === 'multipleSelect'"
							v-model="data[scope.$index][item.key]"
							multiple
							collapse-tags
							collapse-tags-tooltip
							placeholder="請選擇"
						>
							<el-option v-for="i in item.options" :key="i.value" :label="i.label" :value="i.value" />
						</el-select>
						<!-- 状态 -->
						<el-switch
							:disabled="data[scope.$index][`${item.key}disabled`]"
							v-else-if="item.type === 'status1'"
							v-model="data[scope.$index][item.key]"
							:active-value="1"
							:inactive-value="0"
							validate-event
							inline-prompt
							@change="(value:number)=>handlestatus1Change(value,scope.$index,item.key)"
							:active-text="$t('message.allButton.statusY')"
							:inactive-text="$t('message.allButton.statusN')"
						></el-switch>

						<!-- 日期框 -->
						<el-date-picker
							v-else-if="item.type === 'time'"
							value-format="YYYY-MM-DD"
							v-model="data[scope.$index][item.key]"
							type="date"
							placeholder="請選擇"
							style="height: 30px; max-width: 167px"
						/>

						<span v-else-if="item.type === 'text'" style="text-align: center; width: 100%">
							{{ scope.row[item.key] }}
						</span>
					</el-form-item>
					<!-- 不能行内编辑 -->
					<template v-if="item.type === 'status'" style="text-align: center; width: 100%">
						<el-tag type="success" v-if="scope.row.runstatus === 1">啟用</el-tag>
						<el-tag type="info" v-else>禁用</el-tag>
					</template>
					<!-- 图片 -->
					<template v-if="item.type === 'uploadImage'">
						<el-image
							:style="{ width: `${item.width}px`, height: `${item.height}px` }"
							:src="`${scope.row[item.key]}`"
							:zoom-rate="1.2"
							:preview-src-list="[scope.row[item.key]]"
							preview-teleported
							hide-on-click-modal
							fit="cover"
						/>
					</template>
					<slot name="rowIcons" :row="scope.row" :itemConfig="item" :scopes="scope"></slot>
					<!-- 鏈接 -->
					<span v-if="item.type === 'link'">
						<a target="_blank" href="javascript:;" @click="clickLink(data[scope.$index][item.key + 'Link'])">{{ scope.row[item.key] }}</a>
					</span>
					<span v-if="!config.isInlineEditing && item.type === 'text'" style="text-align: center; width: 100%">
						{{ item.transfer ? $t(item.transfer[scope.row[item.key]]) : scope.row[item.key] }}
					</span>
					<slot v-if="item.type === 'slot'" name="column" :row="scope.row"></slot>
				</template>
			</el-table-column>
			<el-table-column
				align="center"
				header-align="center"
				:label="config.otherBtnOperate"
				:width="config.otherBtnOperateWidth || 120"
				v-if="config.isOtherBtnOperate"
			>
				<template v-slot="scope">
					<slot name="otherbtn" :row="scope.row"></slot>
				</template>
			</el-table-column>
			<el-table-column
				prop="operation"
				fixed="right"
				align="right"
				header-align="center"
				:label="$t('message.pages.operation')"
				:width="config.operateWidth || 130"
				v-if="config.isOperate"
			>
				<template v-slot="scope">
					<slot name="btn" :row="scope.row"></slot>
					<template v-for="btn in btnConfig" :key="btn.type">
						<el-button
							style="color: #fff"
							:disabled="scope.row[btn.type + 'Disabled']"
							v-if="!btn.isSure && !scope.row[btn.type + 'IsShow']"
							@click="btn.type === 'edit' ? onOpenEdit(btn.type, scope.row, scope) : onOpenOther(scope, btn.type)"
							:color="btn.color"
							size="small"
							:type="btn.defaultColor || ''"
							class="button"
						>
							<SvgIcon :class="btn.icon ? 'mr5' : ''" :name="btn.icon" />
							{{ $t(btn.name) }}</el-button
						>
						<el-button
							v-if="btn.type === 'del' && !scope.row[btn.type + 'IsShow']"
							:disabled="scope.row.delDisabled"
							class="button"
							@click="onDelRow(scope.row, scope.$index)"
							:color="btn.color"
							:type="btn.defaultColor"
							size="small"
							><el-icon v-if="btn.icon" class="btn.icon ? 'mr5' : ''"><ele-Delete /></el-icon>{{ $t(btn.name) }}</el-button
						>
					</template>
				</template>
			</el-table-column>
			<template #empty>
				<el-empty :description="$t('message.hint.nodata')" />
			</template>
		</el-table>
		<div class="footer" v-if="config.isPage">
			<el-pagination
				ref="pagination"
				class="mt15 pages"
				v-model:current-page="state.page.pageNum"
				v-model:page-size="state.page.pageSize"
				:pager-count="5"
				:page-sizes="[10, 20, 30]"
				:total="config.total"
				layout="total, sizes, prev, pager, next, jumper"
				background
				@size-change="onHandleSizeChange"
				@current-change="onHandleCurrentChange"
			>
			</el-pagination>
		</div>
	</div>
</template>

<script setup lang="ts" name="netxTable">
import { reactive, computed, nextTick, ref, defineAsyncComponent, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import printJs from 'print-js';
import Sortable from 'sortablejs';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
const route = useRoute();
import '/@/theme/tableTool.scss';
import { useI18n } from 'vue-i18n';
const tableRef = ref<RefType>();
const pagination = ref<RefType>();
const visible = ref(false);
// 引入组件
// const Dialog = defineAsyncComponent(() => import('/@/components/dialog/dialog.vue'));

// 定义父组件传过来的值
const props = defineProps({
	// 列表内容
	data: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	// 表头内容
	header: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	// 配置项
	config: {
		type: Object,
		default: () => {},
	},
	// 打印标题
	printName: {
		type: String,
		default: () => '',
	},
	// 弹出框内容
	// dialogConfig: {
	// 	type: Array<EmptyObjectType>,
	// 	default: () => [],
	// },
	// 按钮
	btnConfig: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	topBtnConfig: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	// 单元格样式
	cellStyle: {
		type: Function,
		default: () => {
			return Function;
		},
	},
	// 合并单元格
	objectSpanMethod: {
		type: Function,
		default: () => {
			return Function;
		},
	},
	indexMethod: {
		type: Function,
	},
	expandedRowKeys: {
		type: Array,
		default: () => [],
	},
});

// 定义子组件向父组件传值/事件
const emit = defineEmits([
	'delRow',
	'pageChange',
	'sortHeader',
	'importTable',
	'importTableData',
	'onOpenOtherDialog',
	'cellclick',
	'openAdd',
	'openImp',
	'addrow',
	'querysearchasync',
	'handleselect',
	'handlechange',
	'changeselect',
	'inputData',
	'inputBlur',
	'changeData',
	'handleNumberInputChange',
	'handlestatus1Change',
	'handleNumberInputBlur',
	'onOpentopBtnOther',
	'remoteMethod',
	'rowClick',
	'toggleRowExpansion',
	'handleCurrentChange',
	'selectFocus',
	'selectBlur',
]);
// 下拉框獲取焦點時
const selectFocus = (scope: EmptyObjectType) => {
	emit('selectFocus', scope);
};
// 下拉框失去焦點
const selectBlur = (scope: EmptyObjectType) => {
	emit('selectBlur', scope);
};
// 點擊單元格一行
const rowClick = (row: Object, column: Object) => {
	emit('rowClick', row, column);
};
const toggleRowExpansion = (row: any, column: Object, expanded: any) => {
	emit('toggleRowExpansion', row, column);
};
const remoteMethod = (index: number, query: string, item: EmptyObjectType) => {
	emit('remoteMethod', index, query, item);
};
const handleCurrentChange = (val: any) => {
	emit('handleCurrentChange', val);
	// currentRow.value = val;
};
// 表格行样式
const tableRowClassName = (scope: EmptyObjectType) => {
	// if (scope.row.isReceivable === false) {
	// 	return 'disabled-row';
	// }
};
// 自动补全输入框
const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
	emit('querysearchasync', queryString, cb);
};
const handleNumberInputChange = (value: number, index: number) => {
	emit('handleNumberInputChange', value, index);
};
// 状态改变
const handlestatus1Change = (value: number, index: number, key: string) => {
	emit('handlestatus1Change', value, index, key);
};

const handleNumberInputBlur = (value: number, index: number) => {
	emit('handleNumberInputBlur', value, index);
};
const changeData = (index: number) => {
	emit('handlechange', index);
};
const handleSelect = (index: number, item: Object) => {
	emit('handleselect', index, item);
};
const changeSelect = (index: number, item: Object) => {
	emit('changeselect', index, item);
};
// 解决翻页组件开始输入中文按enter键之后光标不居中问题
onMounted(() => {
	if (pagination.value) {
		pagination.value.$el.querySelector('input[type=number]').oninput = (e: any) => {
			if (e.data === '' && e.target.value === '') {
				e.target.value = '0';
				setTimeout(() => {
					e.target.value = '';
				}, 0);
			}
		};
	}
});
// 打开新增弹窗
const onOpenAdd = (type: string) => {
	emit('openAdd', type);
};
// 打开其他弹窗
const onOpentopBtnOther = (type: string) => {
	emit('onOpentopBtnOther', state.selectlist, type);
};
// 打开修改弹窗
const onOpenEdit = (type: string, row: Object, scope: EmptyArrayType) => {
	emit('openAdd', type, row, scope);
};
// 打开送样(其他)弹窗
const onOpenOther = (scope: EmptyObjectType, type: string) => {
	emit('onOpenOtherDialog', scope, type);
};
// 打开导入弹窗
const onImportTable = (type: string) => {
	emit('openAdd', type);
	// roleDialogRef.value.openDialog(type);
};

// 定义变量内容
const { t } = useI18n();
const toolSetRef = ref();
const roleDialogRef = ref();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const state = reactive({
	page: {
		pageNum: 1,
		pageSize: 10,
	},
	selectlist: [] as EmptyObjectType[],
	checkListAll: true,
	checkListIndeterminate: false,
});

// 设置边框显示/隐藏
const setBorder = computed(() => {
	return props.config.isBorder ? true : false;
});
// 获取父组件 配置项（必传）
const getConfig = computed(() => {
	return props.config;
});
// 设置 tool header 数据
const setHeader = computed(() => {
	return props.header.filter((v) => v.isCheck);
});
// tool 列显示全选改变时
const onCheckAllChange = <T>(val: T) => {
	if (val) props.header.forEach((v) => (v.isCheck = true));
	else props.header.forEach((v) => (v.isCheck = false));
	state.checkListIndeterminate = false;
};
// tool 列显示当前项改变时
const onCheckChange = () => {
	const headers = props.header.filter((v) => v.isCheck).length;
	state.checkListAll = headers === props.header.length;
	state.checkListIndeterminate = headers > 0 && headers < props.header.length;
};
//为行设置独有key
const selRowKey = (row: EmptyObjectType) => {
	if (!props.config.isSelection && !props.config.expand) return;
	return row.linecode || row.runid || row.publishId || row.matNo || row.reqNo || row.repairNo || row.idleno || row.uselessno || ' ';
};
// 表格多选改变时，用于导出和删除
const onSelectionChange = (val: EmptyObjectType[]) => {
	state.selectlist = val;
};
// 点击单元格触发row, column
const cellClick = (row: Object, column: Object) => {
	emit('cellclick', row, column);
};
// 點擊鏈接
const clickLink = (data: string) => {
	window.open(data);
};
// 删除当前项
const onDelRow = (row: EmptyObjectType, index?: number) => {
	ElMessageBox.confirm(t('message.hint.suredel'), t('message.hint.tips'), {
		confirmButtonText: t('message.allButton.ok'),
		cancelButtonText: t('message.allButton.cancel'),
		type: 'warning',
		draggable: true,
		closeOnClickModal: false,
	})
		.then(async () => {
			emit('delRow', row, index, 'delRow');
		})
		.catch(() => {});
};
// 批量删除
const onBulkDeletion = () => {
	emit('delRow', state.selectlist, 'bulkDel');
};
// 分页改变
const onHandleSizeChange = (val: number) => {
	state.page.pageSize = val;
	emit('pageChange', state.page);
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.page.pageNum = val;
	emit('pageChange', state.page);
};
// 搜索时，分页还原成默认
const pageReset = () => {
	state.page.pageNum = 1;
	state.page.pageSize = 10;
	emit('pageChange', state.page);
};
// 清空用户选择的表格行
const clearSelection = () => {
	tableRef.value.clearSelection();
};
// 增加表格行到最后一行的时候滚动条随之到末尾
const setScrollTop = () => {
	tableRef.value.$refs.bodyWrapper.getElementsByClassName('el-scrollbar__wrap')[0].scrollTop =
		tableRef.value.$refs.bodyWrapper.getElementsByClassName('el-scrollbar__wrap')[0].scrollHeight;
};
// 打印
const onPrintTable = () => {
	// https://printjs.crabbly.com/#documentation
	// 自定义打印
	let tableTh = '';
	let tableTrTd = '';
	let tableTd: any = {};
	// 表头
	props.header.forEach((v) => {
		tableTh += `<th class="table-th">${v.title}</th>`;
	});
	// 表格内容
	props.data.forEach((val, key) => {
		if (!tableTd[key]) tableTd[key] = [];
		props.header.forEach((v) => {
			if (v.type === 'text') {
				tableTd[key].push(`<td class="table-th table-center">${val[v.key]}</td>`);
			} else if (v.type === 'uploadImage') {
				tableTd[key].push(`<td class="table-th table-center"><img src="${val[v.key]}" style="width:${v.width}px;height:${v.height}px;"/></td>`);
			}
		});
		tableTrTd += `<tr>${tableTd[key].join('')}</tr>`;
	});
	// 打印
	printJs({
		printable: `<div style=display:flex;flex-direction:column;text-align:center><h3>${props.printName}</h3></div><table border=1 cellspacing=0><tr>${tableTh}${tableTrTd}</table>`,
		type: 'raw-html',
		css: ['//at.alicdn.com/t/c/font_2298093_rnp72ifj3ba.css', '//unpkg.com/element-plus/dist/index.css'],
		style: `@media print{.mb15{margin-bottom:15px;}.el-button--small i.iconfont{font-size: 12px !important;margin-right: 5px;}}; .table-th{word-break: break-all;white-space: pre-wrap;}.table-center{text-align: center;}`,
	});
};
// 导出
const onExportTable = () => {
	// if (state.selectlist.length <= 0) return ElMessage.warning('請先選擇要導出的數據');
	props.header.forEach((item) => {
		item.title = t(item.title);
	});
	emit('importTable', state.selectlist);
};

// 导入表格
const onimportTableData = (raw: EmptyObjectType) => {
	emit('importTableData', raw);
};

// 刷新
const onRefreshTable = () => {
	emit('pageChange', state.page);
};
// 设置
const onSetTable = () => {
	nextTick(() => {
		const sortable = Sortable.create(toolSetRef.value, {
			handle: '.handle',
			dataIdAttr: 'data-key',
			animation: 150,
			onEnd: () => {
				const headerList: EmptyObjectType[] = [];
				sortable.toArray().forEach((val: string) => {
					props.header.forEach((v) => {
						if (v.key === val) headerList.push({ ...v });
					});
				});
				emit('sortHeader', headerList);
			},
		});
	});
};
// 行内编辑增加行
const onAddRow = () => {
	emit('addrow');
};

const changedata = (index: number, key: string) => {
	emit('changeData', index, key);
};
const inputdata = (val: string) => {
	emit('inputData', val);
};
const inputBlur = (index: number) => {
	emit('inputBlur', index);
};
// 暴露变量
defineExpose({
	pageReset,
	clearSelection,
	setScrollTop,
});
</script>

<style scoped lang="scss">
.table-container {
	display: flex;
	flex-direction: column;
	.el-table {
		flex: 1;
	}
	.table-top {
		display: flex;
		.table-top-tool {
			flex: 1;
			display: flex;
			align-items: end;
			justify-content: flex-end;
			i {
				margin-right: 10px;
				cursor: pointer;
				color: var(--el-text-color-regular);
				&:last-of-type {
					margin-right: 0;
				}
			}
		}
	}
	.button {
		// width: 80px;
		height: 32px;
	}

	.footer {
		display: flex;
	}
	.pages {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
	:deep(.el-table th.el-table__cell) {
		background-color: var(--el-color-primary-light-9);
		color: var(--el-text-color-primary);
	}
}
:deep(.disabled-row) {
	color: #ccc !important;
	pointer-events: none !important;
	cursor: not-allowed !important;
}
:deep(.el-form-item__content) {
	display: flex;
	justify-content: center;
}
</style>
