module.exports = async function (context, myBlob) {

    context.log("Uploaded image detected");
    context.log("JavaScript blob trigger function processed blob \n Blob:", context.bindingData.blobTrigger, "\n Blob Size:", myBlob.length, "Bytes");

    const name_thumb = `${name_s}_thumb.${name_ext}`;
    const path_file = uri.substring(0, uri.lastIndexOf("/"));

    const image = await Jimp.read(myBlob).then((image) => {
        const thumbnail = image
            .clone()
            .rezise(200, Jimp.AUTO)
            .quality(50)
            .write(`${path_file}/${name_thumb}`);
        context.log("image resized");
    }).catch(err => {
        context.log(err);
    })

};