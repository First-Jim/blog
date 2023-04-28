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
    setTimeout(() => {
      func();
      flag = true;
    }, delay);
  };
}
