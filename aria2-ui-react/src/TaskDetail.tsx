import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAsync } from './hooks';
import { IProps } from './NewTask';

export default function TaskDetail({ client }: IProps) {
  // 每次渲染都能获得最新的值
  const params = useParams();
  // useAsync可以拿到异步函数的promise resolve的值
  const { pending, value: task } = useAsync(
    useCallback(async () => {
      // 每一个下载任务都有一个gid,可以通过gid获取对应任务的信息
      // @ts-ignore;
      return await client.tellStatus(params.gid);
    }, [])
  );

  if (task) {
    return <div>任务名称：{task.files[0].path}</div>;
  }
  if (pending) {
    return <div>Loading。。。</div>;
  }


  return null;
}


