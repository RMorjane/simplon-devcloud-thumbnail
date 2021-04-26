const Jimp = require('jimp');
var fs = require("fs");
var pkgcloud = require('pkgcloud');
require('dotenv').config();

var uploaded = false;
var file,thumbnail_file;

module.exports = async function (context, myBlob) {

    context.log("Uploaded image detected");
    context.log("JavaScript blob trigger function processed blob \n Blob:", context.bindingData.blobTrigger, "\n Blob Size:", myBlob.length, "Bytes");

    if(! uploaded){
        const image = await Jimp.read(myBlob).then((image)=>{

            const blobUrl = context.bindingData.blobTrigger;
            const blobPath = blobUrl.slice(0,blobUrl.lastIndexOf("/"));
            const blobName = blobUrl.slice(blobUrl.lastIndexOf("/")+1,blobUrl.lastIndexOf("."));
            const blobExtension = blobUrl.slice(blobUrl.lastIndexOf("."));

            console.log("file url : " + blobUrl);
            console.log("file path : " + blobPath);
            console.log("file name : " + blobName);
            console.log("file extension : " + blobExtension);
            console.log("image : " + image);

            image.getBuffer(Jimp.AUTO,function(){
                console.log("Node.JS Blob Trigger function resized "+context.bindingData.blobTrigger + " to " + image.bitmap.width + "x" + image.bitmap.height);
                const thumbnail = image.clone();
                file = `${blobName}${blobExtension}`;
                thumbnail_file = `${blobName}_thumb${blobExtension}`;
                thumbnail.write(file);
                thumbnail.scale(0.5);
                thumbnail.write(thumbnail_file);
                uploadBlobStorage(thumbnail_file,process.env.AZURE_STORAGE_CONTAINER_NAME);
                context.done();
            });

        }).catch(err =>{
            console.log(err);
        });
        uploaded = !uploaded;       
    }


};

async function uploadBlobStorage(filename,containerName){

    var client = pkgcloud.storage.createClient({
        provider: 'azure',
        storageAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME,
        storageAccessKey: process.env.AZURE_STORAGE_ACCOUNT_KEY
    });
      
    var readStream = fs.createReadStream(filename);
    var writeStream = client.upload({
        container: containerName,
        remote: filename
    });
      
    writeStream.on('error', function (err) {
        console.log("failed to upload file in azure storage : ",err);
    });
      
    writeStream.on('success', function (file) {
        console.log(file," uploaded successfully");
        send_attachments();
    });
      
    readStream.pipe(writeStream);

};

function send_attachments(){
    const nodemailer = require('nodemailer');
    const path = require('path');

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER_LOGIN,
            pass: process.env.GMAIL_USER_PASSWORD
        }
    });

    const message = {
        from: process.env.GMAIL_USER_LOGIN,
        to: 'rhellabmorjane@gmail.com',
        subject: 'Uploaded image and thumbnail',
        attachments: [
            {
                path: path.resolve(__dirname + '/../',file)
            },
            {
                path: path.resolve(__dirname + '/../',thumbnail_file)
            }
        ]
    };

    transport.sendMail(message,function(err){
        if(err){
            console.log('Failed to send email : ',err);
            return;
        }
        console.log('Email sent successfully');
    });
}