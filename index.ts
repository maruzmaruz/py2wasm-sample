
import { init, runWasix, RunOptions, Directory } from "@wasmer/sdk";
import moduleUrl from "./static/main.wasm?url";
import * as XLSX from 'xlsx';
import { Buffer } from 'buffer'


var downloadBlob, downloadURL;
var newfileBytes;

async function initialize() {
    await init();
    return WebAssembly.compileStreaming(fetch(moduleUrl));
}

async function fetchAsync (request: FetchRequest): Promise<string> {
    return await fetch(request.url, request.options)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
  
        return await response.blob()
      })
      .then(async (response) => {
        return await response.text()
      })
  }

async function writeFileToDirectory (fetchURL: string, filePath: string): Promise<Directory> {
    const result = await fetchAsync({
        url: fetchURL,
        options: {}
    })
    console.log("fetch " + result);

    const dir = new Directory();
    await dir.writeFile(filePath, result);
    return dir;
}

async function runModule(module: WebAssembly.Module) {
    // const dir = new Directory();
    // await dir.writeFile("/file.txt", "Hello, World!");
    const dir = await writeFileToDirectory("./static/sample.bin", "sample.bin");

    const option: RunOptions = {args: ["/mount/sample.bin"], mount: {"/mount": dir}};
    const instance = await runWasix(module, option);
    // const stdout = instance.stdout.getReader();
    
    const encoder = new TextEncoder();
    
    // const stdin = instance.stdin.getWriter();
    // await stdin.write(encoder.encode("100\n"));
    // await stdin.close();

    const result = await instance.wait();
    if (result.stderrBytes) {
        console.log(new TextDecoder().decode(new Uint8Array(result.stderrBytes)));
    }
    const message = new TextDecoder().decode(new Uint8Array(result.stdoutBytes));
    const bytes = await dir.readFile("/newfile.json");
    console.log(new TextDecoder().decode((bytes)))
    newfileBytes = bytes;

    return result.ok ? message : null;;
}

async function main() {
    console.log("index.ts main")
    const module = await initialize();
    const message = await runModule(module);
    if (message) {
        console.log(message)
    }

}

const  downloadButton = document.getElementById("download")!
downloadButton.onclick = function() {
    if (newfileBytes !== null) {
        const jsonString = Buffer.from(newfileBytes).toString('utf8')
        const parsedData = JSON.parse(jsonString)

        let exportBook = XLSX.utils.book_new()
        let sexportSheet = XLSX.utils.json_to_sheet(parsedData)
        XLSX.utils.book_append_sheet(exportBook, sexportSheet, "sheetName")
        XLSX.writeFile(exportBook, "sample.xlsx")
        // downloadBlob(newfileBytes, 'sample.xlsx', 'application/octet-stream')
    }
};

// downloadBlob = function(data, fileName, mimeType) {
//     var blob, url;
//     blob = new Blob([data], {
//         type: mimeType
//     });
//     url = window.URL.createObjectURL(blob);
//     downloadURL(url, fileName);
//     setTimeout(function() {
//         return window.URL.revokeObjectURL(url);
//     }, 1000);
// };

// downloadURL = function(data, fileName) {
//     var a;
//     a = document.createElement('a');
//     a.href = data;
//     a.download = fileName;
//     document.body.appendChild(a);
//     a.style = 'display: none';
//     a.click();
//     a.remove();
// };

main();