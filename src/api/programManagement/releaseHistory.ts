import request from '/@/utils/request';
// 查詢發佈記錄
export function postPublishQueryPageByStationApi(data: Object) {
	return request({
		url: '/api/Publish/QueryPageByStation',
		method: 'POST',
		data: data,
	});
}
// 導出
export function postExportPublishStationApi(data:EmptyObjectType) {
  return request({
    url: '/api/ExportExcel/ExportPublishStation',
    method: 'POST',
    responseType: 'blob', // 设置响应数据类型为 blob
    data,
  });
}
