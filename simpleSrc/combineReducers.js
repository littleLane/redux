/**
 * 接受 reducers ,返回一个 combination，combination 运行后返回 state 状态树
 * @param {Object} reducers key-value 形式的对象传参，其中 value 应该是一个 function
 */
function combineReducers(reducers) {
  // 过滤 reducers 里面的数据
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  for (let i = 0, l = reducerKeys.length; i < l; i += 1) {
    const key = reducerKeys[i];
    const reducer = reducers[key];
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducer === 'undefined') {
        console.log(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducer === 'function') {
      finalReducers[key] = reducer;
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);

  /**
   * 返回 combination，根据传入的 state 和 action 返回新的 state 树
   * @param {Object} state 当前的 state 状态
   * @param {Object} action 描述 state 的改变
   */
  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};
    for (let i = 0, l = finalReducerKeys.length; i < l; i += 1) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        console.log(`Making NextState fail`);
      }

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextState !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  }
}
