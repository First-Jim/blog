// 防抖
function debounce(func, delay = 300) {
  let timer = null;
  return function () {
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply(this, args); //改变this指向为调用debounce 所指的对象
    }, delay);
  };
}

// 节流
// 设置一个标志
function throttle(func, delay = 300) {
  let flag = true;
  return () => {
    if (!flag) return;
    flag = false;
    timer = setTimeout(() => {
      func();
      flag = true;
    }, delay);
  };
}
/**
 * 1. 防抖
 * 在事件被触发n秒后再执行回调函数，如果在n秒内又触发了该事件，则重新开始计时，这样可以确保只有最后一次触发事件后的n秒后才会执行回调函数，从而减少了回调函数的执行次数，达到节流的效果
 *
 * 2. 节流
 * 在一段时间内执行一次事件回调函数，如果在这段时间内又触发了改事件，则忽略该事件，这样，可以确保在一段时间内只执行一次回调函数，从而减少了回调函数的执行次数。从而达到节流的效果。
 */
