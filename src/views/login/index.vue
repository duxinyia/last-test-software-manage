<template>
	<div class="main-login">
		<div class="login-container"></div>

		<!-- 公司logo -->
		<div class="login-top">
			<div class="login-top-logo">
				<img :src="logoMini" />
			</div>
		</div>
		<!-- 字體 -->
		<div class="login-right-warp-main-title">
			{{ $t(getThemeConfig.globalTitle) }}
		</div>
		<div class="fly bg-fly-circle1"></div>
		<div class="fly bg-fly-circle2"></div>
		<div class="fly bg-fly-circle3"></div>
		<div class="fly bg-fly-circle4"></div>
		<div class="login-light"></div>
		<div class="login-bottom">
			<div class="login-right-warp flex-margin">
				<div class="login-right-warp-mian">
					<div class="login-right-warp-main-form">
						<div>
							<Account />
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 底部描述框 -->
		<transition
			appear
			mode="out-in"
			:duration="1000"
			enter-active-class="animate__animated animate__backInUp"
			leave-active-class="animate__animated animate__fadeOutRight"
		>
			<div class="copyright-info">
				<div class="copyright">
					<el-icon class="icon"><ele-CollectionTag /></el-icon>
					Copyright © 2023. Foxconn All rights reserved
				</div>
				<div class="author-info">
					<div>
						<span class="author">
							<el-icon class="icon"><ele-UserFilled /></el-icon>劉進/37500
						</span>
						<span class="mail">
							<el-icon class="icon"><ele-Message /></el-icon>rein.j.liu@mail.foxconn.com
						</span>
						&nbsp;&nbsp;
						<span class="author">
							<el-icon class="icon"><ele-UserFilled /></el-icon>杜欣怡/82585
						</span>
						<span class="mail">
							<el-icon class="icon"><ele-Message /></el-icon>wwlh-mis-feweb@mail.foxconn.com
						</span>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { defineAsyncComponent, onMounted, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { NextLoading } from '/@/utils/loading';
import logoMini from '/@/assets/images/new_logo.png';

import { useI18n } from 'vue-i18n';
// 引入组件
const Account = defineAsyncComponent(() => import('/@/views/login/component/account.vue'));

// 定义变量内容
const { t } = useI18n();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const state = reactive({
	tabsActiveName: 'account',
	isScan: false,
});

// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});
// 页面加载时
onMounted(() => {
	NextLoading.done();
});
</script>

<style scoped lang="scss">
.main-login {
	width: 100%;
	height: 100%;
}
.login-container {
	height: 100%;
	background: url('../../assets/images/login-page.png') no-repeat center;
	position: relative;
	// background-size: 100% 100%;
}
.login-top {
	height: 120px;
	margin-right: 100px;
	.login-top-logo {
		position: absolute;
		top: 30px;
		left: 47px;
		z-index: 1;
		animation: logoAnimation 0.3s ease;
		img {
			width: 175px;
			height: 45px;
		}
	}

	.login-left-waves {
		position: absolute;
		top: 0;
		right: -100px;
	}
}
.login-light {
	position: absolute;
	top: 183px;
	left: 50%;
	width: 548px;
	height: 2px;
	margin-left: -240px;
	background: linear-gradient(244deg, rgba(255, 255, 255, 0) 0%, rgba(41, 209, 253) 50%, rgba(255, 255, 255, 0) 100%);
}
.login-right-warp-main-title {
	position: absolute;
	top: 57px;
	left: 50%;
	margin-left: -264px;
	color: #fff;
	height: 130px;
	line-height: 130px;
	font-size: 60px;
	text-align: center;
	// letter-spacing: 3px;
	animation: logoAnimation 0.3s ease;
	animation-delay: 0.3s;
	// color: var(--el-text-color-primary);
	// 	&::after {
	// 		content: '';
	// 		width: 250px;
	// 		position: absolute;
	// 		bottom: -15px;
	// 		left: 50%;
	// 		transform: translateX(-50%);
	// 		border: 1px transparent solid;
}
.login-bottom {
	position: absolute;
	top: 49%;
	left: 52%;
	transform: translate(-50%, -50%);
	.login-bottom-img {
		// position: absolute;
		// top: 50%;
		// left: 50%;
		// transform: translate(-50%, -50%);
		width: 50%;
		// height: 52%;
		img {
			width: 100%;
			height: 100%;
			animation: error-num 0.6s ease;
		}
	}
	.login-right-warp {
		// border: 1px solid var(--el-color-primary-light-3);
		border-radius: 3px;
		width: 470px;
		height: 468px;
		position: relative;
		margin-top: 10%;
		overflow: hidden;
		background-color: #e8f2fd;
		.login-right-warp-mian {
			display: flex;
			flex-direction: column;
			height: 100%;

			.login-right-warp-main-form {
				flex: 1;
				padding: 0 50px 50px;
				.login-content-main-sacn {
					position: absolute;
					top: 0;
					right: 0;
					width: 50px;
					height: 50px;
					overflow: hidden;
					cursor: pointer;
					transition: all ease 0.3s;
					color: var(--el-color-primary);
					&-delta {
						position: absolute;
						width: 35px;
						height: 70px;
						z-index: 2;
						top: 2px;
						right: 21px;
						background: var(--el-color-white);
						transform: rotate(-45deg);
					}
					&:hover {
						opacity: 1;
						transition: all ease 0.3s;
						color: var(--el-color-primary) !important;
					}
					i {
						width: 47px;
						height: 50px;
						display: inline-block;
						font-size: 48px;
						position: absolute;
						right: 1px;
						top: 0px;
					}
				}
			}
		}
	}
}
.copyright-info {
	position: fixed;
	width: 100%;
	bottom: 2.6042vw;
	font-size: 14px;
	margin: auto;
	text-align: center;
	color: var(--next-color-white);
	.copyright {
		.location {
			margin-left: 10px;
			cursor: pointer;
			color: yellow;
		}
	}
	.icon {
		margin-right: 4px;
		vertical-align: middle;
	}
	.author-info {
		margin-top: 2px;
		.author {
			margin-right: 10px;
		}
	}
}
.fly {
	pointer-events: none;
	position: absolute;
	z-index: 9999;
}
.bg-fly-circle1 {
	left: 40px;
	top: 100px;
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background: linear-gradient(to right, rgb(196, 224, 250) 0%, rgba(rgb(196, 224, 250), 0.04) 100%);
	animation: move 2.5s linear infinite;
}

.bg-fly-circle2 {
	left: 15%;
	bottom: 5%;
	width: 150px;
	height: 150px;
	border-radius: 50%;
	background: linear-gradient(to right, rgb(196, 224, 250) 0%, rgba(rgb(196, 224, 250), 0.04) 100%);
	animation: move 3s linear infinite;
}

.bg-fly-circle3 {
	right: 20%;
	top: 140px;
	width: 145px;
	height: 145px;
	border-radius: 50%;
	background: linear-gradient(to right, rgb(196, 224, 250) 0%, rgba(rgb(196, 224, 250), 0.04) 100%);
	animation: move 2.5s linear infinite;
}

.bg-fly-circle4 {
	right: 5%;
	top: 60%;
	width: 160px;
	height: 160px;
	border-radius: 50%;
	background: linear-gradient(to right, rgb(196, 224, 250) 0%, rgba(rgb(196, 224, 250), 0.04) 100%);
	animation: move 3.5s linear infinite;
}

@keyframes move {
	0% {
		transform: translateY(0px) scale(1);
	}

	50% {
		transform: translateY(25px) scale(1.1);
	}

	100% {
		transform: translateY(0px) scale(1);
	}
}
</style>
