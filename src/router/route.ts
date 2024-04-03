import { RouteRecordRaw } from 'vue-router';

/**
 * 建议：路由 path 路径与文件夹名称相同，找文件可浏览器地址找，方便定位文件位置
 *
 * 路由meta对象参数说明
 * meta: {
 *      title:          菜单栏及 tagsView 栏、菜单搜索名称（国际化）
 *      isLink：        是否超链接菜单，开启外链条件，`1、isLink: 链接地址不为空 2、isIframe:false`
 *      isHide：        是否隐藏此路由
 *      isKeepAlive：   是否缓存组件状态
 *      isAffix：       是否固定在 tagsView 栏上
 *      isIframe：      是否内嵌窗口，开启条件，`1、isIframe:true 2、isLink：链接地址不为空`
 *      roles：         当前路由权限标识，取角色管理。控制路由显示、隐藏。超级管理员：admin 普通角色：common
 *      icon：          菜单、tagsView 图标，阿里：加 `iconfont xxx`，fontawesome：加 `fa xxx`
 * }
 */

// 扩展 RouteMeta 接口
declare module 'vue-router' {
	interface RouteMeta {
		title?: string;
		isLink?: string;
		isHide?: boolean;
		isKeepAlive?: boolean;
		isAffix?: boolean;
		isIframe?: boolean;
		roles?: string[];
		icon?: string;
	}
}

/**
 * 定义动态路由
 * 前端添加路由，请在顶级节点的 `children 数组` 里添加
 * @description 未开启 isRequestRoutes 为 true 时使用（前端控制路由），开启时第一个顶级 children 的路由将被替换成接口请求回来的路由数据
 * @description 各字段请查看 `/@/views/system/menu/component/addMenu.vue 下的 ruleForm`
 * @returns 返回路由菜单数据
 */
