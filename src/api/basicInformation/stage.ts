import request from '/@/utils/request';

// 查询階段（分頁）
export function postStageQueryPageApi(data: Object) {
	return request({
		url: '/api/Stage/QueryPage',
		method: 'POST',
		params: data,
	});
}
// 新增階段
export function postStageAddApi(data: Object) {
	return request({
		url: '/api/Stage/Post',
		method: 'POST',
		data: data,
	});
}
// 修改階段
export function putStageUpdataApi(data: Object) {
	return request({
		url: '/api/Stage/Put',
		method: 'PUT',
		data: data,
	});
}
// 刪除階段
export function deleteStageApi(id: string) {
	return request({
		url: `/api/Stage/Delete/${id}`,
		method: 'DELETE',
	});
}