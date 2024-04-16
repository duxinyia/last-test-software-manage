import request from '/@/utils/request';

// 查询站位（分頁）
export function postStationQueryPageApi(data: Object) {
	return request({
		url: '/api/Station/QueryPage',
		method: 'POST',
		data: data,
	});
}
// 新增站位
export function postStationAddStationApi(data: Object) {
	return request({
		url: '/api/Station/AddStation',
		method: 'POST',
		data: data,
	});
}
// 修改站位
export function putStationUpdateStationApi(data: Object) {
	return request({
		url: '/api/Station/UpdateStation',
		method: 'PUT',
		data: data,
	});
}
// 刪除站位
export function deleteStationDeleteStationApi(stationCode: string) {
	return request({
		url: `/api/Station/DeleteStation`,
		method: 'DELETE',
    params:{stationCode}
	});
}
// 站位綁定機台
export function postStationBindMachineApi(data: Object) {
	return request({
		url: '/api/Station/StationBindMachine',
		method: 'POST',
		data: data,
	});
}
// 站位解綁機台
export function postStationUnbindMachineApi(data: Object) {
	return request({
		url: '/api/Station/StationUnbindMachine',
		method: 'POST',
		data: data,
	});
}
// 獲取未綁定的機台
export function postStationQueryPageNotBoundMachineApi(data: Object) {
	return request({
		url: '/api/Station/QueryPageNotBoundMachine',
		method: 'POST',
    data: data,
	});
}
// 獲取已綁定的機台
export function postStationQueryPageBoundMachineApi(data: Object) {
	return request({
		url: '/api/Station/QueryPageBoundMachine',
		method: 'POST',
		data: data,
	});
}
// 導入站位
export function postStationImportStationApi(filePath: string) {
	return request({
		url: '/api/Station/ImportStation',
		method: 'POST',
		params:{filePath}
	});
}