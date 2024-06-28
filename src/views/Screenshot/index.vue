<template>
	<!-- <el-button @click="jietu">快捷截图</el-button>
	加快速度福建省打開房間卡肯德基福克斯砥礪奮進實績考核發給客家話
	<screen-short v-if="screenshotStatus" @get-image-data="getImg" @destroy-component="destroyComponent"> </screen-short>
</template> -->
</template>
<script setup lang="ts" name="menu12">
import { ref } from 'vue';
const uploadlist: EmptyArrayType = ref([]);
const screenshotStatus = ref(false);
function jietu() {
	// showScreenShort.value = false; //隐藏弹框
	screenshotStatus.value = true; //显示截图插件
}

//截图按了√以后生成64编码
async function getImg(base64) {
	let image = new Image();
	image.src = base64;
	image.onload = () => {
		let canvas = convertImageToCanvas(image);
		let url = canvas.toDataURL('image/jpeg');
		let name = guid();
		uploadlist.value.push({ image: url, name: name });
	};
	//截图完成后显示弹框
	// showScreenShort.value = true;
}

//生成文件唯一编码作为name 方便后续删除图片时查找对象
function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		let r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

//取消截图 显示弹窗 隐藏截图插件
function destroyComponent() {
	screenshotStatus.value = false;
	// showScreenShort.value = true;
}
</script>

<style lang="scss" scoped></style>
