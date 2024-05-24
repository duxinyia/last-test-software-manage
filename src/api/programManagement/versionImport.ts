import request from '/@/utils/request';

// 導入機台版本信息
export function postImportVersionFromExcelApi(filePath:string) {
	return request({
		url: '/api/Publish/ImportVersionFromExcel',
		method: 'POST',
    params:{
      filePath
    },
	});
}


