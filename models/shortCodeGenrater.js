const code = () => {
  const totalArr =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";

  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * 62);

    result = result + totalArr[index];
  }

  return result;
};

// console.log(code());

module.exports = code;
