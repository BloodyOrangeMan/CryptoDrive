# 0主要贡献

- 技术选型

- 前端大部分交互界面的实现
  
  - 例：上传文件的Modal、文件展示、密码强度展示

- 后端：
  - 后端基本搭建
  
  - 用户登录注册认证API
  
  - 文件CRUD操作PI
  
  - 密码学接口的实现
  
  - 密码学设计

- 帮助组员修改bug

# 1技术选型Q&A

- Q：为什么技术栈选用Javascript这门语言构建前后端

- A：首先，2022年，web技术越来越有一种无所不能的姿态了，似乎没有JavaScript/Typescirpt写不了的东西，从一门最早诞生于浏览器里的脚本语言，到现在很多的桌面客户端都在使用Javascript进行编写，像是语雀这样的公司，也都是JS前后端一把梭，因此这次小学期对我们来说也是一次探索web技术的机会。其次，小学期应该算是一个全栈项目，前后端都使用JS，可以降低我们的学习成本，对于初次尝试web全栈的新手来说比较友好，学习曲线不像使用Java、C++、.NET、Go那样陡峭，并且我在今年寒假学习了大名鼎鼎的SICP这门课程，JS作为一门函数地位较高的编程语言，能够有机会练习到所谓的“函数式编程”（不过实际上我们真正面对的是JS的回调地狱）。另外在一开始我们打算使用Electron写一个桌面版客户端，不过碍于放假偷懒与技术水平，最终放弃了这个选项。

- Q：为什么前端选用React作为框架

- A：为了节省前端的开发时间，我想使用Ant Design的组件库以及Material UI，虽然现在Antd也对Vue有了支持，但React的文档还是要更丰富一些，并且对React的适配以及网上的教程资源都要更多一点，可以说现在Antd之于React就有些像是Bootstrap之于Jqurey一样。

- Q：为什么数据选用MongoDB

- A：与第一条类似，MongoDB能够更简单的处理前后端产生的JSON数据，降低我们的学习成本，可以说MERN Stack（MongoDB,Express,React,Nodejs）这个组合是臭味相投的。

- Q：为什么存储二进制加密文件要直接存储在MongoDB数据库里，而不是存储在服务器的File System里

- A：诚然，也许直接使用File System性能会更好，但我们使用GridFS将二进制文件直接存入MongoDB，简化了技术栈，保持了数据库的原子性，并且将数据全部存在数据库中，能够更好对我们被加密的数据做访问控制，也更利于数据的备份与迁移，考虑到本次项目应该是一个轻量化的网盘，对于小文件传输，这点性能损失应该不用计较。

- Q：为什么不使用Typescript，毕竟现在这么流行

- A：一开始就图省事，后面项目复杂起来后，经常被各种隐式类型弄得头晕，特别是在处理密码学的部分，搞不清楚传入的参数到底string、buffer还是一个对象，debug起来属实很累。因此没有使用Typescript是本次项目的遗憾。

# 2项目结构介绍：

后端：

```
 .
├──  app.js
├──  config.env
├──  controllers
│   ├──  authController.js
│   ├──  errorController.js
│   ├──  fileController.js
│   ├──  keyController.js
│   ├──  shareController.js
│   └──  userController.js
├──  models
│   ├──  keyModel.js
│   ├──  shareModel.js
│   └──  userModel.js
├──  package-lock.json
├──  package.json
├──  routes
│   ├──  authRoutes.js
│   ├──  fileRoutes.js
│   ├──  keyRoutes.js
│   └──  shareRoutes.js
├──  server.js
└──  utils
    ├──  apiFeatures.js
    ├──  appError.js
    ├──  catchAsync.js
    ├──  cryptoFeatures.js
    └──  nodemailer.js
```

后端结构类似于MVC架构：

- Controller用来处理事件并作出响应。“事件”包括用户的行为和数据 Model 上的改变。也就是用来处理用户请求的。而routes定义了每一个API的url以及所用到的控制器。

