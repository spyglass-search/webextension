import "whatwg-fetch";
import rpcBrowserClient from "jayson/lib/client/browser";

type ClientBrowserCallServerFunctionCallback = (err?:Error | null, response?:string) => void;

function callServer(request: string, callback: ClientBrowserCallServerFunctionCallback) {
  const options = {
    method: "POST",
    body: request,
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.info(`calling: ${request}`);
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

export const client = new rpcBrowserClient(callServer, {});