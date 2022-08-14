/** 复制文本  */
export function copyText(text) {
  if (document !== null) {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy"); // Perform a copy operation
    document.body.removeChild(input); // Finally, delete the temporarily created input input box in the example to complete the copy operation
  }
}

export function getUrlParams(url) {
  let urlStr = url.split('?')[1]
  let obj = {};
  let paramsArr = urlStr.split('&')
  for (let i = 0, len = paramsArr.length; i < len; i++) {
    let arr = paramsArr[i].split('=')
    obj[arr[0]] = arr[1];
  }
  return obj
}