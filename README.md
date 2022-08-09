<h1 align="center">
    CryptoDrive
</h1>

## TODO List

- [x] 技术选型
- [x] 前端demo
- [ ] 后端API
  - [x] 登录认证API demo
  - [x] 文件存储API demo 

## 完成进度

- [ ] 基于网页的用户注册与登录系统（60分）

  - [ ] 使用https绑定证书到域名而非IP地址 【 *PKI* *X.509* 】

  - [x] 允许用户注册到系统

    - [x] 用户名的合法字符集范围：中文、英文字母、数字
      - [x] 类似：-、_、.等合法字符集范围之外的字符不允许使用
    - [x] 用户口令长度限制在36个字符之内
    - [x] 对用户输入的口令进行强度校验，禁止使用弱口令

  - [x] 使用合法用户名和口令登录系统

  - [x] 禁止使用明文存储用户口令 【PBKDF2 散列算法 慢速散列 针对散列算法（如MD5、SHA1等）的攻击方法】

    - [x] 存储的口令即使被公开，也无法还原/解码出原始明文口令

  - [ ] （可选）安全的忘记口令 / 找回密码功能

  - [ ] （可选）微信/微博/支付宝的OAuth授权登录 / 注册绑定

  - [ ] （可选）双因素认证

    - OTP: Google Authenticator

    - Email

    - SMS

    - 扫码登录

- [ ] 基于网页的文件上传加密与数字签名系统（20分）

  - [ ] 已完成《基于网页的用户注册与登录系统》所有要求
  - [x] 限制文件大小：小于 10MB
  - [x] 限制文件类型：office文档、常见图片类型
  - [x] 匿名用户禁止上传文件
  - [x] 对文件进行对称加密存储到文件系统，禁止明文存储文件 【 *对称加密* *密钥管理（如何安全存储对称加密密钥）* *对称加密密文的PADDING问题* 】
  - [ ] 系统对加密后文件进行数字签名 【 *数字签名（多种签名工作模式差异）* 】
  - [ ] （可选）文件秒传：服务器上已有的文件，客户端可以不必再重复上传了

- [ ] 基于网页的加密文件下载与解密（20分）

  - [ ] 已完成《基于网页的文件上传加密与数字签名系统》所有要求
  - [ ] 提供匿名用户加密后文件和关联的数字签名文件的下载
    - [ ] 客户端对下载后的文件进行数字签名验证 【 *非对称（公钥）加密* *数字签名* 】
    - [ ] 客户端对下载后的文件可以解密还原到原始文件 【 *对称解密* *密钥管理* 】
  - [x] 提供已登录用户解密后文件下载
  - [ ] 下载URL设置有效期（限制时间或限制下载次数），过期后禁止访问 【 *数字签名* *消息认证码* *Hash Extension Length Attack* *Hash算法与HMAC算法的区别与联系* 】
  - [ ] 提供静态文件的散列值下载，供下载文件完成后本地校验文件完整性 【 *散列算法* 】

## 参考资料

#### 文档类
- [小学期Wiki](https://c4pr1c3.github.io/cuc-wiki/ac/2022/index.html)
- [React官方文档](https://zh-hans.reactjs.org/docs/getting-started.html)
- [Electron官方文档](https://www.electronjs.org/zh/docs/latest)
- [现代JavaScript教程（可当作文档手册）](https://zh.javascript.info/)
- [MongoDB文档](https://www.mongodb.com/docs/)
- [Mongoose文档](https://mongoosejs.com/docs/api.html)
- [Express.js文档](https://expressjs.com/en/api.html)
- [Libsodium文档](https://doc.libsodium.org/)

#### 课程类
- [全栈开发课](https://fullstackopen.com/zh/)
- [freeCodeCamp](https://chinese.freecodecamp.org/learn)
- 如果对JS中各种回调函数、匿名函数、箭头函数等等概念模糊，可以试着学习一下MIT的经典教材`Structure and Interpretation of Computer Programs`，js版教材由新国立的老师改编：
  - [SICP JS版](https://sourceacademy.org/sicpjs/index)
  - [SICP Python版（伯克利CS专业的入门课）](https://www.bilibili.com/video/BV16W411W76H)
- 如果对nodejs中的异步编程有困惑的Bilibili上有一个简短的视频介绍了node中异步的机制：
  - [事件处理](https://www.bilibili.com/video/BV13A4y1Q7N5)

#### 杂项
- [项目中需要实现的下载链接分享功能可以参考微软Azure SAS的设计](https://docs.microsoft.com/zh-cn/azure/storage/common/storage-sas-overview)

