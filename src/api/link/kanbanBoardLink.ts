import request from '/@/utils/request';

// 查询
export function postPublishQueryMachineCurrentProApi(data: Object) {
	return request({
		url: '/api/Publish/QueryMachineCurrentPro',
		method: 'POST',
		data: data,
	});
}
// 獲取專案的線體
export function getProjectLineApi(projectId: string) {
	return request({
		url: '/api/Project/GetProjectLine',
		method: 'GET',
		params:{projectId},
	});
}