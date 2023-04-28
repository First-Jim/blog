const test = new Promise((resolve, reject) => {
  resolve(
    () =>
      new Promise((resolve, reject) => {
        resolve("test");
      })
  );
});

test.then((value) => {
  console.log("value: ", value.then());
});

//
