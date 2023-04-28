const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MPromise {
  // 监听
  _status = PENDING;

  FULFILED_CALLBACK_LIST = [];
  REJECTED_CALLBACK_LIST = [];

  constructor(fn) {
    this.status = PENDING; //
    this.value = null; //resolve
    this.reason = null; // reject

    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (err) {
      this.reject(err);
    }
  }

  get status() {
    return this._status;
  }

  set status(val) {
    this._status = val;

    switch (val) {
      case FULFILLED:
        this.FULFILED_CALLBACK_LIST.forEach((cb) => cb(this.value));
        break;
      case REJECTED:
        this.REJECTED_CALLBACK_LIST.forEach((cb) => cb(this.reason));
        break;
    }
  }

  resolve(value) {
    if (this.status === PENDING) {
      this.value = value;
      this.status = FULFILLED;
    }
  }

  reject(reason) {
    if (this.status === PENDING) {
      this.reason = reason;
      this.status = REJECTED;
    }
  }

  then(onFulfiled, onRejected) {
    const fulfiledFn = this.isFunction(onFulfiled)
      ? onFulfiled
      : (value) => value;
    const rejectedFn = this.isFunction(onRejected)
      ? onRejected
      : (value) => {
          throw value;
        };

    // 0. promise是异步，使用queueMicrotask 模拟
    // 1.如果 onFullfilled 或者onRejected 抛出一个异常 e, 那么新的promise 必须reject e

    const onFulfilledFnWitchCatch = (resolve, reject, newPromise) => {
      queueMicrotask(() => {
        try {
          if (!this.isFunction(onFulfiled)) {
            resolve(this.value);
          } else {
            const x = fulfiledFn(this.value);
            this.resolvePromise(newPromise, x, resolve, reject);
          }
        } catch (error) {
          reject(error);
        }
      });
    };
    const onRejectedFnWitchCatch = (resolve, reject, newPromise) => {
      queueMicrotask(() => {
        try {
          if (!this.isFunction(onRejected)) {
            resolve(this.value);
          } else {
            const x = rejectedFn(this.reason);
            this.resolvePromise(newPromise, x, resolve, reject);
          }
        } catch (error) {
          reject(error);
        }
      });
    };
    switch (this.status) {
      // then 返回一个 promise
      case FULFILLED: {
        const newPromise = new MPromise((resolve, reject) => {
          onFulfilledFnWitchCatch(resolve, reject, newPromise);
        });

        return newPromise;
      }

      case REJECTED: {
        const newPromise = new MPromise((resolve, reject) => {
          onRejectedFnWitchCatch(resolve, reject, newPromise);
        });
        return newPromise;
      }

      case PENDING: {
        const newPromise = new MPromise((resolve, reject) => {
          this.FULFILLED_CALLBACK_LIST.push(() =>
            onFulfilledFnWitchCatch(resolve, reject, newPromise)
          ),
            this.REJECTED_CALLBACK_LIST.push(() =>
              onRejectedFnWitchCatch(resolve, reject, newPromise)
            );
        });
        return newPromise;
      }
    }
  }
  // static resolve() { }
  resolvePromise(newPromise, x, resolve, reject) {
    if (newPromise === x) {
      return reject(new TypeError(`this promise and the value is same`));
    }

    // x 本身是一个promise
    if (x instanceof MPromise) {
      x.then((y) => {
        this.resolvePromise(newPromise, y, resolve, reject);
      });
    } else if (typeof x === "object" || this.isFunction(x)) {
      if (x === null) {
        return resolve(x);
      }
      //
      let then = null;
      try {
        then = x.then;
      } catch (e) {
        return reject(e);
      }

      if (this.isFunction(then)) {
        let called = false;
        try {
          then.call(
            x,
            (y) => {
              if (!called) {
                called = true;
                this.resolvePromise(newPromise, y, resolve, reject);
              }
            },
            (e) => {
              if (!called) {
                called = true;
                reject(e);
              }
            }
          );
        } catch (err) {
          if (!called) {
            called = true;
            reject(e);
          }
        }
      } else {
        resolve(x);
      }
    } else {
      resolve(x);
    }
  }

  isFunction(param) {
    return typeof param === "function";
  }
}

const p1 = new MPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("test1");
  }, 2000);
});

const p2 = new MPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("test222");
  }, 1000);
});

p1.then((res) => {
  console.log("p1-res: ", res);
});

p2.then((res) => {
  console.log("p2-res: ", res);
});

// new MPromise().all([p1, p2]).then((res) => {
//   console.log("all-res: ", res);
// });
// new MPromise().race([p1, p2]).then((res) => {
//   console.log("race-res: ", res);
// });
// const p5 = new MPromise((resolve, reject) => {
//   setTimeout(() => {
//     reject("test .catch");
//   }, 2000);
// });

// p5.then((data) => {
//   console.log("p5-data: ", data);
// }).catch((error) => {
//   console.log("p5-error: ", error);
// });

// 手写：
// 1. 手写bind
// 2  深拷贝
// 3.
