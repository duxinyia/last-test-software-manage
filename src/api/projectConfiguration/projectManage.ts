import request from '/@/utils/request';

// 查询專案（分頁）
export function postProjectQueryPageApi(data: Object) {
	return request({
		url: '/api/Project/QueryPage',
		method: 'POST',
		data: data,
	});
}
// 新增專案
export function postProjectAddProjectApi(data: Object) {
	return request({
		url: '/api/Project/AddProject',
		method: 'POST',
		data: data,
	});
}
// 修改專案
export function putProjectUpdateProjectApi(data: Object) {
	return request({
		url: '/api/Project/UpdateProject',
		method: 'PUT',
		data: data,
	});
}
// 刪除專案
export function deleteProjectDeleteProjectApi(runId: string) {
	return request({
		url: `/api/Project/DeleteProject/${runId}`,
		method: 'DELETE',
	});
}
// 獲取專案站位數據(分頁)
export function postProjectQueryPageProjectStationApi(data: Object) {
	return request({
		url: '/api/Project/QueryPageProjectStation',
		method: 'POST',
		data: data,
	});
}
// 新增專案站位
export function postProjectAddProjectStationApi(data: Object) {
	return request({
		url: '/api/Project/AddProjectStation',
		method: 'POST',
		data: data,
	});
}
// 修改專案站位
export function putProjectUpdateProjectStationApi(data: Object) {
	return request({
		url: '/api/Project/UpdateProjectStation',
		method: 'PUT',
		data: data,
	});
}
// 刪除專案站位
export function deleteProjectDeleteProjectStationApi(runId: string) {
	return request({
		url: `/api/Project/DeleteProjectStation`,
		method: 'DELETE',
    params:{runId}
	});
}
// 查询階段（不分頁）
export function postStageQueryNoPageApi(productionLineType: string) {
	return request({
		url: '/api/Stage/QueryNoPage',
		method: 'GET',
		params:{productionLineType},
	});
}