import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import { Session } from '/@/utils/storage';
/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			userName: '',
			userId:'',
			userPassword:'',
			isSign:1,
			time: 0,
			roles: [],
			authBtnList: [],
		},
	}),
	actions: {
		async setUserInfos() {
			// 存储用户信息到浏览器缓存
			if (Session.get('userInfo')) {
				this.userInfos = Session.get('userInfo');
			} else {
				const userInfos = <UserInfos>await this.getApiUserInfo();
				this.userInfos = userInfos;
			}
		},
		// 接口数据
		async getApiUserInfo() {
			return new Promise((resolve) => {
				setTimeout(() => {
					const userName = Cookies.get('userName');
					const userId = Cookies.get('userId');	
					const userPassword=Cookies.get('userPassword')
					const isSign=Session.get('isSign')
					let defaultRoles: Array<string> = [];
					let defaultAuthBtnList: Array<string> = [];
					// admin 页面权限标识，对应路由 meta.roles，用于控制路由的显示/隐藏
					let adminRoles: Array<string> = ['admin'];
					// admin 按钮权限标识
					let adminAuthBtnList: Array<string> = ['btn.add', 'btn.del', 'btn.edit', 'btn.link'];
					// test 页面权限标识，对应路由 meta.roles，用于控制路由的显示/隐藏
					let testRoles: Array<string> = ['common'];
					// test 按钮权限标识
					let testAuthBtnList: Array<string> = ['btn.add', 'btn.link'];
					// 不同用户模拟不同的用户权限
					// if (userName === 'admin') {
						defaultRoles = adminRoles;
						defaultAuthBtnList = adminAuthBtnList;
					// } else {
					// 	defaultRoles = testRoles;
					// 	defaultAuthBtnList = testAuthBtnList;
					// }
					// 用户信息模拟数据
					const userInfos = {
						userName: userName,
						userId:userId,
						isSign:isSign,
						time: new Date().getTime(),
						roles: defaultRoles,
						authBtnList: defaultAuthBtnList,
						userPassword:userPassword
					};
					Session.set('userInfo', userInfos);
					resolve(userInfos);
				}, 0);
			});
		},
	},
});
