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
export function getStageQueryNoPageApi(productionLineType: string) {
	return request({
		url: '/api/Stage/QueryNoPage',
		method: 'GET',
		params:{productionLineType},
	});
}
// 查询機台型號（不分頁）
export function getMachineQueryNoPageApi(machineTypeName: string) {
	return request({
		url: '/api/MachineType/QueryNoPage',
		method: 'GET',
		params:{machineTypeName},
	});
}
// 查询站位（不分頁）
export function getStationQueryNoPageApi(stationName?: string) {
	return request({
		url: '/api/Station/QueryNoPage',
		method: 'GET',
		params:{stationName},
	});
}
// 站位新增機台
export function postProjectAddStationMachineApi(data: Object) {
	return request({
		url: '/api/Project/AddStationMachine',
		method: 'POST',
		data: data,
	});
}
// 查询站位下的機台（不分頁）
export function getStationMachineListApi(stationCode: string,line:string,projectCode:string) {
	return request({
		url: '/api/Project/GetStationMachineList',
		method: 'GET',
		params:{stationCode,line,projectCode},
	});
}
// 修改站位下機台
export function postProjectUpdateStationMachineApi(data: Object) {
	return request({
		url: '/api/Project/UpdateStationMachine',
		method: 'POST',
		data: data,
	});
}
// 刪除站位下的機台
export function deleteProjectDeleteStationMachineApi(runId: string) {
	return request({
		url: `/api/Project/DeleteStationMachine`,
		method: 'DELETE',
    params:{runId}
	});
}
// 獲取線體-站位-機台詳情列表
export function postLineGetLineDetailListApi(data: EmptyArrayType) {
	return request({
		url: '/api/Line/GetLineDetailList',
		method: 'POST',
		data: data,
	});
}
// 獲取專案線體-站位-機台列表
export function getProjectLineMachineListApi(projectId: string) {
	return request({
		url: '/api/Project/GetProjectLineMachineList',
		method: 'GET',
		params:{projectId},
	});
}
// 刪除專案的線體
export function deleteProjectDeleteProjectLineApi(projectId: string,lineCode: string) {
	return request({
		url: `/api/Project/DeleteProjectLine`,
		method: 'DELETE',
    params:{projectId,lineCode}
	});
}
// 專案增加線體
export function postProjectAddProjectLineApi(data: Object) {
	return request({
		url: '/api/Project/AddProjectLine',
		method: 'POST',
		data: data,
	});
}