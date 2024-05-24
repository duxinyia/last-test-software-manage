<template>
	<div class="title">用戶登錄</div>
	<el-form ref="ruleFormRef" size="large" class="login-content-form" :model="state.ruleForm">
		<el-form-item class="login-animation1" prop="userName" :rules="[{ required: true, message: $t('message.account.worknoEmpty') }]">
			<el-input text :placeholder="$t('message.account.accountPlaceholder1')" v-model="state.ruleForm.userName" clearable autocomplete="off">
				<template #prefix>
					<el-icon class="el-input__icon" color="#9EACF2" :size="20"><ele-Avatar /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2" prop="password" :rules="[{ required: true, message: $t('message.account.passwordEmpty') }]">
			<el-input
				:type="state.isShowPassword ? 'text' : 'password'"
				:placeholder="$t('message.account.accountPlaceholder2')"
				v-model="state.ruleForm.password"
				autocomplete="off"
			>
				<template #prefix>
					<SvgIcon class="svgIcon" :size="13" color="#9EACF2" :name="'icon-Unlock'" />
					<!-- <el-icon class="el-input__icon" :size="20"><ele-Unlock /></el-icon> -->
				</template>
				<template #suffix>
					<el-icon @click="state.isShowPassword = !state.isShowPassword" class="login-content-password">
						<ele-Hide v-if="state.isShowPassword" />
						<ele-View v-else />
					</el-icon>
					<!-- <i
						class="iconfont el-input__icon login-content-password"
						:class="state.isShowPassword ? 'icon-yincangmima' : 'icon-xianshimima'"
						@click="state.isShowPassword = !state.isShowPassword"
					>
					</i> -->
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation3">
			<!-- 记住密码和忘记密码 -->
			<div class="pwd-container">
				<el-checkbox>{{ $t('message.account.remember') }}</el-checkbox>
				<span class="forpwd" @click="forgetPwd">{{ $t('message.account.forget') }}</span>
			</div>
		</el-form-item>
		<el-form-item class="login-animation4">
			<el-button
				type="primary"
				class="login-content-submit"
				v-waves
				@keyup.enter.native="enterdown"
				@click="onSignIn(ruleFormRef)"
				:loading="state.loading.signIn"
			>
				<span>{{ state.loading.signIn ? $t('message.account.login') : $t('message.account.accountBtnText') }}</span>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts" name="loginAccount">
import { reactive, computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import Cookies from 'js-cookie';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session, Local } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import { useLoginApi, useLogin } from '/@/api/login/index';
import { encryptData, decryptData } from '/@/utils/aes';
import JSEncrypt from 'jsencrypt'; //引入模块
import { log } from 'util';
// 定义变量内容
const { t } = useI18n();
const storesThemeConfig = useThemeConfig();
const ruleFormRef = ref();
const { themeConfig } = storeToRefs(storesThemeConfig);
const route = useRoute();
const router = useRouter();
const state = reactive({
	isShowPassword: false,
	ruleForm: {
		// userName: 'G1656790',
		// password: 'MISAdmin',
		userName: '',
		password: '',
	},
	loading: {
		signIn: false,
	},
});