- Model 用于封装与应用程序的业务逻辑相关的数据以及对数据的处理方法。

- Routes里定义了每一个API所对应的URL以及所调用的控制器。

前端：

```
 .
├──  package-lock.json
├──  package.json
├──  public
│   ├──  gdrive.ico
│   ├──  index.html
│   ├──  manifest.json
│   ├──  robots.txt
│   └──  Static
│       └──  google_drive.svg
└──  src
    ├──  App.js
    ├──  components
    │   ├──  Dashboard.js
    │   ├──  DevCard.js
    │   ├──  DevTeam.js
    │   ├──  File.js
    │   ├──  Header.js
    │   ├──  Key.js
    │   ├──  Login.js
    │   ├──  Main.js
    │   ├──  Register.js
    │   ├──  Resetpsw.js
    │   ├──  Share.js
    │   └──  SideBar.js
    ├──  index.css
    ├──  index.js
    └──  utils
        └──  publicfunc.js
```

前端就是各种由组成各种交互界面的组件组成。

# 3密码学Q&A

- Q：为什么密码学库使用了Libsodium

- A：黄老师倾情推荐，并且Libsodium.js是由Libsodium原作者亲手操刀，看了文档之后发现简单易用，就敲定使用它了。

- Q：用户的公私钥是如何生成的。