export const dynamicRoutes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: '/',
		component: () => import('/@/layout/index.vue'),
		redirect: '/projectConfiguration/projectManage',
		meta: {
			isKeepAlive: true,
		},
		children: [
			// {
			// 	path: '/basics/purchase',
			// 	name: '/basics/purchase',
			// 	component: () => import('/@/layout/routerView/parent.vue'),
			// 	meta: {
			// 		title: '基礎數據',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: true,
			// 		isIframe: false,
			// 		roles: ['admin', 'common'],
			// 		icon: 'iconfont icon-shouye',
			// 	},
			// },
			// {
			// 	path: '/basics',
			// 	name: 'basics',
			// 	component: () => import('/@/layout/routerView/parent.vue'),
			// 	redirect: '/basics/purchase',
			// 	meta: {
			// 		title: 'message.router.basics',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin'],
			// 		icon: 'iconfont icon-jichuguanli',
			// 	},
			// 	children: [
			// 		{
			// 			path: '/basics/purchase',
			// 			name: 'basicsPurchase',
			// 			component: () => import('/@/views/basics/purchase/index.vue'),
			// 			meta: {
			// 				title: 'message.router.basicsPurchase',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: true,
			// 				isIframe: false,
			// 				roles: ['admin'],
			// 				icon: 'iconfont icon-shuxingtu',
			// 			},
			// 		},
			// 		{
			// 			path: '/basics/object',
			// 			name: 'basicsObject',
			// 			component: () => import('/@/views/basics/object/index.vue'),
			// 			meta: {
			// 				title: 'message.router.basicsObject',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin'],
			// 				icon: 'iconfont icon-shuxingtu',
			// 			},
			// 		},
			// 		{
			// 			path: '/basics/basic',
			// 			name: 'basicsBasic',
			// 			component: () => import('/@/views/basics/basic/index.vue'),
			// 			meta: {
			// 				title: 'message.router.basicsBasic',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin'],
			// 				icon: 'iconfont icon-shuxingtu',
			// 			},
			// 		},
			// 		{
			// 			path: '/basics/code',
			// 			name: 'basicsCode',
			// 			component: () => import('/@/views/basics/code/index.vue'),
			// 			meta: {
			// 				title: 'message.router.basicsCode',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin'],
			// 				icon: 'iconfont icon-shuxingtu',
			// 			},
			// 		},
			// 	],
			// },
			// {
			// 	path: '/taskList',
			// 	name: 'taskList',
			// 	component: () => import('/@/layout/routerView/parent.vue'),
			// 	redirect: '/taskList/menu1',
			// 	meta: {
			// 		title: 'message.router.taskList',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin', 'common'],
			// 		icon: 'iconfont icon-danlieliebiao',
			// 	},
			// 	children: [
			// 		{
			// 			path: '/taskList/menu1',
			// 			name: 'menu1',
			// 			component: () => import('/@/views/menu/menu1/index.vue'),
			// 			meta: {
			// 				title: 'message.router.menu1',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin', 'common'],
			// 				icon: 'iconfont icon-caidan',
			// 			},
			// 		},
			// 		{
			// 			path: '/taskList/menu2',
			// 			name: 'menu2',
			// 			component: () => import('/@/views/menu/menu2/index.vue'),
			// 			meta: {
			// 				title: 'message.router.menu2',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin', 'common'],
			// 				icon: 'iconfont icon-caidan',
			// 			},
			// 		},
			// 	],
			// },
			// {
			// 	path: '/requisition',
			// 	name: 'requisition',
			// 	component: () => import('/@/layout/routerView/parent.vue'),
			// 	redirect: '/requisition/tagsView',
			// 	meta: {
			// 		title: 'message.router.requisition',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin', 'common'],
			// 		icon: 'iconfont icon-jiahao',
			// 	},
			// 	children: [
			// 		{
			// 			path: '/requisition/tagsView',
			// 			name: 'funTagsView',
			// 			component: () => import('/@/views/menu/menu1/index.vue'),
			// 			meta: {
			// 				title: 'message.router.menu1',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin', 'common'],
			// 				icon: 'iconfont icon-shuxingtu',
			// 			},
			// 		},
			// 	],
			// },
			// {
			// 	path: '/toolsReturn',
			// 	name: 'toolsReturn',
			// 	component: () => import('/@/layout/routerView/parent.vue'),
			// 	redirect: '/toolsReturn/filtering',
			// 	meta: {
			// 		title: 'message.router.toolsReturn',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin', 'common'],
			// 		icon: 'iconfont icon-tuihuo',
			// 	},
			// 	children: [
			// 		{
			// 			path: '/toolsReturn/tree',
			// 			name: 'pagesTree',
			// 			component: () => import('/@/views/menu/menu1/index.vue'),
			// 			meta: {
			// 				title: 'message.router.menu1',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin', 'common'],
			// 				icon: 'iconfont icon-shuxingtu',
			// 			},
			// 		},
			// 	],
			// },
			// {
			// 	path: '/report',
			// 	name: 'report',
			// 	component: () => import('/@/layout/routerView/parent.vue'),
			// 	redirect: '/statement/tableDemo',
			// 	meta: {
			// 		title: 'message.router.report',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin'],
			// 		icon: 'iconfont icon-baobiao',
			// 	},
			// 	children: [
			// 		{
			// 			path: '/report/tableDemo',
			// 			name: 'makeTableDemo',
			// 			component: () => import('/@/views/menu/menu1/index.vue'),
			// 			meta: {
			// 				title: 'message.router.menu1',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin', 'common'],
			// 				icon: 'iconfont icon-shuju',
			// 			},
			// 		},
			// 	],
			// },
			// {
			// 	path: '/partno',
			// 	name: 'partno',
			// 	component: () => import('/@/layout/routerView/parent.vue'),
			// 	redirect: '',
			// 	meta: {
			// 		title: 'message.router.matNo',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin'],
			// 		icon: 'iconfont icon-baobiao',
			// 	},
				// children: [
					// {
					// 	path: '/partno/noSearch',
					// 	name: 'partnoNoSearch',
					// 	component: () => import('/@/views/partno/noSearch/index.vue'),
					// 	meta: {
					// 		title: 'message.router.matSearch',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin'],
					// 	},
					// },
					// {
					// 	path: '/partno/sampleDelivery',
					// 	name: 'partnoSampleDelivery',
					// 	component: () => import('/@/views/partno/sampleDelivery/index.vue'),
					// 	meta: {
					// 		title: 'message.router.matSample',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin'],
					// 	},
					// },
					// {
					// 	path: '/partno/sendReceive',
					// 	name: 'partnoSendReceive',
					// 	component: () => import('/@/views/partno/sendReceive/index.vue'),
					// 	meta: {
					// 		title: 'message.router.sampleReceive',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin'],
					// 	},
					// },
					// {
					// 	path: '/partno/acceptance',
					// 	name: 'partnoAcceptance',
					// 	component: () => import('/@/views/partno/acceptance/index.vue'),
					// 	meta: {
					// 		title: 'message.router.sampleAcceptance',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin'],
					// 	},
					// },
				// ],
			// },
		],
	},
];

