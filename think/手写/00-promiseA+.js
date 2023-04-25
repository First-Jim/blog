const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MPromise {
  _state = PENDING;
  // 状态完成的list
  FULLFILLED_CALLBACK_LIST = [];
  // 状态失败的list
  REJECTED_CALLBACK_LIST = [];

  constructor(fn) {
    this._status = PENDING;
    this.value = null;
    this.reason = null;

    // 需要在里面调用，报错需要立即抛出
    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  get status() {
    return this._status;
  }

  set status(value) {
    this._status = value;

    // 判断不同的状态，执行不同的逻辑
    switch (value) {
      case FULFILLED:
        // then 方法已经判断是不是function
        this.FULLFILLED_CALLBACK_LIST.forEach((cb) => cb(this.value));
        break;
      case REJECTED:
        this.REJECTED_CALLBACK_LIST.forEach((cb) => cb(this.reason));
        break;
    }
  }
  resolve(value) {
    // 最终态不可被改变，需要加一个判断
    // 只有当 status 为初始的时候才可以改变
    if (this.status === PENDING) {
      this.value = value;
      this.status = FULFILLED;
    }
  }

  reject(reason) {
    // 最终态不可被改变，需要加一个判断
    // 只有当 status 为初始的时候才可以改变
    if (this.status === PENDING) {
      this.reason = reason;
      this.status = REJECTED;
    }
  }

  then(onFullfiled, onRejected) {
    const fullfilledFn = this.isFunction(onFullfiled)
      ? onFullfiled
      : (value) => value;

    const rejectedFn = this.isFunction(onRejected)
      ? onRejected
      : (value) => {
          throw value;
        };
    //  如果 onFullfilled 或者onRejected 抛出一个异常 e, 那么新的promise 必须reject e

    const onFullfilledFnWitchCatch = (resolve, reject, newPromise) => {
      queueMicrotask(() => {
        try {
          // 不是一个函数，就直接resolve , 因为有返回值了，所有需要判断
          if (!this.isFunction(onFullfiled)) {
            resolve(this.value);
          } else {
            const x = fullfilledFn(this.value);
            this.resolvePromise(newPromise, x, resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
      });
    };
    const onRejectedFnWitchCatch = (resolve, reject, newPromise) => {
      queueMicrotask(() => {
        try {
          // 不是一个函数，就直接resolve , 因为有返回值了，所有需要判断
          if (!this.isFunction(onRejected)) {
            resolve(this.reason);
          } else {
            const x = rejectedFn(this.reason);
            this.resolvePromise(newPromise, x, resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
      });
    };

    switch (this.status) {
      // then 返回一个 promise
      case FULFILLED: {
        const newPromise = new MPromise((resolve, reject) => {
          onFullfilledFnWitchCatch(resolve, reject, newPromise);
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
          this.FULLFILLED_CALLBACK_LIST.push(() =>
            onFullfilledFnWitchCatch(resolve, reject, newPromise)
          ),
            this.REJECTED_CALLBACK_LIST.push(() =>
              onRejectedFnWitchCatch(resolve, reject, newPromise)
            );
        });
        return newPromise;
      }
    }
    // 规范里定义resolvePromise 需要接受一个newPromise
    // resolvePromise 函数的意义，就是对promise 的各种值处理
    // 然promise可以返回一个结果，无论是reject还是resolve
    resolvePromise = (newPromise, x, resolve, reject) => {
      if (newPromise === x) {
        // 返回一个错误信息，信息无所谓什么都可以，为什么要reject一个错误，因为如果newPromise 和 x 相等会相互调用，形成一个死循环
        return reject(
          new TypeError(
            "Type Error, the promise and the return value are the same..."
          )
        );
      }

      if (x instanceof MPromise) {
        // 如果是promise,一定有then
        x.then((y) => {
          this.resolvePromise(newPromise, y, resolve, reject);
        }, reject);
      } else if (typeof x === "object" || this.isFunction(x)) {
        // typeof null 也是object，所以需要加以判断
        if (x === null) {
          return resolve(x);
        }
        // 按照规定的语义化写法
        let then = null;
        try {
          then = x.then;
        } catch (e) {
          return reject(e);
        }

        if (this.isFunction(then)) {
          // 规范中要求then 方法，只能被调用一次
          // 定义一个called 变量，标识是否被调用
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
          } catch (e) {
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
    };
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  // 实现静态方法
  static resolve(value) {
    if (value instanceof MPromise) {
      return value;
    }

    return new MPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MPromise((resolve, reject) => reject(reason));
  }

  all(promiseArray) {
    if (!Array.isArray(promiseArray)) {
      throw new TypeError("the argument promiseArray must be an array");
    }

    let resultArray = [];
    let length = promiseArray.length;
    return new MPromise((resolve, reject) => {
      for (let i = 0; i < length; i++) {
        promiseArray[i].then((value) => {
          resultArray.push(value);
          if (resultArray.length === length) {
            resolve(resultArray);
          }
        }, reject);
      }
    });
  }

  race(promiseArray) {
    if (!Array.isArray(promiseArray)) {
      throw new TypeError("the argument promiseArray must be an array");
    }
    let length = promiseArray.length;
    return new MPromise((resolve, reject) => {
      try {
        for (let i = 0; i < length; i++) {
          promiseArray[i].then(resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // finally原则上也是then方法实现，注意传入的回调中不用传参,再次点then才能获取到value或者err
  static finally(callback) {
    return this.then(
      (value) => {
        return MyPromise.resolve(callback()).then(() => value); // 无论状态变为fullfilled还是rejected都执行回调
      },
      (err) => {
        return MyPromise.resolve(callback()).then(() => {
          throw err;
        }); // 无论状态变为fullfilled还是rejected都执行回调
      }
    );
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
    resolve("test2");
  }, 1000);
});

p1.then((res) => {
  console.log("p1-res: ", res);
});

p2.then((res) => {
  console.log("p2-res: ", res);
});

new MPromise().all([p1, p2]).then((res) => {
  console.log("all-res: ", res);
});
new MPromise().race([p1, p2]).then((res) => {
  console.log("race-res: ", res);
});
const p5 = new MPromise((resolve, reject) => {
  setTimeout(() => {
    reject("test .catch");
  }, 2000);
});

p5.then((data) => {
  console.log("p5-data: ", data);
}).catch((error) => {
  console.log("p5-error: ", error);
});
