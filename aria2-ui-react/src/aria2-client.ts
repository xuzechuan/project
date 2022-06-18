import EventEmitter from 'events';

// 创建一个和aria2.exe进行WebSocket连接
export default class Aria2Client extends EventEmitter {
  ws: WebSocket | null;

  id: number;
  // 记录每一个id请求对应的回调函数
  callbacks: {
    [id: number]: (data: any) => void;
    // 初始值，相当与this.callbacks = {};
  } = {};
  readyPromise: Promise<Aria2Client>;
  constructor(public ip: string = '127.0.0.1', public port: number | string, public secret: number | string) {
    super();
    const url = `ws://${ip}:${port}/jsonrpc`;
    this.id = 1;
    this.ws = null;

    // ws连接建立成功,promise resolve(Aria2Client)
    this.readyPromise = new Promise((resolve, reject) => {
      // 创建一个ws对象，并且和aria2创立连接
      // url格式错误，WebSocket会同步抛错；
      this.ws = new WebSocket(url);
      // 回调是宏任务，会在下一次事件循环后调用
      this.ws.addEventListener('open', (e) => {
        // 连接成功，resolve自己，方便后序调用函数
        resolve(this);
      });
      this.ws.addEventListener('error', (e) => {
        reject(this);
      });
    });

    // aria2返回数据，触发message事件
    // @ts-ignore;
    this.ws.addEventListener('message', (e) => {
      // aria2返回的数据
      const data = JSON.parse(e.data);
      const id = data.id;
      // 有id 发送addUri...给aria2返回的数据
      if (id) {
        const callback = this.callbacks[id];
        callback(data);
        delete this.callbacks[id];
        // aria2主动发的onDownloadStart, onDownloadError，没有id
      } else {
        const eventName = data.method.slice(8);
        this.emit(eventName, ...data.params);
      }
    });
  }

  // 如果readyPromise fulfilled,说明连接成功
  ready() {
    return this.readyPromise;
  }
  destroy() {
    this.ws?.close();
  }
}

const aria2Methods = [
  'addUri',
  'addTorrent',
  'getPeers',
  'addMetalink',
  'remove',
  'pause',
  'forcePause',
  'pauseAll',
  'forcePauseAll',
  'unpause',
  'unpauseAll',
  'forceRemove',
  'changePosition',
  'tellStatus',
  'getUris',
  'getFiles',
  'getServers',
  'tellActive',
  'tellWaiting',
  'tellStopped',
  'getOption',
  'changeUri',
  'changeOption',
  'getGlobalOption',
  'changeGlobalOption',
  'purgeDownloadResult',
  'removeDownloadResult',
  'getVersion',
  'getSessionInfo',
  'shutdown',
  'forceShutdown',
  'getGlobalStat',
  'saveSession',
  // 'system.multicall',
  // 'system.listMethods',
  // 'system.listNotifications',
];

/**
 * 给Aria2Client.prototype加调用aria2.exe的函数;
 * @date 2022-06-08
 * @param {any} any[];
 * @returns {any} Promise resolve,reject的为aria2响应数据的data
 */
aria2Methods.forEach((methodName) => {
  // @ts-ignore 无视类型判断
  Aria2Client.prototype[methodName] = function (...args: any[]) {
    return this.ready().then(() => {
      return new Promise((resolve, reject) => {
        const id = this.id++;
        function callback(data: any) {
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data.result);
          }
        }
        // 把回调函数传入栈
        this.callbacks[id] = callback;
        // 给aria2.exe发送jsonrpc
        // @ts-ignore
        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            method: 'aria2.' + methodName,
            params: [`token:${this.secret}`, ...args],
          })
        );
      });
    });
  };
});
