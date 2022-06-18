import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useImmer } from 'use-immer';
import { useTasks } from './hooks';
import { IProps } from './NewTask';
import { InitState } from './store';

//antd
import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/lib/table';
interface Type {
  key: React.Key;
  fileName: string;
  size: string;

  downloadSpeed: string;
}

const columns: ColumnsType<Type> = [
  {
    title: '文件名',
    dataIndex: 'fileName',
  },
  {
    title: '大小',
    dataIndex: 'size',
    sorter: {
      compare: (a, b) => Number(a.size) - Number(b.size),
      multiple: 3,
    },
  },

  {
    title: '下载速度',
    dataIndex: 'downloadSpeed',
    sorter: {
      compare: (a, b) => Number(a.downloadSpeed) - Number(b.downloadSpeed),
      multiple: 3,
    },
  },
];

const onChange: TableProps<Type>['onChange'] = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};

const Waiting = ({ client }: IProps, ref: React.Ref<any>) => {
  const [data, updateData] = useImmer<Type[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const dispatch = useDispatch();
  const tasks = useSelector((state: InitState) => {
    return state.waitingTasks;
  });
  const selectedTasksGid = useSelector((state: InitState) => {
    return state.selectedTasksGid;
  });

  // 进来先将selectedTasksGid置为[]
  //Maximum update depth exceeded.
  useEffect(() => {
    dispatch({
      type: 'updateSelectedTasksGid',
      gid: [],
    });
  }, []);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  function onSelect(record: any, selected: any, selectedRows: any) {
    dispatch({
      type: 'updateSelectedTasksGid',
      gid: selectedRows.map((it: any) => {
        return tasks[it.key].gid;
      }),
    });
  }

  function onSelectAll() {
    dispatch({
      type: 'updateSelectedTasksGid',
      gid: tasks.map((task) => {
        return task.gid;
      }),
    });
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    onSelect,
    onSelectAll,
  };

  // 挂到<app />的listComp上，传给<Header />
  // 函数返回的对象会被挂到ref.current上
  useImperativeHandle(ref, () => ({
    whatPage: 'waiting',
  }));

  // useImperativeHandle(ref, )
  useEffect(() => {
    // 第一次渲染完成后立即执行一次;
    //@ts-ignore;
    client.tellWaiting(0, 100).then((tasks) => {
      dispatch({
        type: 'updateWaitingTasks',
        tasks: tasks,
      });
      updateData((draft) => {
        tasks.forEach((task: any, idx: any) => {
          draft.push({
            key: `${idx}`,
            fileName: task.files[0].path,
            size: task.totalLength,
            downloadSpeed: task.downloadSpeed,
          });
        });
      });
    });
    // 之后再1s请求一次
    const id = setInterval(async () => {
      //@ts-ignore;
      const tasks = await client.tellWaiting(0, 100);
      dispatch({
        type: 'updateWaitingTasks',
        tasks: tasks,
      });
    }, 2000);
    return () => {
      clearInterval(id);
      updateData((draft) => {
        draft = [];
      });
    };
  }, [client]);

  return (
    <div>
      <Table rowSelection={rowSelection} columns={columns} dataSource={data} onChange={onChange} />;
    </div>
  );
};
export default forwardRef(Waiting);
