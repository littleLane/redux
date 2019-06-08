import $$observable from 'symbol-observable'

function createStore(reducer, preloadedState, enhancer) {
  // 当 preloadedState 传 Function ，enhancer 不传时实行常规模式
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = null;
  }

  // enhancer 传 Function 时，使用中间件模式，
  // 这时候四个方法不在本次调用时创建，而是在applyMiddleware中再调用一次createStore，
  // 调用时不加enhancer（中间件）了，运行一次常规模式，得到4个方法，作用在applyMiddleware当中。
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      console.log(`Expected the enhancer to be a function.`)
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    console.log('Expected the reducer to be a function.')
  }

  let currentReducer = reducer;

  // preloadedState 为初始的状态值
  let currentState = preloadedState;
  let currentListeners = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  // 获取当前的 state 树
  function getState() {
    return currentState;
  }

  // 订阅事件
  function subscribe(listener) {
    let isSubscribed = false;

    ensureCanMutateNextListeners()
    nextListeners.push(listener);

    // 返回取消订阅
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = true;
      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  function dispatch(action) {
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const listeners = ( currentListeners = nextListeners );

    for (let i = 0, l = listeners.length; i < l; i++) {
      listeners[i]();
    }

    return action;
  }

  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;
    dispatch({ type: 'REPLACE' })
  }

  function observable() {
    const outerSubscribe = subscribe

    return {
      subscribe(observer) {
        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  dispatch({ type: 'init' })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
