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
// 導出對內
export function postExportPublishStationApi(data:EmptyObjectType) {
  return request({
    url: '/api/ExportExcel/ExportPublishStation',
    method: 'POST',
    responseType: 'blob', // 设置响应数据类型为 blob
    data,
  });
}
// 導出對外
export function postExportPublishStationV2Api(data:EmptyObjectType) {
  return request({
    url: '/api/ExportExcel/ExportPublishStationV2',
    method: 'POST',
    responseType: 'blob', // 设置响应数据类型为 blob
    data,
  });
}
// 批量刪除
export function postPublishBatchDeleteProgramsApi(runIdList: EmptyArrayType) {
	return request({
		url: '/api/Publish/BatchDeletePrograms',
		method: 'POST',
		data: {runIdList},
	});
}
// 保存
export function postPublishUpdateSignStatusApi(publishId: string) {
	return request({
		url: '/api/Publish/UpdateSignStatus',
		method: 'POST',
		params: {publishId},
	});
}
