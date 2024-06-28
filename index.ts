
import { init, runWasix, RunOptions, Directory } from "@wasmer/sdk";
import moduleUrl from "./static/main.wasm?url";
import * as XLSX from 'xlsx';
import { Buffer } from 'buffer'


var outputData;

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


async function runModule(module: WebAssembly.Module) {
    // 入力ファイルの準備 1 ファイルをfetchで取得
    const fetchresult = await fetchAsync({
        url: "./static/input.txt",
        options: {}
    })

    // 入力ファイルの準備 2 wasmer DirectoryにWrite
    const dir = new Directory();
    await dir.writeFile("input.txt", fetchresult);

    // wasm実行オプション
    const option: RunOptions = {args: ["arg input"], mount: {"/static": dir}};

    // wasm実行
    const instance = await runWasix(module, option);
    
    // 実行中のwasmへの標準入力からの入力
    const encoder = new TextEncoder();
    const stdin = instance.stdin.getWriter();
    await stdin.write(encoder.encode("stdin input\n"));
    await stdin.close();

    // 実行完了までwait
    const result = await instance.wait();
    if (result.stderrBytes) {
        console.log(new TextDecoder().decode(new Uint8Array(result.stderrBytes)));
    }

    // 実行結果取得 1 標準出力
    const message = new TextDecoder().decode(new Uint8Array(result.stdoutBytes));
    console.log(message);

    // 実行結果取得 2 ファイル出力
    const bytes = await dir.readFile("/output.json");
    console.log(new TextDecoder().decode((bytes)))
    outputData = bytes;

    return result.ok ? message : null;;
}

async function main() {
    const module = await initialize();
    const message = await runModule(module);
}

const  downloadButton = document.getElementById("download")!
downloadButton.onclick = function() {
    if (outputData !== null) {
        const jsonString = Buffer.from(outputData).toString('utf8')
        const parsedData = JSON.parse(jsonString)

        let exportBook = XLSX.utils.book_new()
        let sexportSheet = XLSX.utils.json_to_sheet(parsedData)
        XLSX.utils.book_append_sheet(exportBook, sexportSheet, "sheetName")
        XLSX.writeFile(exportBook, "sample.xlsx")
    }
};

main();