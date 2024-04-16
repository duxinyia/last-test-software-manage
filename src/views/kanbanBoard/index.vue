<template>
	<div class="table-container layout-padding">
		<div class="layout-padding-view layout-padding-auto">
			<kanbanBoardLink />
		</div>
	</div>
</template>

<script setup lang="ts" name="kanbanBoard">
import { defineAsyncComponent, reactive, ref, onMounted, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
// 引入组件
const kanbanBoardLink = defineAsyncComponent(() => import('/@/views/link/kanbanBoardLink/index.vue'));

// 页面加载时
onMounted(() => {});
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
:deep(.el-form-item__label-wrap .el-form-item__label) {
	color: var(--el-text-color-regular) !important;
}
:deep(.board-content .text-label) {
	color: #000 !important;
}
</style>
