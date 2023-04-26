class EventEmitter {
  constructor() {
    this.events = {};
  }

  //实现订阅
  on(type, callback) {
    if (!this.events[type]) {
      this.events[type] = [callback];
    } else {
      this.events[type].push(callback);
    }
  }

  //实现取消订阅
  off(type, callback) {
    if (!this.events[type]) return;
    this.events[type] = this.events[type].filter((item) => item !== callback);
  }
  // 只执行一次订阅事件
  once(type, callback) {
    function fn() {
      callback();
      this.off(type, fn);
    }
    this.on(type, fn);
  }

  // 触发事件
  emit(type, ...args) {
    this.events[type] &&
      this.events[type].forEach((fn) => fn.apply(this, args));
  }
}

// 使用
const myevent = new EventEmitter();

const handle = (...rest) => {
  console.log(rest);
};

myevent.on("click", handle);

myevent.emit("click", 1, 2, 3, 4);

myevent.off("click", handle);

myevent.emit("click", 1, 2);

myevent.once("dbClick", () => {
  console.log(123456);
});
myevent.emit("dbClick");
myevent.emit("dbClick");
