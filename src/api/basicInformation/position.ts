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
export function deleteStationDeleteStationApi(runId: string) {
	return request({
		url: `/api/Station/DeleteStation`,
		method: 'DELETE',
    params:{runId}
	});
}