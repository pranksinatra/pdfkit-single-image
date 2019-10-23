importScripts("blob-stream.min.js", "pdfkit-only-images.min.js");

onmessage = function (event) {
  generatePdf(event.data);
}

var getResult;
function generatePdf({ image, width, height }) {
  var doc = new PDFDocument({ autoFirstPage: false });
  var stream = doc.pipe(blobStream());
  stream.on("finish", function () {
    self.postMessage(getResult());
  });

  var startTime = Date.now();

  // Add first page
  doc.addPage({ layout: 'portrait', size: [width, height] });

  // Add image
  getValidImageData(image)
    .then((validImage) => {
      doc.image(validImage, 0, 0, { width, height })
      getResult = () => ({
        type: "success",
        content: stream.toBlob("application/pdf")
      });
    })
    .catch((error) => {
      getResult = () => ({
        type: "error",
        content: error,
      });
    })
    .then(() => {
      doc.end();
      console.log('Generated file:', Date.now() - startTime);
    })
}

function getValidImageData(image) {
  // Array Buffer
  if (image instanceof ArrayBuffer) return Promise.resolve(image);
  // Base64 string
  if (/^data:.+;base64,/.test(image)) return Promise.resolve(image);
  // Blob (needs converted)
  console.time('Image Blob -> Array Buffer')
  if (image instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        console.timeEnd('Image Blob -> Array Buffer')
        resolve(reader.result);
      }, false);
      reader.onerror = () => {
        return reject('Unable to read image Blob');
      };
      reader.readAsArrayBuffer(image);
    })
  }
  return Promise.reject('Invalid image');
}