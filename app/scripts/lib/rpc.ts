import "whatwg-fetch";
import rpcBrowserClient from "jayson/lib/client/browser";
import { JSONRPCErrorLike, JSONRPCResultLike } from "jayson";

type ClientBrowserCallServerFunctionCallback = (
  err?: Error | null,
  response?: string
) => void;

type RpcError = JSONRPCErrorLike | null | undefined;

interface RpcResponse {
  id: string;
  jsonrpc: string;
  result: object | string | boolean | null;
}

export enum RawDocType {
  Html = "Html",
  Url = "Url",
}

export enum RawDocSource {
  Cli = "Cli",
  WebExtension = "WebExtension",
}

export interface RawDocumentRequest {
  url: string;
  content: string;
  doc_type: RawDocType;
  source: RawDocSource;
  tags: Array<[string, string]>;
}

function callServer(
  request: string,
  callback: ClientBrowserCallServerFunctionCallback
) {
  const options = {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    },
  };

  fetch("http://localhost:4664", options)
    .then(function (res) {
      return res.text();
    })
    .then(function (text) {
      callback(null, text);
    })
    .catch(function (err) {
      callback(err);
    });
}

// todo: generate this from spyglass-rpc?
enum SpyglassApi {
  AddRawDocument = "spyglass_index.add_raw_document",
  DeleteDocumentByUrl = "spyglass_index.delete_document_by_url",
  IsDocumentIndexed = "spyglass_index.is_document_indexed",
}

export class SpyglassRpcClient {
  client: rpcBrowserClient = new rpcBrowserClient(callServer, {});

  _call(method: string, params: object): Promise<RpcResponse> {
    console.debug(method, params);
    return new Promise((resolve, reject) => {
      this.client.request(
        method,
        params,
        (err: RpcError, response: RpcResponse) => {
          if (err) {
            this.handle_error(err);
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  handle_error(err: RpcError) {
    if (err) {
      throw err;
    }
  }

  async add_raw_document(doc: RawDocumentRequest): Promise<void> {
    this._call(SpyglassApi.AddRawDocument, { doc });
  }

  async delete_document(url: string): Promise<void> {
    this._call(SpyglassApi.DeleteDocumentByUrl, { url });
  }

  async is_document_indexed(url: string): Promise<boolean> {
    let resp = await this._call(SpyglassApi.IsDocumentIndexed, { url });
    return resp.result as boolean;
  }
}
