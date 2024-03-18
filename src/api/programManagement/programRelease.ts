import request from '/@/utils/request';
// 查詢發佈記錄
export function postPublishQueryPageApi(data: Object) {
	return request({
		url: '/api/Publish/QueryPage',
		method: 'POST',
		data: data,
	});
}
// 新增發佈程式
export function postPublishAddPublishApi(data: Object) {
	return request({
		url: '/api/Publish/AddPublish',
		method: 'POST',
		data: data,
	});
}
// 編輯程式發佈
export function putPublishUpdatePublishApi(data: Object) {
	return request({
		url: '/api/Publish/UpdatePublish',
		method: 'PUT',
		data: data,
	});
}
// 專案下拉框
export function getProjectQueryNoPageApi(projectName?: string) {
	return request({
		url: '/api/Project/QueryNoPage',
		method: 'GET',
		params: {projectName},
	});
}
// 站位下拉框
export function getProjectQueryNopageProjectStationApi(projectId?: string) {
	return request({
		url: '/api/Project/QueryNopageProjectStation',
		method: 'GET',
		params: {projectId},
	});
}
// 刪除程式
export function deletePublishDeletePublishApi(runId: string) {
	return request({
		url: `/api/Publish/DeletePublish`,
		method: 'DELETE',
    params:{runId}
	});
}
// 發佈詳情
export function getPublishDetailApi(runId: string) {
	return request({
		url: '/api/Publish/Get',
		method: 'GET',
		params: {runId},
	});
}
// 提交簽核
export function postPublishSubmitSignApi(data: Object) {
	return request({
		url: '/api/Publish/SubmitSign',
		method: 'POST',
		data: data,
	});
}
// 獲取簽核流程
export function getPublishGetSignFlowApi(runId: string) {
	return request({
		url: '/api/Publish/GetSignFlow',
		method: 'GET',
		params: {runId},
	});
}