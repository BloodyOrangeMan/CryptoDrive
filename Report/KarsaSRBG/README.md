## 实验报告

### 负责部分

* 本地文件验证解密

### 具体工作

* 在页面中输入验证码(verification code)和公钥(public key)，并上传加密的图片

  * verification code通过链接分享随机生成

* 在点击submit之后，执行handleFile，利用公钥对文件的签名进行解密

  ```javascript
  const handleFile = async (file) => {
  
          const bufferArray=await file.arrayBuffer();
          const buffer=new Uint8Array(bufferArray);
          
          const pk = Buffer.from(publicKey, 'base64'); 
  //利用公钥对文件的签名进行解密
          const raw=await openSignStream(buffer,pk);
  //解密签名后，对文件进行解密
          const decryptedstream=await decryptStream(raw,verificationCode);
  //将解密后的二进制数据保存为原文件
          saveByteArray(decryptedstream, file.name.slice(0,-4) ,file.name.slice(-7,-4));
          
  
          return false;
      }
  ```

  ```javascript
  const openSignStream = async (sign, pk) => {
          if (!sodium) await onCache;
          const publicKey = Buffer.from(pk, 'base64'); 
          const raw = sodium.crypto_sign_open(sign, publicKey)
  
          if(raw==undefined){
              setsignStatus("Signature verication failed");
          }
          else{
              setsignStatus("Signature verication success");
          }
          return raw;
      }
  ```

  

* 解密签名后，对文件进行解密

  * 利用slice，将二进制数据流(stream)中的header、salt、hash分离出来，对原文件的二进制数据利用libsodium中的接口进行解密

  ```javascript
  const decryptStream = async (data, passphrase) => {
          if (!sodium) await onCache;
        
          let offset = 0;
        
          const stream = new Uint8Array(data);
          const salt = stream.slice(offset, offset + sodium.crypto_pwhash_SALTBYTES);
          console.log("salt:",salt);
              offset += sodium.crypto_pwhash_SALTBYTES;
      
              const header = stream.slice(
                  offset,
                  offset + sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES
              );
              console.log("header:",header);
              offset += sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES;
              const hash = stream.slice(
                  offset,
                  offset + 32
              );
              console.log("hash:",hash);
              offset += 32;
              const encryptedStream = stream.slice(offset);
              console.log("encryptedStream:",encryptedStream);
          const key = await genKey(
            salt,
            passphrase,
            sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES
          );
          console.log("key:",key);
          let state_in =await sodium.crypto_secretstream_xchacha20poly1305_init_pull(
            header,
            key
          );
          console.log("state_in:",state_in);
          const decryptedStream =await sodium.crypto_secretstream_xchacha20poly1305_pull(
            state_in,
            encryptedStream
          );
              console.log("decryptedStream.message:",decryptedStream.message);
              
              if(decryptedStream==false){
                  setdecryptionStatus("Decryption failed");
              }
              else{
                  setdecryptionStatus("Decryption success");
              }
      
          return decryptedStream.message;
        };
  ```

  

* 对解密后的二进制数据保存为原文件

  ```javascript
  const imageType = {
      png: "image/png",
      jpg: "image/jpg",
      tif: "image/tiff",
      bmp: "image/bmp",
      gif: "image/gif",
      svg: "image/svg+xml",
      webp: "image/webp",
      pdf: "application/pdf",
      docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls:".xls",
      xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      doc:"application/msword"
  
   };
  var saveByteArray =  (function () {
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          
          return function (data, name,str) {
             var blob = new Blob([data], {type: imageType[str]}),
                  url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = name;
              a.click();
              window.URL.revokeObjectURL(url);
          };
      }());
  ```

  