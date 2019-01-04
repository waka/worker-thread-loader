let baseNum = 0;

export const getNum = () => {
  return baseNum;
};

export const increase = (x) => {
  baseNum += x;
  return baseNum;
};

export const decrease = (x) => {
  baseNum -= x;
  return baseNum;
};
