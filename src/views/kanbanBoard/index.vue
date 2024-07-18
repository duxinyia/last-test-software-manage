<!-- <template>
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
</style> -->
<template>
	<div class="layout-padding layout-link-container">
		<div class="layout-padding-auto layout-padding-view">
			<div class="layout-link-warp">
				<!-- <img :src="logoMini" class="layout-logo-medium-img" /> -->
				<el-icon class="layout-link-icon"><ele-Sunny /></el-icon>
				<!-- <i class="layout-link-icon iconfont icon-xingqiu"></i> -->
				<div class="layout-link-msg">{{ $t('message.hint.page') }} "{{ $t(state.titleEn) }}" {{ $t('message.hint.openedInAnewWindow') }}</div>
				<el-button class="mt30" round size="default" @click="onGotoFullPage">
					<i class="iconfont icon-lianjie"></i>
					<span>{{ $t('message.hint.goExperienceNow') }}</span>
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="kanbanBoard">
import { reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { verifyUrl } from '/@/utils/toolsValidate';
import logoMini from '/@/assets/images/new_logo.png';

// 定义变量内容
const route = useRoute();
const state = reactive<LinkViewState>({
	title: '',
	isLink: '',
	titleEn: '',
});

// 立即前往
const onGotoFullPage = () => {
	const { origin, pathname } = window.location;
	if (state?.isLink) {
		window.open(state?.isLink);
	}
	// if (verifyUrl(<string>state.isLink)) window.open(state.isLink);
	// else window.open(`${origin}${pathname}#${state.isLink}`);
};
// 监听路由的变化，设置内容
watch(
	() => route.path,
	() => {
		state.title = <string>route.meta.title;
		state.isLink = <string>route.meta.isLink;
		state.titleEn = <string>route.meta.titleEn;
	},
	{
		immediate: true,
	}
);
</script>

<style scoped lang="scss">
.layout-link-container {
	.layout-padding-auto {
		// background-color: #ccc;
	}

	.layout-link-warp {
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		i.layout-link-icon {
			position: relative;
			font-size: 100px;
			color: var(--el-color-primary);
			&::after {
				content: '';
				position: absolute;
				left: 50px;
				top: 0;
				width: 15px;
				height: 100px;
				background: linear-gradient(
					rgba(255, 255, 255, 0.01),
					rgba(255, 255, 255, 0.01),
					rgba(255, 255, 255, 0.01),
					rgba(255, 255, 255, 0.05),
					rgba(255, 255, 255, 0.05),
					rgba(255, 255, 255, 0.05),
					rgba(235, 255, 255, 0.5),
					rgba(255, 255, 255, 0.05),
					rgba(255, 255, 255, 0.05),
					rgba(255, 255, 255, 0.05),
					rgba(255, 255, 255, 0.01),
					rgba(255, 255, 255, 0.01),
					rgba(255, 255, 255, 0.01)
				);
				transform: rotate(-15deg);
				animation: toRight 5s linear infinite;
			}
		}
		.layout-link-msg {
			font-size: 12px;
			color: #000;
			opacity: 0.7;
			margin-top: 15px;
		}
	}
}
</style>
