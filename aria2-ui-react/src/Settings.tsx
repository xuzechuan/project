import { Button, Input } from 'antd';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useAsync } from './hooks';
import { IProps } from './NewTask';

// react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const aria2OptionName: { [string: string]: string } = {
  'always-resume': '始终恢复',
};

export default function Settings({ client }: IProps) {
  const [option, setOption] = useState<any>(null);
  useEffect(() => {
    //@ts-ignore;
    client.getGlobalOption().then((option) => {
      setOption(option);
    });
    //@ts-ignore;
    client.getGlobalOption().then((a) => {
      console.log(a);
    });
  }, [client]);

  function saveOption() {
    // @ts-ignore;
    client.changeGlobalOption(option);
    toast('设置成功');
  }

  function setOneOption(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    console.log(e.target.value);
    setOption({
      ...option,
      [key]: e.target.value,
    });
  }

  if (option) {
    return (
      <div>
        <ToastContainer></ToastContainer>
        <div>
          下载路径(dir) <Input value={option['dir']} onChange={(e) => setOneOption(e, 'dir')}></Input>
        </div>
        <div>
          最大同时下载数(max-concurrent-downloads)
          <Input
            value={option['max-concurrent-downloads']}
            onChange={(e) => setOneOption(e, 'max-concurrent-downloads')}
          ></Input>
        </div>
        <div>
          最小速度限制(lowest-speed-limit) /KB
          <Input value={option['lowest-speed-limit']} onChange={(e) => setOneOption(e, 'lowest-speed-limit')}></Input>
        </div>
        {/* {Object.entries(option).map(([key, value]: [string, any]) => {
          return (
            <div key={key}>
              <span>{aria2OptionName[key] ?? key}</span>
              {value === 'true' || value === 'false' ? (
                <Input type="checkbox" checked={value === 'true'} onChange={(e) => setOneOption(e, key)} />
              ) : (
                <Input type="text" value={value} onChange={(e) => setOneOption(e, key)} />
              )}
            </div>
          );
        })} */}
        <Button onClick={saveOption}>保存</Button>
      </div>
    );
  }
  return <div>loading option...</div>;
}
