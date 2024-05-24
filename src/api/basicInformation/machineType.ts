import request from '/@/utils/request';

// 查询站位（分頁）
export function postMachineTypeQueryPageApi(data: Object) {
	return request({
		url: '/api/Machine/QueryPage',
		method: 'POST',
		data: data,
	});
}
// 新增站位
export function postMachineTypeAddMachineTypeApi(data: Object) {
	return request({
		url: '/api/Machine/AddMachine',
		method: 'POST',
		data: data,
	});
}
// 修改站位
export function putMachineTypeUpdateMachineTypeApi(data: Object) {
	return request({
		url: '/api/Machine/UpdateMachine',
		method: 'PUT',
		data: data,
	});
}
// 刪除站位
export function deleteMachineTypeDeleteMachineTypeApi(machineNo: string) {
	return request({
		url: `/api/Machine/DeleteMachine`,
		method: 'DELETE',
    params:{machineNo}
	});
}
// 導入機台
export function postMachineTypeImportMachineApi(filePath: string) {
	return request({
		url: '/api/Machine/ImportMachine',
		method: 'POST',
		params:{filePath}
	});
}
// 導出機台
export function postExportMachineLineStationApi(params:EmptyObjectType) {
  return request({
    url: '/api/ExportExcel/ExportMachineLineStation',
    method: 'POST',
    responseType: 'blob', // 设置响应数据类型为 blob
    params,
  });
}