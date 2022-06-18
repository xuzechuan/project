import produce from 'immer';
import { AnyAction, createStore, Reducer } from 'redux';

const reducer: Reducer<InitState, AnyAction> = (state = initState, action) => {
  switch (action.type) {
    case 'updateActiveTasks':
      return produce(state, (draft: any) => {
        draft.activeTasks = action.tasks;
      });
    case 'updateStoppedTasks':
      return produce(state, (draft: any) => {
        draft.stoppedTasks = action.tasks;
      });
    case 'updateWaitingTasks':
      return produce(state, (draft: any) => {
        draft.waitingTasks = action.tasks;
      });
    case 'updateSelectedTasksGid':
      return produce(state, (draft: any) => {
        draft.selectedTasksGid = action.gid;
      });
    case 'updateWhatTasksPageNow':
      return produce(state, (draft: any) => {
        draft.whatTasksPageNow = action.page;
      });
    case 'updateServers':
      return produce(state, (draft: any) => {
        draft.servers = action.servers;
      })
  }
  return state;
};

export interface InitState {
  activeTasks: any[];
  waitingTasks: any[];
  stoppedTasks: any[];
  whatTasksPageNow: string;
  servers: any[];
  selectedTasksGid: string[];
  selectedServerIdx: number;
}

const initState: InitState = {
  activeTasks: [],
  waitingTasks: [],
  stoppedTasks: [],
  whatTasksPageNow: '',
  servers: [
    {
      ip: '127.0.0.1',
      port: '11000',
      secret: '111222333',
    },
  ],
  selectedTasksGid: [],
  selectedServerIdx: 0,
};
const store = createStore(reducer, initState);

export default store;