- A：考虑到明文存储私钥在数据库中会有巨大的安全隐患，因此我的想法是直接**不储存私钥**，libsodium提供了一个API`crypto_sign_seed_keypair(SEED)`，每次将同样的`SEED`传入其中能够生成一把同样的公私钥对，因此将[用户的登录口令作为密钥派生的参数之一]([Key derivation - libsodium](https://doc.libsodium.org/key_derivation#deriving-a-key-from-a-password))生成一个SEED，这样当每次需要使用私钥进行签名时，让用户输入自己的登录口令，临时将自己的私钥生成，使用过后就会被销毁。在密钥派生时，使用了`Argon2`这个算法，具体生成SEED的代码如下：
  
  ```javascript
  const initKey = async (passphrase, length) => {
    if (!sodium) await onCache;
  
    const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
    const key = sodium.crypto_pwhash(
      length,
      passphrase,
      salt,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );
    return {
      salt,
      key,//key as seed
    };
  };
  ```
  
  此处返回的salt是零时生成的一个随机值，主要是让相同口令也能够生成不同的SEED。为了在生成私钥时还原出SEED，我们还需要在数据库中保存salt的值。

- Q：用户的文件加密密钥是如何管理的：

- A：与生成公私钥的设计类似，我们数据库里面将不存储文件对应的对称密钥，而是使用文件专属的口令做加盐处理进行密钥派生。也就是说，网盘中可以不止存在一把对称密钥，并且因为做了加盐处理，就算口令一样，每次加密生成的对称密钥也是不一样的。

```javascript
const genKey = async (salt, passphrase, length) => {
  if (!sodium) await onCache;

  const key = sodium.crypto_pwhash(
    length,
    passphrase,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );

  return key;
};
```

- Q：文件是如何被加密的：

- A：libsodium文档中推荐的文件加密算法是[XChaCha20 - Libsodium documentation](https://libsodium.gitbook.io/doc/advanced/stream_ciphers/xchacha20)这是一种流密码算法，在没有AES硬件加速的情况下，chacah20算法的加解密速度会比AES_GCM来得较快，XChaCha20是ChaCha20的一个变体，XChaCha20不需要任何查询表，避免了定时攻击的可能性。而libsodium提供了一API`crypto_secretstream_xchacha20poly1305`使得使用者能够使用xchacha20算法对文件进行加密，并且还用了poly1305对解密后文件做消息认证，可以说是二合一的一个接口，其中Poly1305消息认证的结构采用的是FIPS推荐的`encrypt-then-MAC`，如果消息有错误，则不会进行解密操作。具体的加密代码如下：

```javascript
exports.encryptStream = async (data, passphrase) => {
  if (!sodium) await onCache;

  const keyWithSalt = await initKey(
    passphrase,
    sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES
  );

  let [salt, key] = [keyWithSalt.salt, keyWithSalt.key];

  let res = await sodium.crypto_secretstream_xchacha20poly1305_init_push(key);
  let [state_out, header] = [res.state, res.header];

  let encryptedData = await sodium.crypto_secretstream_xchacha20poly1305_push(
    state_out,
    data,
    null,
    sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
  );

  let storageData = new Uint8Array(
    encryptedData.length + salt.length + header.length
  );

  storageData.set(salt);

  storageData.set(header, salt.length);

  storageData.set(encryptedData, salt.length + header.length);

  return storageData;
};
```

如上面的代码所示的，我将随机生成的salt加到了加密后buffer的头部，这样在解密时就可以取出salt还原出Key。

解密代码如下所示：

```javascript
exports.decryptStream = async (data, passphrase) => {
  if (!sodium) await onCache;

  let offset = 0;

  const stream = new Uint8Array(data);

  const salt = stream.slice(offset, offset + sodium.crypto_pwhash_SALTBYTES);

  offset += sodium.crypto_pwhash_SALTBYTES;

  const header = stream.slice(
    offset,
    offset + sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES
  );

  offset += sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES;

  const encryptedStream = stream.slice(offset);

  const key = await genKey(
    salt,
    passphrase,
    sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES
  );

  let state_in = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
    header,
    key
  );

  let decryptedStream = sodium.crypto_secretstream_xchacha20poly1305_pull(
    state_in,
    encryptedStream
  );

  return decryptedStream.message;
};
```

- Q：如何对加密文件进行签名的：

- A：libsodium提供的签名算法使用了`Ed25519`算法，这是一种椭圆曲线算法，相较于传统的RSA算法生成公私钥对以及签名、验证的速度都要快。libsodium提供了两种签名模式：`Combined mode`,`Detached mode`。我选择了Combined mode，因为使用这种模式对文件进行签名，在验证签名成功后，能够拿到原始的文件内容，这用来给匿名用户下载分享文件再合适不过。因此我们的网盘发送给匿名用户的文件是一个签名文件，分享者需要公开自己的公钥，匿名用户拿到公钥和验证码之后才能对文件进行验证和解密。

- Q：直接对文件签名是否在计算速度上有影响

- A：上面提到`Ed25519`算法是一种[相对快速的算法](https://eprint.iacr.org/2021/471.pdf)，在我搜到资料中，获得如下数据
  
  ```bash
  $ dd if=/dev/urandom of=./data.bin bs=1024 count=1M
  1048576+0 records in
  1048576+0 records out
  1073741824 bytes (1.1 GB, 1.0 GiB) copied, 11.6213 s, 92.4 MB/s
  ```
  
  对于小于10MiB的文件进行签名速度应该绰绰有余了，并且在一些实际用libsodium编写的项目中，如[Krypto](https://www.kryptor.co.uk/tutorial#sign-files)，在当文件小于1GB时，都选择对文件直接进行Ed25519签名，而大于1GB则会采用`Ed25519ph`算法对签名文件做预哈希处理。综上，在设计签名时，为了保持简单与整合功能，网盘选择了对加密文件直接进行签名。

# 4认证功能的实现

需要登录认证的API，通过一个中间件对访问认证进行实现，代码如下所示：

```javascript
router
    .route('/')
    .post(authController.protect, fileController.checkType, fileController.checkPassphrase, fileController.uploadFiles)
    .get(authController.protect, fileController.getAll)
    .patch(authController.protect, fileController.update);

router
    .route('/:name')
    .get(authController.protect, fileController.checkPassphrase, fileController.download)
    .delete(authController.protect, fileController.delete);
```

其中`protect`中间件对cookie中存放的token进行用户、过期时间的校验。

```javascript
/**
 * A Middleware that checks whether the user is logged in
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @author BloodyOrangeMan
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
```
