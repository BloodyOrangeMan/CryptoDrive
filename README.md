<h1 align="center">
    CryptoDrive
</h1>
密码学加密网盘，数据库和服务器不储存明文文件。

本项目链接地址[CryptoDrive](https://github.com/BloodyOrangeMan/CryptoDrive)


## 功能清单

- [x] 基于网页的用户注册与登录系统（60分）

  - [x] 使用https绑定证书到域名而非IP地址 【 *PKI* *X.509* 】

  - [x] 允许用户注册到系统

    - [x] 用户名的合法字符集范围：中文、英文字母、数字
      - [x] 类似：-、_、.等合法字符集范围之外的字符不允许使用
    - [x] 用户口令长度限制在36个字符之内
    - [x] 对用户输入的口令进行强度校验，禁止使用弱口令
      - [x] 显示用户输入的口令的强度等级

  - [x] 使用合法用户名和口令登录系统

  - [x] 禁止使用明文存储用户口令 【PBKDF2 散列算法 慢速散列 针对散列算法（如MD5、SHA1等）的攻击方法】

    - [x] 存储的口令即使被公开，也无法还原/解码出原始明文口令

  - [x] （可选）安全的忘记口令 / 找回密码功能

- [x] 基于网页的文件上传加密与数字签名系统（20分）

  - [x] 已完成《基于网页的用户注册与登录系统》所有要求
  - [x] 限制文件大小：小于 10MB
  - [x] 限制文件类型：office文档、常见图片类型
  - [x] 匿名用户禁止上传文件
  - [x] 对文件进行对称加密存储到文件系统，禁止明文存储文件 【 *对称加密* *密钥管理（如何安全存储对称加密密钥）* *对称加密密文的PADDING问题* 】
  - [x] 系统对加密后文件进行数字签名 【 *数字签名（多种签名工作模式差异）* 】
  - [x] （可选）文件秒传：服务器上已有的文件，客户端可以不必再重复上传了

- [x] 基于网页的加密文件下载与解密（20分）

  - [x] 已完成《基于网页的文件上传加密与数字签名系统》所有要求
  - [x] 提供匿名用户加密后文件和关联的数字签名文件的下载
    - [x] 客户端对下载后的文件进行数字签名验证 【 *非对称（公钥）加密* *数字签名* 】
    - [x] 客户端对下载后的文件可以解密还原到原始文件 【 *对称解密* *密钥管理* 】
  - [x] 提供已登录用户解密后文件下载
  - [x] 下载URL设置有效期（限制时间或限制下载次数），过期后禁止访问 【 *数字签名* *消息认证码* *Hash Extension Length Attack* *Hash算法与HMAC算法的区别与联系* 】
  - [x] 提供静态文件的散列值下载，供下载文件完成后本地校验文件完整性 【 *散列算法* 】


## 本项目用到的关键技术
- xchacha20poly1305:加密文件

- argon2:密钥派生

- ed25519:公私钥签名

- HMAC(JWT)：数字签名生成分享链接

  

## 快速安装与使用方法说明

- 在WSL2中安装MongoDB

  ```bash
  # 1. Open your WSL terminal (ie. Ubuntu) and go to your home directory: 
  cd ~
  # 2. Update your Ubuntu packages: 
  sudo apt update
  #3.  Import the public key used by the MongoDB package management system: 
  wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
  #4.  Create a list file for MongoDB: 
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
  #5.  Reload local package database: 
  sudo apt-get update
  #6.  Install MongoDB packages: 
  sudo apt-get install -y mongodb-org
  #7.  Confirm installation and get the version number: 
  mongod --version
  #8.  Make a directory to store data: 
  mkdir -p ~/data/db
  #9.  Run a Mongo instance: 
  sudo mongod --dbpath ~/data/db
  #10.  Check to see that your MongoDB instance is running with: 
  ps -e | grep 'mongod'
  #11.  To exit the MongoDB Shell, use the shortcut keys: Ctrl + C
  ```

  

- 在WSL2中开启MongoDB服务

  ```bash
  #1.  Download the init.d script for MongoDB: 
  curl https://raw.githubusercontent.com/mongodb/mongo/master/debian/init.d | sudo tee /etc/init.d/mongodb >/dev/null
  #2.  Assign that script executable permissions: 
  sudo chmod +x /etc/init.d/mongodb
  #3.  Now you can use MongoDB service commands:
    sudo service mongodb status 
    #for checking the status of your database. You should see a [Fail] response if no database is running.
    sudo service mongodb start 
    #to start running your database. You should see a [Ok] response.
    sudo service mongodb stop 
    #to stop running your database.
  ```

  

- 安装nodejs

  ```bash
  sudo apt-get install curl
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  nvm install --lts
  node --version
  npm --version
  nvm use --lts
  ```

  

- 构建前端（默认在3000端口打开服务）

  ```bash
  cd frontend
  npm install 
  npm build
  ```

  

- 运行后端

  - 修改`config.env`参数

    ```
    NODE_ENV=development
    

    PORT=3001

    DATABASE_LOCAL=mongodb://localhost:27017/yourdatabasename

    JWT_SECRET=my-ultra-secure-and-ultra-long-secret

    JWT_EXPIRES_IN=90d

    JWT_COOKIE_EXPIRES_IN=90
    ```
 
    ---
    ```bash
    ## 运行后端
    cd backend
    npm install
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout cert.key -out cert.crt -config req.cnf -sha256
    
    npm start # production
    npm run dev # development
    ```

- 在成功配置前后端后，访问[https://localhost:3001](https://localhost:3001)即可体验所有功能。



## 视频讲解地址

视频正在剪辑中，视频链接请到github的README获取最新版😭


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

