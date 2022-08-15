import { useState, useEffect } from 'react';
import _sodium from 'libsodium-wrappers';
import { UploadOutlined} from '@ant-design/icons';
import { Button, message, Upload, Form, Input, Space } from 'antd';
import React from 'react';



let sodium;
const imageType = {
    png: "image/png",
    jpg: "image/jpg",
    tif: "image/tiff",
    bmp: "image/bmp",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp"
 };
const onCache = (async () => {
    await _sodium.ready;
    sodium = _sodium;
})();



const Share = () => {
    const [publicKey, setpublicKey]=useState();
    const [verificationCode, setverificationCode]=useState();
    const [signStatus, setsignStatus]=useState("Signature has not been verificated");
    const [decryptionStatus, setdecryptionStatus]=useState("Decryption has not been operated");

    const [form] = Form.useForm();

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
    
    const genKey = async (salt, passphrase, length) => {
        if (!sodium) await onCache;
        const key = await sodium.crypto_pwhash(
          length,
          passphrase,
          salt,
          sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
          sodium.crypto_pwhash_ALG_ARGON2ID13
        );
      
        return key;
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


    const handleFile = async (file) => {


        const offset=0;

        const bufferArray=await file.arrayBuffer();
        const buffer=new Uint8Array(bufferArray);
        
        console.log("buffer:",buffer);
        const pk = Buffer.from(publicKey, 'base64'); 
        console.log(publicKey);
        console.log(pk);
        console.log("sodium:",sodium);
        const raw=await openSignStream(buffer,pk);
        console.log("raw:",raw);
        

       
        


        const decryptedstream=await decryptStream(raw,verificationCode);
        saveByteArray(decryptedstream, file.name.slice(0,-4) ,file.name.slice(-7,-4));
        

        console.log("filename",file.name.slice(-7,-4));
        console.log("decryptedstream",decryptedstream);
        // await saveByteArray(decryptedstream, 'example.txt');
        // if(decryptedstream==undefined){
        //     await decryptStream(raw,verificationCode);
        //     saveByteArray(decryptedstream, 'example.txt');
        // }
        //console.log(buffer);
        // Prevent upload
        return false;
    }

return(
    <>
    <div className="div1">
 <Form
        form={form} 
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        >
            
          <Form.Item
          name="verificationCode"
          label="Verification Code"
          rules={[
            {
              required: true,
              message: "Please input your verification code!",
            },
          ]}
          hasFeedback>
            <Input onChange={(e) => {
						setverificationCode(e.target.value);
					}}/>
                    
          </Form.Item>

          <Form.Item
          name="publicKey"
          label="PublicKey"
          rules={[
            {
              required: true,
              message: "Please input file owner's public key!",
            },
          ]}>
            <Input onChange={(e) => {
						setpublicKey(e.target.value);
					}}/>
          </Form.Item>
          

</Form>

<Upload
    
    showUploadList={false}
    beforeUpload={(file)=>handleFile(file)}
    
    
>
    <Button>
         Click to Upload
    </Button>

</Upload> 

<p>
    {signStatus}
    <br/>
    {decryptionStatus}
</p>
</div>
</>




)};



export default Share;