// 时间获取
const currentTime = computed(() => {
	return formatAxis(new Date());
});
// 忘记密码：跳转到修改密码系统
const forgetPwd = () => {
	window.open('http://10.151.128.172:8089/Login/Repassword');
};
// 登录
const onSignIn = (formEl: EmptyObjectType | undefined) => {
	if (!formEl) return;
	const { ruleForm } = state;
	formEl.validate(async (valid: boolean) => {
		if (valid) {
			try {
				state.loading.signIn = true;
				let paw = ruleForm.password.trim();
				// 加密密码
				// let datapw = encryptData(paw);
				let datapw = paw;
				const res = await useLoginApi(ruleForm.userName.trim(), datapw);
				// 存储 token 到浏览器缓存
				if (res.status) {
					Session.set('token', res.data.token);
					Session.set('isSign', res.data.isSign);
					Cookies.set('userPassword', datapw);
					Cookies.set('userName', res.data.userName);
					Cookies.set('userId', res.data.userId);
					// Local.set('datas', res.data.datas);
					// let home: string[] = [];
					// res.data.datas.unshift({
					// 	alwaysShow: 'true',
					// 	path: '/home',
					// 	name: 'home',
					// 	component: 'home',
					// 	redirect: 'noRedirect',
					// 	meta: { title: '專案配置', titleEn: '專案配置', isAffix: true, icon: 'home' },
					// });

					// 添加是否缓存组件状态
					const menudatas = addIsKeepAlive(res.data.datas);
					Local.set('datas', menudatas);
					// router.push('/home');
					if (!themeConfig.value.isRequestRoutes) {
						// 前端控制路由，2、请注意执行顺序
						const isNoPower = await initFrontEndControlRoutes();
					} else {
						// 后端控制路由，isRequestRoutes 为 true，则开启后端控制路由
						// 添加完动态路由，再进行 router 跳转，否则可能报错 No match found for location with path "/"（目前走的这个）
						const isNoPower = await initBackEndControlRoutes();
						// 执行完 initBackEndControlRoutes，再执行 signInSuccess
						signInSuccess(isNoPower);
					}
				} else {
					state.loading.signIn = false;
				}
			} catch (err: any) {
				state.loading.signIn = false;
			}
		} else {
			state.loading.signIn = false;
		}
	});
};
// 在路由里面所有的meta里面加上isKeepAlive字段(是否缓存组件状态)
const addIsKeepAlive = (datas: EmptyArrayType) => {
	datas.forEach((item) => {
		item.meta['isKeepAlive'] = true;
		item.children &&
			item.children.forEach((c: any) => {
				let reg = new RegExp('/', 'g');
				c.name = c.name.replace(reg, '');
			});
		// 菜单是否隐藏
		item.meta['isHide'] = Boolean(item.hidden);
		if (item.children) {
			addIsKeepAlive(item.children);
		}
	});
	return datas;
};
// 登录成功后的跳转
const signInSuccess = (isNoPower: boolean | undefined) => {
	if (isNoPower) {
		ElMessage.warning('抱歉，您没有登录权限');
		Session.clear();
	} else {
		// 初始化登录成功时间问候语
		let currentTimeInfo = currentTime.value;
		// 登录成功，跳到转首页
		// 如果是复制粘贴的路径，非首页/登录页，那么登录成功后重定向到对应的路径中
		if (route.query?.redirect) {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
			// router.push('/basics/purchase');
		}
		// 登录成功提示
		const signInText = t('message.signInText');
		ElMessage.success(`${Cookies.get('userName')}${currentTimeInfo}，${signInText}`);
		// 添加 loading，防止第一次进入界面时出现短暂空白
		NextLoading.start();
	}
	state.loading.signIn = false;
};
// 按enter键实现登录
const enterdown = (e: EmptyObjectType) => {
	if (e.keyCode == 13) {
		onSignIn(ruleFormRef.value);
	}
};
onMounted(() => {
	window.addEventListener('keydown', enterdown);
});
// 销毁
onUnmounted(() => {
	window.removeEventListener('keydown', enterdown, false);
});
</script>

<style scoped lang="scss">
:deep(.is-loading) {
	font-size: 24px !important;
}
.title {
	color: #0047c5;
	font-size: 30px;
	font-family: Microsoft YaHei;
	margin: 73px 0px 39px 0px;
	text-align: center;
}
.login-animation1 {
	margin-bottom: 28px;
}
.login-content-form {
	margin-top: 20px;
	@for $i from 1 through 4 {
		.login-animation#{$i} {
			opacity: 0;
			animation-name: error-num;
			animation-duration: 0.5s;
			animation-fill-mode: forwards;
			animation-delay: calc($i/10) + s;
		}
	}
	.login-content-password {
		display: inline-block;
		width: 20px;
		font-size: 20px;
		cursor: pointer;
		&:hover {
			color: #909399;
		}
	}
	.login-content-code {
		width: 100%;
		padding: 0;
		font-weight: bold;
		letter-spacing: 5px;
	}
	.login-content-submit {
		width: 100%;
		letter-spacing: 23px;
		font-weight: 600;
		margin-top: 15px;
		height: 50px;
		background: #6077ef;
		// background: linear-gradient(170deg, #2d6dcd, #33a1ff, #33cbff);
		box-shadow: 0px 3px 7px 0px rgba(16, 92, 138, 0.35);
		border: 0px;
		span {
			width: 100%;
			padding-left: 20px;
			font-size: 30px;
		}
	}
	.pwd-container {
		width: 100%;
		padding: 10px 20px 0px;
		.forpwd {
			float: right;
			cursor: pointer;
			font-size: 14px;
			&:hover {
				color: #324bca;
			}
		}
	}
	.el-input--large {
		font-size: 16px;
	}
	:deep(.el-input__wrapper) {
		// border-top: 0px;
		// border-right: 0px;
		// border-left: 0px;
		border: 1px solid #95a4ef;
		border-radius: 5px;
		box-shadow: 0 0 0 0px;
		// height: 93px;
	}
	:deep(.el-input__inner) {
		margin-left: 20px;
	}
	:deep(.el-form-item__error) {
		left: 16px !important;
	}
}
</style>
