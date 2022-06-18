import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Aria2Client from './aria2-client';

export function useInput(init = '') {
  var [value, setValue] = useState(init);

  function onChange(e: any) {
    var target = e.target;

    setValue(target.value);
  }

  function clear() {
    setValue('');
  }

  var ret = {
    value,
    onChange: useCallback(onChange, []),
    // clear: useCallback(clear, []),
  };
  // 不可枚举，展开运算符不会展开
  Object.defineProperty(ret, 'clear', {
    value: useCallback(clear, []),
    enumerable: false,
  });

  return ret;
}

/**
 * 每隔一段时间发送asia2.method，收到响应后setTasks(tasks)
 * @date 2022-06-08
 * @param {any} getTasks 返回一个promise,resolve（多个下载任务组成的数组）
 * @returns {any}
 */
export function useTasks(getTasks: () => Promise<any>, interval: number, client?: Aria2Client) {
  // 在初始渲染期间，返回的状态 (state) 与传入的第一个参数 (initialState) 值相同。
  // 在后续的重新渲染中，useState 返回的第一个值将始终是更新后最新的 state
  // setTasks 始终不变
  const [tasks, setTasks] = useState<any[]>([]);

  // 可以传入默认值，和useState类似，只在第一次渲染有效
  const ref = useRef<typeof getTasks>(getTasks);
  // 确保每次传入的函数都是新的
  ref.current = getTasks;

  // 切换服务器，任务队列清空
  useEffect(() => {
    setTasks([]);
  }, [client])

  // 副作用，回调函数，第一次渲染完成之后调用
  useEffect(() => {
    ref.current().then((tasks) => {
      // setState 函数用于更新 state。它接收一个新的 state 值并将组件的一次重新渲染加入队列。
      // 相当于调用一次setTask,重新刷新一次函数组件
      setTasks(tasks);
    });
    const id = setInterval(() => {
      ref.current().then((tasks) => {
        setTasks(tasks);
      });
      return () => clearInterval(id);
    }, interval);
    // 依赖为[]，只在第一次渲染的时候调用
  }, [client]);
  return tasks;
}

// 执行异步函数，返回resolve的value和一些状态
export function useAsync(asyncFunction: () => Promise<any>, immediate = true) {
  const [pending, setPending] = useState<boolean>(false);
  const [value, setValue] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // useCallback ensures useEffect is not called on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    setError(null);
    setPending(true);
    setValue(null);

    return asyncFunction()
      .then((response) => setValue(response))
      .catch((err) => setError(err))
      .finally(() => setPending(false));
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    error,
    execute,
    pending,
    value,
  };
}