/**
 * 定义404、401界面
 * @link 参考：https://next.router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
 */
export const notFoundAndNoPower = [
	{
		path: '/:path(.*)*',
		name: 'notFound',
		component: () => import('/@/views/error/404.vue'),
		meta: {
			title: 'message.staticRoutes.notFound',
			isHide: true,
		},
	},
	{
		path: '/401',
		name: 'noPower',
		component: () => import('/@/views/error/401.vue'),
		meta: {
			title: 'message.staticRoutes.noPower',
			isHide: true,
		},
	},
];

/**
 * 定义静态路由（默认路由）
 * 此路由不要动，前端添加路由的话，请在 `dynamicRoutes 数组` 中添加
 * @description 前端控制直接改 dynamicRoutes 中的路由，后端控制不需要修改，请求接口路由数据时，会覆盖 dynamicRoutes 第一个顶级 children 的内容（全屏，不包含 layout 中的路由出口）
 * @returns 返回路由菜单数据
 */
export const staticRoutes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: 'login',
		component: () => import('/@/views/login/index.vue'),
		meta: {
			title: '登录',
		},
	},
	// 链接
	{
		path: '/link/programReleaseLink',
		name: 'programReleaseLink',
		component: () => import('/@/views/link/programReleaseLink/index.vue'),
		meta: {
			title: '程式發佈详情',
		},
	},
	{
		path: '/link/kanbanBoardLink',
		name: 'kanbanBoardLink',
		component: () => import('/@/views/link/kanbanBoardLink/index.vue'),
		meta: {
			title: '平臺看板',
		},
	},
	// {
	// 	path: '/link/noSearchLink',
	// 	name: 'noSearchLink',
	// 	component: () => import('/@/views/link/noSearchLink/index.vue'),
	// 	meta: {
	// 		title: '料号详情',
	// 	},
	// },
	// {
	// 	path: '/link/arrivalAcceptanceLink',
	// 	name: 'arrivalAcceptanceLink',
	// 	component: () => import('/@/views/link/arrivalAcceptanceLink/index.vue'),
	// 	meta: {
	// 		title: '驗收單详情',
	// 	},
	// },
	// {
	// 	path: '/link/idleInquiryLink',
	// 	name: 'idleInquiryLink',
	// 	component: () => import('/@/views/link/idleInquiryLink/index.vue'),
	// 	meta: {
	// 		title: '閒置單详情',
	// 	},
	// },
	// {
	// 	path: '/link/scrapBillQueryLink',
	// 	name: 'scrapBillQueryLink',
	// 	component: () => import('/@/views/link/scrapBillQueryLink/index.vue'),
	// 	meta: {
	// 		title: '報廢單详情',
	// 	},
	// },
	// {
	// 	path: '/link/404',
	// 	name: '404',
	// 	component: () => import('/@/views/error/404.vue'),
	// 	meta: {
	// 		title: 'message.staticRoutes.noPower',
	// 	},
	// },
	/**
	 * 提示：写在这里的为全屏界面，不建议写在这里
	 * 请写在 `dynamicRoutes` 路由数组中
	 */
	// {
	// 	path: '/visualizingDemo1',
	// 	name: 'visualizingDemo1',
	// 	component: () => import('/@/views/visualizing/demo1.vue'),
	// 	meta: {
	// 		title: 'message.router.visualizingLinkDemo1',
	// 	},
	// },
	// {
	// 	path: '/visualizingDemo2',
	// 	name: 'visualizingDemo2',
	// 	component: () => import('/@/views/visualizing/demo2.vue'),
	// 	meta: {
	// 		title: 'message.router.visualizingLinkDemo2',
	// 	},
	// },
];
