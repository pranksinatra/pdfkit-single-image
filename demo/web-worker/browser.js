var worker = new Worker("generate-pdf-worker.js");

worker.addEventListener("message", function (ev) {
  if (ev.data.type === 'success' && ev.data.content instanceof Blob) {
    console.log(ev.data)
    const pdfBlob = ev.data.content;
    console.timeEnd('Got PDF blob from worker');

    document.querySelector('iframe').src = URL.createObjectURL(pdfBlob);

    const button = document.getElementById('download_pdf_button');
    button.disabled = false;
    button.addEventListener('click', () => { saveAs(pdfBlob, "file.pdf"); });

  } else {
    console.error('Error', ev.data);
  }

});

// const imageURL = '../images/test.jpeg';
const imageURL = '../images/44mb.jpg';
// const imageURL = '../images/18mb.png';

const type = imageURL.split('.').pop();

console.time(`Got ${type} image blob`);
fetch(imageURL)
  .then(res => res.blob())
  .then((image) => {
    console.timeEnd(`Got ${type} image blob`);
    worker.postMessage({ image, width: 1000, height: 1000 });
    console.time('Got PDF blob from worker');
  })
