import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Aria2Client from './aria2-client';
import { InitState } from './store';
import { DownloadOutlined, DeleteFilled, DownSquareOutlined, FileExcelOutlined } from '@ant-design/icons';

interface IProps {
  listComp: any;
  client: Aria2Client;
}
export default function Header({ listComp, client }: IProps) {
  // hook,把副作用的函数勾到纯函数组件Header里面
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTasksGid, stoppedTasks, activeTasks, waitingTasks } = useSelector((state: InitState) => {
    return state;
  });

  // listComp在渲染过程中可能为空，在useEffect调用才不为空
  // console.log(listComp)
  function goNew() {
    navigate('/new');
  }
  // 删除选中的任务
  async function deleteSelectedTasks() {
    listComp.current.clear([]);

    if (listComp.current.whatPage == 'stopped') {
      let done = selectedTasksGid.map((gid) => {
        //@ts-ignore;
        return client.removeDownloadResult(gid);
      });
      await Promise.all(done);
    } else {
      let done = selectedTasksGid.map((gid) => {
        //@ts-ignore;
        return client.remove(gid);
      });
      await Promise.all(done);
    }
    dispatch({
      type: 'updateSelectedTasksGid',
      gid: [],
    });

    if (listComp.current.whatPage === 'downloading') {
      //@ts-ignore
      const tasks = await client.tellActive();
      dispatch({
        type: 'updateActiveTasks',
        tasks,
      });
    } else if (listComp.current.whatPage === 'waiting') {
      //@ts-ignore
      const tasks = await client.tellWaiting(0, 100);
      dispatch({
        type: 'updateWaitingTasks',
        tasks,
      });
    } else if (listComp.current.whatPage === 'stopped') {
      //@ts-ignore
      const tasks = await client.tellStopped(0, 100);
      dispatch({
        type: 'updateStoppedTasks',
        tasks,
      });
    }
  }
  // 执行暂定中的任务
  async function proceed() {
    let done = selectedTasksGid.map((gid) => {
      //@ts-ignore;
      return client.unpause(gid);
    });
    await Promise.all(done);
    navigate('/downloading');
    dispatch({
      type: 'updateSelectedTasksGid',
      gid: [],
    });

    //@ts-ignore
    const tasks = await client.tellWaiting(0, 100);
    dispatch({
      type: 'updateWaitingTasks',
      tasks,
    });
  }

  // 执行暂定中的任务
  async function pause() {
    let done = selectedTasksGid.map((gid) => {
      //@ts-ignore;
      return client.pause(gid);
    });
    await Promise.all(done);
    navigate('/waiting');
    dispatch({
      type: 'updateSelectedTasksGid',
      gid: [],
    });

    //@ts-ignore
    const tasks = await client.tellStopped(0, 100);
    dispatch({
      type: 'updateStoppedTasks',
      tasks,
    });
  }

  function deleteAllStoppedTasks() {
    // @ts-ignore;
    client.purgeDownloadResult();
  }

  return (
    <div>
      <Button onClick={goNew} icon={<DownloadOutlined />} type="primary" shape="round" size="large">
        Download
      </Button>
      {selectedTasksGid.length > 0 && listComp.current.whatPage === 'downloading' && (
        <Button
          onClick={pause}
          icon={<DownloadOutlined />}
          style={{ marginLeft: '20px' }}
          ghost={true}
          shape="round"
          size="large"
        >
          Pause
        </Button>
      )}
      {selectedTasksGid.length > 0 && listComp.current.whatPage === 'waiting' && (
        <Button
          onClick={proceed}
          icon={<DownloadOutlined />}
          style={{ marginLeft: '20px' }}
          ghost={true}
          shape="round"
          size="large"
        >
          continue
        </Button>
      )}
      {selectedTasksGid.length > 0 && listComp.current.whatPage === 'stopped' && (
        <Button
          icon={<DeleteFilled />}
          ghost={true}
          size="large"
          onClick={deleteSelectedTasks}
          style={{ marginLeft: '20px' }}
        >
          Delete
        </Button>
      )}
      {stoppedTasks.length > 0 && listComp.current?.whatPage == 'stopped' && (
        <Button
          size="large"
          icon={<FileExcelOutlined />}
          style={{ marginLeft: '20px' }}
          ghost={true}
          onClick={deleteAllStoppedTasks}
        >
          DeleteAll
        </Button>
      )}
    </div>
  );
}
