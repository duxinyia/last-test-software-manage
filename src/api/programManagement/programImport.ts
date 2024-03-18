import request from '/@/utils/request';
// 查詢導入記錄
export function postPublishQueryPageImportApi(data: Object) {
	return request({
		url: '/api/Publish/QueryPageImport',
		method: 'POST',
		data: data,
	});
}
// 查詢待導入列表
export function postPublishQueryWaitImportApi(data: Object) {
	return request({
		url: '/api/Publish/QueryWaitImport',
		method: 'POST',
		data: data,
	});
}
// 導入程式
export function postPublishImportProgramApi(data: Object) {
	return request({
		url: '/api/Publish/ImportProgram',
		method: 'POST',
		data: data,
	});
}
// 查詢導入狀態
export function postPublishQueryImportStatusApi(data: Object) {
	return request({
		url: '/api/Publish/QueryImportStatus',
		method: 'POST',
		data: data,
	});
}