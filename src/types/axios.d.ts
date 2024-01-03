/* eslint-disable */
import * as axios from 'axios';

// 扩展 axios 数据返回类型，可自行扩展
declare module 'axios' {
	export interface AxiosResponse<T> {
		code: number;
		data: T;
		message: string;
		type?: string;
		status:boolean
		[key: string]: T;
	}
}
// window的（線上環境要配置api）
 export declare global {
  interface Window {
    webConfig: any;
  }
}