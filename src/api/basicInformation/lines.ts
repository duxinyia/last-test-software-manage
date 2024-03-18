import request from '/@/utils/request';

// 查询線體（分頁）
export function postLineQueryPageApi(data: Object) {
	return request({
		url: '/api/Line/QueryPage',
		method: 'POST',
		data: data,
	});
}
// 新增線體
export function postLineAddLineApi(data: Object) {
	return request({
		url: '/api/Line/AddLine',
		method: 'POST',
		data: data,
	});
}
// 修改線體
export function putLineUpdateLineApi(data: Object) {
	return request({
		url: '/api/Line/UpdateLine',
		method: 'PUT',
		data: data,
	});
}
// 刪除線體
export function deleteLineDeleteLineApi(runId: string) {
	return request({
		url: `/api/Line/DeleteLine`,
		method: 'DELETE',
    params:{runId}
	});
}
// 線體綁定站位
export function postLineBindStationApi(data: Object) {
	return request({
		url: '/api/Line/LineBindStation',
		method: 'POST',
		data: data,
	});
}
// 線體解綁站位
export function postLineUnBindStationApi(data: Object) {
	return request({
		url: '/api/Line/LineUnBindStation',
		method: 'POST',
		data: data,
	});
}
// 獲取未綁定的站位
export function postLineQueryPageNotBoundStationApi(data: Object) {
	return request({
		url: '/api/Line/QueryPageNotBoundStation',
		method: 'POST',
    data: data,
	});
}
// 獲取已綁定的站位
export function postLineQueryPageBoundStationApi(data: Object) {
	return request({
		url: '/api/Line/QueryPageBoundStation',
		method: 'POST',
		data: data,
	});
}