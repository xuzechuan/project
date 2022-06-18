import { Button, Input, List } from 'antd';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInput } from './hooks';
import { InitState } from './store';

export default function Servers() {
  const ip: any = useInput('');
  const port: any = useInput('');
  const secret: any = useInput('');
  const servers = useSelector((state: InitState) => {
    return state.servers;
  });
  const dispatch = useDispatch();

  function addServer() {
    const newServers = [...servers, { ip: ip.value, port: port.value, secret: secret.value }];
    dispatch({
      type: 'updateServers',
      servers: newServers,
    });
    ip.clear();
    port.clear();
    secret.clear();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '300px', overflow: 'auto' }}>
        {servers.map((server: any, idx: number) => {
          return (
            <List
              size="large"
              header={<div>服务器</div>}
              bordered
              dataSource={[server.ip, server.port, server.secret]}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            ></List>
          );
        })}
      </div>

      <div style={{ flex: 1 }}>
        ip: <Input type="text" {...ip} />
      </div>
      <div>
        port: <Input type="text" {...port} />
      </div>
      <div>
        secret: <Input type="text" {...secret} />
      </div>

      <Button ghost={true} type="primary" size="large" onClick={addServer} style={{ marginTop: '20px' }}>
        添加
      </Button>
    </div>
  );
}
