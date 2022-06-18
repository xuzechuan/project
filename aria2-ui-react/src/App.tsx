import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
// react-router React路由
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';

import Aria2Client from './aria2-client';

// 组件
import Downloading from './Downloading';
import Waiting from './Waiting';
import NewTask from './NewTask';
import Header1 from './Header';
import Stopped from './Stopped';
import TaskDetail from './TaskDetail';
import Settings from './Settings';
import Servers from './servers';

// react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// antd
import { LikeOutlined } from '@ant-design/icons';

import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  DownCircleOutlined,
  TeamOutlined,
  UserOutlined,
  CloudDownloadOutlined,
  DownSquareOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, Dropdown, Layout, Menu, MenuProps, Row, Space, Statistic } from 'antd';
import { Content, Footer, Header } from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import { Progress } from 'antd';
import { useSelector } from 'react-redux';
import { InitState } from './store';

function App() {
  // useRef创建一个ref
  // 传给forwardRef化过的组件
  // 在组件内部用useImperativeHandle将内部属性或者方法传给ref
  /**
   * listComp.current = {
    selectAll: function () {
      taskContext.setSelectedTasks(tasks);
    }
   */
  const listComp = useRef();
  const [connectState, setConnectState] = useState('连接中');
  const [globalStat, setGlobalStat] = useState<any>({
    numActive: 0,
    numWaiting: 0,
    numStopped: 0,
    uploadSpeed: 0,
    downloadSpeed: 0,
  });
  const servers = useSelector((state: InitState) => {
    return state.servers;
  });

  const [aria2, setAria2] = useState(new Aria2Client('127.0.0.1', '11000', '111222333'));

  useEffect(() => {
    setConnectState('连接中');
    aria2.ready().then(
      () => {
        setConnectState((connectState) => {
          if (connectState === '连接中') {
            return '已连接';
          }
          return connectState;
        });
      },
      () => {
        setConnectState((connectState) => {
          if (connectState === '连接中') {
            return '连接失败';
          }
          return connectState;
        });
      }
    );

    let id: NodeJS.Timer;
    aria2.ready().then(() => {
      // 获取全局的状态
      id = setInterval(() => {
        // @ts-ignore;
        aria2.getGlobalStat().then((stat) => {
          setGlobalStat(stat);
        });
      }, 2000);
      async function onComplete(taskInfo: any) {
        // @ts-ignore;
        const task = await aria2.tellStatus(taskInfo.gid);
        toast('有任务下载完成了' + task.files[0].path);
      }
      // 给aria2绑定事件，ws收到aria2的onDownloadComplete事件后会触发
      aria2.on('DownloadComplete', onComplete);
      return () => {
        aria2.off('DownloadComplete', onComplete);
        clearInterval(id);
        aria2.destroy();
      };
    });
  }, [aria2]);

  function changeServer(e: any) {
    const server = servers[e.key];
    setAria2(new Aria2Client(server.ip, server.port, server.secret));
  }

  // antd
  const [collapsed, setCollapsed] = useState(false);

  // [{ip: xxx; port: xxx; secret: xxx;}{...}]
  const menu = (
    <Menu
      onClick={changeServer}
      items={servers.map((server: any, idx: any) => {
        return {
          label: `${server.ip}:${server.port}`,
          key: `${idx}`,
        };
      })}
    />
  );
  // const menu = (
  //   <Menu
  //     items={aria2Servers
  //       .map((server: any, idx: number) => {
  //         return (
  //           <option key={idx} value={idx}>
  //             {server.ip}:{server.port}
  //           </option>
  //         );
  //       })
  //       .map((it: any, idx: number) => {
  //         return {
  //           label: it,
  //           key: `${idx}`,
  //         };
  //       })}
  //   />
  // );
  return (
    <HashRouter>

      <Layout style={{ minHeight: '100vh', flexDirection: 'row' }}>
        {/* 左边 */}
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <Menu>
            {/* 左上 */}
            <Menu.Item
              icon={<CloudDownloadOutlined style={{ fontSize: '30px', marginTop: '15px' }} />}
              style={{ height: '63px', backgroundColor: '#0097A7', margin: '0px' }}
            >
              <Dropdown arrow={true} overlay={menu} trigger={['hover']}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  style={{ fontSize: '30px' }}
                >
                  <Space>
                    <h3>Aria2</h3>
                  </Space>
                </a>
              </Dropdown>
            </Menu.Item>
            {/* 左下 */}
            <Menu.Item icon={<DownCircleOutlined />}>
              <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/downloading">
                下载中({globalStat.numActive})
              </NavLink>
            </Menu.Item>
            <Menu.Item icon={<ClockCircleOutlined />}>
              <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/waiting">
                等待中({globalStat.numWaiting})
              </NavLink>
            </Menu.Item>
            <Menu.Item icon={<CheckCircleOutlined />}>
              <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/stopped">
                已完成({globalStat.numStopped})
              </NavLink>
            </Menu.Item>
            <Menu.Item icon={<PieChartOutlined />}>
              <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/settings">
                设置
              </NavLink>
            </Menu.Item>
            <Menu.Item icon={<UserOutlined />}>
              <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/servers">
                服务器管理
              </NavLink>
            </Menu.Item>
            <Menu.Item>{connectState}</Menu.Item>
          </Menu>
        </Sider>
        {/* 右边 */}
        <Layout className="site-layout">
          <Header className="site-layout-background">
            <Header1 listComp={listComp} client={aria2} />
          </Header>
          <Content>
            <Routes>
              <Route path="/downloading" element={<Downloading client={aria2} ref={listComp} />}></Route>
              <Route path="/waiting" element={<Waiting client={aria2} ref={listComp} />}></Route>
              <Route path="/stopped" element={<Stopped client={aria2} ref={listComp} />}></Route>
              <Route path="/new" element={<NewTask client={aria2} />}></Route>
              <Route path="/settings" element={<Settings client={aria2} />}></Route>
              <Route path="/servers" element={<Servers />}></Route>
              <Route path="/task/detail/:gid" element={<TaskDetail client={aria2} />}></Route>
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2018 Created by 许泽川
            <div style={{ float: 'right' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="上传速度" value={globalStat.uploadSpeed} suffix="B / S" />
                </Col>
                <Col span={12}>
                  <Statistic title="下载速度" value={globalStat.downloadSpeed} suffix="B / S" />
                </Col>
              </Row>
            </div>
          </Footer>
        </Layout>
      </Layout>
      {/* <div className="App">
        <div className="App-left">
          <select onChange={changeServer} value={selectedIdx}>
            {aria2Servers.map((server: any, idx: number) => {
              return (
                <option key={idx} value={idx}>
                  {server.ip}:{server.port}
                </option>
              );
            })}
          </select>
          <div>{connectState}</div>
          <ToastContainer />
          <div>
            <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/downloading">
              下载中({globalStat.numActive})
            </NavLink>
          </div>
          <div>
            <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/waiting">
              等待中({globalStat.numWaiting})
            </NavLink>
          </div>
          <div>
            <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/stopped">
              已完成({globalStat.numStopped})
            </NavLink>
          </div>
          <div>
            <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/settings">
              设置
            </NavLink>
          </div>
          <div>
            <NavLink style={({ isActive }) => ({ color: isActive ? 'red' : '' })} to="/servers">
              服务器管理
            </NavLink>
          </div>

          <div>上传：{globalStat.uploadSpeed}B/s</div>
          <div>下载：{globalStat.downloadSpeed}B/s</div>
        </div>
        <div className="App-right">
          <div className="App-header">
            <Header1 listComp={listComp} client={aria2} />
          </div>
          <div>
            <Routes>
              <Route path="/downloading" element={<Downloading client={aria2} ref={listComp} />}></Route>
              <Route path="/waiting" element={<Waiting client={aria2} ref={listComp} />}></Route>
              <Route path="/stopped" element={<Stopped client={aria2} ref={listComp} />}></Route>
              <Route path="/new" element={<NewTask client={aria2} />}></Route>
              <Route path="/settings" element={<Settings client={aria2} />}></Route>
              <Route path="/servers" element={<Servers />}></Route>
              <Route path="/task/detail/:gid" element={<TaskDetail client={aria2} />}></Route>
            </Routes>
          </div>
        </div>
      </div> */}
    </HashRouter>
  );
}

export default App;
