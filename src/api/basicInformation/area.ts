import request from '/@/utils/request';


// 新增樓棟
export function postAddBuildingApi(data?: Object) {
	return request({
		url: '/api/Area/AddBuilding',
		method: 'POST',
		data: data,
	});
}
// 新增樓層
export function postAddFloorApi(data: Object) {
	return request({
		url: '/api/Area/AddFloor',
		method: 'POST',
		data: data,
	});
}
// // 刪除
export function deleteAreaDeleteApi(runId: string) {
	return request({
		url: `/api/Area/Delete`,
		method: 'DELETE',
    params:{runId}
	});
}

// 獲取樓棟
export function getAreaQueryBuildingApi(name?: string) {
	return request({
		url: '/api/Area/QueryBuilding',
		method: 'GET',
		params: {name},
	});
}
// 獲取樓層
export function getAreaQueryFloorApi(Building?: string) {
	return request({
		url: '/api/Area/QueryFloor',
		method: 'GET',
		params: {Building},
	});
}