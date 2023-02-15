import "whatwg-fetch";
import rpcBrowserClient from "jayson/lib/client/browser";
import { JSONRPCErrorLike, JSONRPCResultLike } from "jayson";

type ClientBrowserCallServerFunctionCallback = (
  err?: Error | null,
  response?: string
) => void;

type RpcError = JSONRPCErrorLike | null | undefined;

export enum RawDocType {
  Html = "Html",
  Url = "Url"
}

export enum RawDocSource {
  Cli = "Cli",
  WebExtension = "WebExtension"
}

export interface RawDocumentRequest {
  url: string;
  content: string;
  doc_type: RawDocType;
  source: RawDocSource,
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

export class SpyglassRpcClient {
  client: rpcBrowserClient = new rpcBrowserClient(callServer, {});

  add_raw_document(doc: RawDocumentRequest) {
    this.client.request(
      "spyglass_index.add_raw_document",
      { doc },
      (err: RpcError, result: JSONRPCResultLike) => {
        if (err) {
          throw err;
        }
      }
    );
  }
}
