<template>
	<div class="table-search-container" v-if="props.search.length > 0">
		<!-- label-width="auto" -->

		<el-form :label-width="labelWidth" ref="tableSearchRef" :model="state.form" size="default" class="table-form">
			<el-row>
				<el-col
					:xs="val.xs || 24"
					:sm="val.sm || 12"
					:md="val.md || 8"
					:lg="val.lg || 4"
					:xl="val.xl || 4"
					class="mr15 isMargin"
					:class="{ isMoreSearch: search.length >= 6 }"
					v-for="(val, key) in search"
					:key="key"
					v-show="key === 0 || state.isToggle"
				>
					<el-form-item
						v-if="val.type !== ''"
						:label="$t(val.label)"
						:prop="val.prop"
						:rules="[{ required: val.required, message: `${val.label}不能為空`, trigger: val.type === 'input' ? 'blur' : 'change' }]"
					>
						<el-input
							:maxlength="val.maxlength"
							v-model="state.form[val.prop]"
							:placeholder="`${$t('message.pages.pleaseEnter')} ${$t(val.label)}`"
							clearable
							v-if="val.type === 'input'"
							style="width: 100%"
						/>
						<el-date-picker
							v-model="state.form[val.prop]"
							type="date"
							:placeholder="val.placeholder"
							v-else-if="val.type === 'date'"
							style="width: 100%"
						/>
						<el-date-picker
							v-else-if="val.type === 'dateRange'"
							value-format="YYYY-MM-DD"
							v-model="state.form[val.prop]"
							type="daterange"
							range-separator="-"
							:start-placeholder="$t('message.pages.startDate')"
							:end-placeholder="$t('message.pages.endDate')"
							style="width: 100%"
						/>
						<el-select
							v-model="state.form[val.prop]"
							:placeholder="$t(val.placeholder!) || `${$t('message.pages.pleaseSelect')} ${$t(val.label)}`"
							v-else-if="val.type === 'select'"
							style="width: 100%"
							@change="(vals:any) => selectHandelChange(vals,val.prop)"
							:clearable="!val.clearable"
							:filterable="val.filterable"
							:remote="val.remote"
							:remote-show-suffix="val.remoteShowSuffix"
							:remote-method="(vals:any) => remoteMethod(vals,val.prop)"
							:loading="val.loading"
							:multiple="val.multiple"
							:max-collapse-tags="val.maxCollapseTags"
							:collapse-tags="val.collapseTags"
							:collapse-tags-tooltip="val.collapseTagsTooltip"
						>
							<el-option v-for="item in val.options" :key="item.label" :label="item.text" :value="item.value">
								<slot name="optionSearchFat" :row="item" :value="val"></slot>
							</el-option>
						</el-select>
						<!-- 状态 -->
						<el-switch
							v-else-if="val.type === 'status'"
							v-model="state.form[val.prop]"
							:active-value="1"
							:inactive-value="0"
							validate-event
							inline-prompt
							:active-text="$t('message.allButton.statusY')"
							:inactive-text="$t('message.allButton.statusN')"
						></el-switch>
						<span v-else style="width: 100%; font-weight: 700; color: #1890ff">
							{{ state.form[val.prop] }}
						</span>
					</el-form-item>
				</el-col>
				<el-col :xs="24" :sm="12" :md="8" :lg="2" :xl="2">
					<el-form-item class="table-form-btn" :label-width="search.length < 6 ? '20px' : '100px'">
						<template #label v-if="search.length >= 6">
							<div class="table-form-btn-toggle ml10" @click="state.isToggle = !state.isToggle">
								<span>{{ state.isToggle ? $t('message.pages.receivingFilter') : $t('message.pages.expansionScreening') }}</span>
								<SvgIcon :name="state.isToggle ? 'ele-ArrowUp' : 'ele-ArrowDown'" />
							</div>
						</template>
						<div>
							<el-button v-if="searchConfig.isSearchBtn" size="default" type="primary" @click="onSearch(tableSearchRef)"
								><el-icon class="mr5"> <ele-Search /> </el-icon>{{ $t('message.allButton.searchBtn') }}
							</el-button>
							<!-- <el-button size="default" type="info" class="ml10" @click="onReset(tableSearchRef)"
								><el-icon><ele-RefreshLeft /></el-icon> {{ $t('message.allButton.resetBtn') }}
							</el-button> -->
						</div>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script setup lang="ts" name="makeTableDemoSearch">
import { reactive, ref, onMounted, nextTick } from 'vue';
import type { FormInstance } from 'element-plus';
import { useI18n } from 'vue-i18n';

// 定义父组件传过来的值
const props = defineProps({
	// 搜索表单
	search: {
		type: Array<TableSearchType>,
		default: () => [],
	},
	// 表单配置
	searchConfig: {
		type: Object,
		default: () => {},
	},
	labelWidth: {
		type: String,
		default: () => 'auto',
	},
});

// 定义子组件向父组件传值/事件
const emit = defineEmits(['search', 'remoteMethod', 'selectChange']);

// 定义变量内容
const { t } = useI18n();
const tableSearchRef = ref<FormInstance>();
const state = reactive<searchState>({
	form: {},
	isToggle: true,
});

// 查询
const onSearch = (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	formEl.validate((valid: boolean) => {
		if (valid) {
			emit('search', state.form);
		} else {
			return false;
		}
	});
};
// 下拉框数据变化
const selectHandelChange = (vals: string, prop: string) => {
	emit('selectChange', vals, prop, state.form);
};
// 能搜索的下拉框
const remoteMethod = (query: string, prop?: string) => {
	emit('remoteMethod', query, state.form, prop);
};
// 重置
const onReset = (formEl: FormInstance | undefined) => {
	// if (!formEl) return;
	nextTick(() => {
		tableSearchRef.value?.resetFields();
	});
	// emit('search', state.form);
};
// 初始化 form 字段，取自父组件 search.prop
const initFormField = () => {
	if (props.search.length <= 0) return false;
	props.search.forEach((v) => {
		if (v.type === 'select' && v.options && v.options?.length > 0) {
			v.options?.forEach((item) => {
				if (item.selected) {
					state.form[v.prop] = item.value;
				}
			});
			// emit('search', state.form);
		} else {
			// state.form[v.prop] = '';
		}
	});
};
// 页面加载时
onMounted(() => {
	initFormField();
});
// 暴露变量
defineExpose({
	initFormField,
	onReset,
});
</script>

<style scoped lang="scss">
.table-search-container {
	display: flex;
	.table-form {
		flex: 1;
		.table-form-btn-toggle {
			white-space: nowrap;
			user-select: none;
			display: flex;
			align-items: center;
			color: var(--el-color-primary);
		}
	}
}

/* 页面宽度小于1200px
------------------------------- */
@media screen and (max-width: 1200px) {
	.isMargin {
		margin-bottom: 10px;
	}
}
.isMoreSearch {
	margin-bottom: 10px;
}
</style>
