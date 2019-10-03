import { RpcCommon } from "../rpc-common";

export class RpcBrowser extends RpcCommon {
  functions: Function[]; // functions that can be called from the webview.
  context: any;

  constructor(context: any, functions: any) {
    super();
    this.callbacks = [];
    this.context = context;
    this.functions = functions;
    context.window.addEventListener('message', event => {
      const message = event.data;

      if (message.command === 'rpc') {
        if (this.callbacks[message.id]) {
          this.callbacks[message.id](message.ret);
          this.callbacks[message.id] = undefined;
        } else if (this.functions[message.method]) {
          let ret = this.functions[message.method](message.params);
          //support async and sync
          if (ret && ret.then) {
            ret.then((res) => {
              // return the result
              this.postMessage(message.id, message.method, message.params, res);
            });
          }
          else {
            this.postMessage(message.id, message.method, message.params, ret);
          }
        }
      }
    });
  }

  postMessage(id: number, method: string, params: any[], res?: any) {
    //@ts-ignore
    window.vscode.postMessage({
      command: 'rpc',
      id: id,
      method: method,
      params: params,
      ret: res
    }, '*');
  }

}