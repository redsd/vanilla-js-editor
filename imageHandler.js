export class ImageHandler{

    /**
     *
     * @param img
     *  img element
     * @returns {string}
     *  return base64 reencoded image
     */
    static compressImageByRatio(imgDataUrl, maxWidth, fileType, quality = 80){
        return new Promise((resolve, reject)=> {
            const img = document.createElement("img");
            let newDataUrl = null;
            img.onload = function () {
                const realMaxWidth = !maxWidth || img.width < maxWidth ? img.width : maxWidth;
                const ratio = realMaxWidth / img.width;
                // Dynamically create a canvas element
                const canvas = document.createElement("canvas");
                canvas.width = realMaxWidth;
                canvas.height = img.height * ratio;

                // var canvas = document.getElementById("canvas");
                const ctx = canvas.getContext("2d");

                // Actual resizing
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                // Show resized image in preview element
                console.log({quality});
                newDataUrl = canvas.toDataURL(fileType, quality/100);
                resolve(newDataUrl);
            }
            img.src = imgDataUrl;
        });
    }

    static resizeImage(el){
        const img = el.target;
        const imgCurWidth = img.width;
        img.style.width = '100%';
        const imgMaxSize = img.width;
        img.style.width = null;
        img.width = imgCurWidth;

        const currentPerc = Math.round(imgCurWidth/imgMaxSize*100);

        let size = prompt("Image size in %", currentPerc);
        if(size){
            size = size.replace('%', '');
            img.style.width = size+'%';
            return size;
        }
        return null;
    }
}
