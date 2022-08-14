/** 复制文本  */
export function copyText(text) {
  if (document !== null) {
    const input = document.createElement("input"); 
    input.value = text; 
    document.body.appendChild(input); 
    input.select();
    document.execCommand("Copy"); // 执行复制操作
    document.body.removeChild(input); // 最后删除实例中临时创建的input输入框，完成复制操作Ï
  }
}

export function getUrlParams(url) {
  // 通过 ? 分割获取后面的参数字符串
  let urlStr = url.split('?')[1]
  // 创建空对象存储参数
  let obj = {};
  // 再通过 & 将每一个参数单独分割出来
  let paramsArr = urlStr.split('&')
  for (let i = 0, len = paramsArr.length; i < len; i++) {
    // 再通过 = 将每一个参数分割为 key:value 的形式
    let arr = paramsArr[i].split('=')
    obj[arr[0]] = arr[1];
  }
  return obj
}