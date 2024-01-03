import request from '/@/utils/request';
// 查詢發佈記錄
export function postPublishQueryPageByStationApi(data: Object) {
	return request({
		url: '/api/Publish/QueryPageByStation',
		method: 'POST',
		data: data,
	});
}
