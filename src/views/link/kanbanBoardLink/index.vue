<template>
	<div :class="{ 'kanban-board': route.name === 'kanbanBoardLink' }" style="height: 100%">
		<TableSearch
			style="padding: 15px"
			ref="tableSearchRef"
			:search="search"
			@search="onSearch"
			:searchConfig="{ isSearchBtn: true }"
			@remoteMethod="remoteMethod"
			@selectChange="selectChange"
		>
			<template #optionSearchFat="{ row, value }">
				<div v-if="value.prop === 'projectId'">
					<span style="float: left">{{ t('message.pages.projectName') }}：{{ row.text }}</span>
					<span style="float: right; color: var(--el-text-color-secondary)">{{ t('message.pages.productionlinetype') }}：{{ row.label }}</span>
				</div>
			</template>
		</TableSearch>
		<dv-border-box-10 class="dvborderbox10">
			<div style="padding: 20px; height: 98%; overflow: overlay">
				<el-row v-if="machineData.length > 0" v-loading="loading" :gutter="20">
					<el-col v-for="(item, index) in machineData" :key="index" :span="4">
						<div class="grid-content ep-bg-purple board">
							<dv-border-box-13>
								<div class="outside">
									<div class="board-content">
										<div class="line-text">
											<span>{{ item.line }}</span>
										</div>
										<div>
											<!-- <span class="text-label"> 站位名稱：</span> -->
											<span class="text" :class="[route.name === 'kanbanBoardLink' ? 'text-color-link' : 'text-color']">{{ item.stationname }}</span>
										</div>

										<div>
											<!-- <span class="text-label">機臺號：</span> -->
											<span class="text" :class="[route.name === 'kanbanBoardLink' ? 'text-color-link' : 'text-color']">{{ item.machineno }}</span>
										</div>
										<div>
											<!-- <span class="text-label">版本號：</span> -->
											<span style="word-break: break-all; font-size: 20px; color: rgba(70, 227, 99, 1); margin-left: 20px">
												{{ item.version }}
											</span>
										</div>
									</div>
								</div>
							</dv-border-box-13>
						</div>
					</el-col>
				</el-row>
				<el-empty v-else style="height: 98%" :image-size="250" :description="t('message.hint.nodata')" />
			</div>
		</dv-border-box-10>
	</div>
</template>

<script setup lang="ts" name="kanbanBoardLink">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { postPublishQueryMachineCurrentProApi } from '/@/api/link/kanbanBoardLink';
import { getProjectQueryNoPageApi } from '/@/api/programManagement/programRelease';
import { getProjectLineApi } from '../../../api/link/kanbanBoardLink';
const route = useRoute();
const { t } = useI18n();
const TableSearch = defineAsyncComponent(() => import('/@/components/search/search.vue'));
let search = ref([
	{
		label: 'message.pages.projectName',
		prop: 'projectId',
		required: false,
		type: 'select',
		placeholder: 'message.pages.pleaseEnteraSelectProjectName',
		options: [],
		loading: false,
		filterable: true,
		remote: true,
		remoteShowSuffix: true,
	},
	{ label: 'message.pages.line', placeholder: '', prop: 'lineCode', required: false, type: 'select', options: [] },
]);
const form = ref({});
const loading = ref(false);
let machineData: EmptyObjectType = ref([]);
// 切換下拉框
const selectChange = async (vals: string, prop: string, form: EmptyObjectType) => {
	if (prop === 'projectId') {
		if (!vals) {
			search.value[1].options = [];
			return;
		}

		form.lineCode = '';
		const res = await getProjectLineApi(vals);
		search.value[1].options = res.data.map((item: EmptyObjectType) => {
			return { value: `${item.linecode}`, label: `${item.line}`, text: `${item.line}`, selected: false };
		});
	}
};
let options: EmptyArrayType = [];
// 專案名稱下拉
const remoteMethod = (query: string, form: EmptyObjectType) => {
	if (query) {
		// 專案下拉
		search.value[0].loading = true;
		setTimeout(async () => {
			const res = await getProjectQueryNoPageApi(query);
			search.value[0].loading = false;
			options = res.data.map((item: EmptyObjectType) => {
				return { value: `${item.runid}`, label: `${item.productionlinetype}`, text: `${item.projectname}`, selected: false };
			});
			search.value[0].options = options as never;
			const runids: EmptyArrayType = [];
			res.data.forEach((item: any) => {
				runids.push(item.projectname);
			});
			if (res.data.length === 1 && runids.includes(query) && query === res.data[0].projectname) {
				form.projectId = res.data[0].runid;
				selectChange(form.projectId, 'projectId', form);
			}
		}, 500);
	}
};
// 專案名稱下拉
const getSelect = async () => {
	const res = await getProjectQueryNoPageApi();
	let selectOption = res.data.map((item: any) => {
		return {
			value: item.runid,
			label: item.productionlinetype,
			text: item.projectname,
		};
	});
	search.value[0].options = selectOption;
};
// 搜索点击时表单回调
const onSearch = (data: EmptyObjectType) => {
	form.value = Object.assign({}, form.value, { ...data });
	getData();
};
const getData = async () => {
	loading.value = true;
	const res = await postPublishQueryMachineCurrentProApi(form.value);
	machineData.value = res.data;
	loading.value = false;
};
// 页面加载时
onMounted(() => {
	getData();
	getSelect();
});
</script>

<style scoped lang="scss">
.kanban-board {
	background-color: #020308 !important;
	padding: 20px;
}
:deep(.el-form-item__label) {
	color: #fff !important;
}
.el-row {
	margin-bottom: 20px;
}
.el-row:last-child {
	margin-bottom: 0;
}
.el-col {
	margin-bottom: 20px;
}

.grid-content {
	border-radius: 4px;
	min-height: 36px;
}
.board {
	width: 100%;
	height: 200px;
	// opacity: 1;
	// border-radius: 25px;
	// background: linear-gradient(135.67deg, rgba(255, 255, 255, 0.2) 0%, rgba(196, 228, 255, 0.2) 100%);
	// box-shadow: 0px 2px 4px rgba(140, 146, 255, 0.25);
}
.outside {
	padding: 15px;
	height: 100%;
}
.board-content {
	overflow: overlay;
	height: 100%;
	width: 100%;
	// text-align: center;
}
.board-content div {
	word-break: break-all;
	margin-top: 13px;
}
.text-label {
	text-align: right;
	display: inline-block;
	width: 70px;
	color: #fff;
}
.line-text {
	height: 30px;
	// width: 30%;
	// display: flex;
	// justify-content: center;
	// align-items: center;
}
.line-text span {
	background: rgba(217, 226, 255, 1);
	padding: 5px 10px;
	border-radius: 141px;
	font-size: 14px;
	font-weight: 700;
	color: rgba(55, 102, 244, 1);
}
.text-color-link {
	color: #fff;
}
.text-color {
	color: rgba(55, 102, 244, 1);
}
.text {
	font-size: 18px;
	font-weight: 700;
	margin-left: 20px;
}
.dvborderbox10 {
	height: 92.5%;
	// overflow: overlay;
}
</style>
