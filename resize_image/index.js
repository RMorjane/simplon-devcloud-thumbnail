const Jimp = require('jimp');

module.exports = async function (context, myBlob) {

    context.log("Uploaded image detected");
    context.log("JavaScript blob trigger function processed blob \n Blob:", context.bindingData.blobTrigger, "\n Blob Size:", myBlob.length, "Bytes");

    const image = await Jimp.read(myBlob).then((image)=>{

        // const storageUrl = "https://morjanestore.blob.core.windows.net";
        const blobUrl = context.bindingData.blobTrigger;
        const blobPath = blobUrl.slice(0,blobUrl.lastIndexOf("/"));
        const blobName = blobUrl.slice(blobUrl.lastIndexOf("/")+1,blobUrl.lastIndexOf("."));
        const blobExtension = blobUrl.slice(blobUrl.lastIndexOf("."));

        console.log("file url : " + blobUrl);
        console.log(" file path : " + blobPath);
        console.log("file name : " + blobName);
        console.log("file extension : " + blobExtension);
        console.log("image : " + image);

        image.getBuffer(Jimp.AUTO,function(){
            console.log("Node.JS Blob Trigger function resized "+context.bindingData.blobTrigger + " to " + image.bitmap.width + "x" + image.bitmap.height);
            const thumbnail = image.clone();
            thumbnail.write(`${blobPath}/${blobName}_thumb${blobExtension}`);
            thumbnail.scale(0.5);
            context.bindingData.outputBlob = thumbnail;
            context.done();
        });

    }).catch(err =>{
        console.log(err);
    })

};