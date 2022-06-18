import { Button, Input } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Aria2Client from './aria2-client';
import { useInput } from './hooks';

import { UploadOutlined } from '@ant-design/icons';
// 对象有一个client属性
export interface IProps {
  client: Aria2Client;
}

export default function NewTask({ client }: IProps) {
  // uris {value, onChange} textarea触发onChange事件会setValue;
  const uris = useInput('');
  const downloadSpeed = useInput('10k');
  const navigate = useNavigate();

  function start() {
    if (torrentFile) {
      const reader = new FileReader();
      reader.onload = function () {
        if (typeof reader.result === 'string') {
          // result === 'data: safasfasdf; base64,'
          const base64Idx = reader.result.indexOf('base64');
          const torrentBase64 = reader.result.slice(base64Idx + 7);
          // @ts-ignore;
          client.addTorrent(torrentBase64);
          navigate('/downloading');
        }
      };
      reader.readAsDataURL(torrentFile);
    } else {
      const links = uris.value
        .split('\n')
        .map((it) => it.trim())
        .filter((it) => it);
      // 为每一个链接创建一个下载任务
      for (let link of links) {
        // @ts-ignore
        client.addUri([link], {
          'max-download-limit': downloadSpeed.value,
        });
      }
      navigate('/downloading');
    }
  }
  const [torrentFile, setTorrentFile] = useState<File | null>(null);
  function onBTFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    // 可能为null就会报错，这是预编译
    if (e.target.files) {
      setTorrentFile(e.target.files[0] ?? null);
    }
  }
  return (
    <div>
      <div style={{ margin: '10px' }}>
        DownloadSpeed: <input type="text" {...downloadSpeed} />
      </div>
      <div style={{ margin: '10px' }}>
        bt种子:
        <input type="file" onChange={onBTFileSelect} style={{ display: 'inline-block' }} />
      </div>
      <div>
        <div>下载链接,一行一个：</div>
        <textarea cols={278} rows={10} {...uris}></textarea>
      </div>
      <Button onClick={start} type="primary" size="large">
        开始下载
      </Button>
    </div>
  );
}
