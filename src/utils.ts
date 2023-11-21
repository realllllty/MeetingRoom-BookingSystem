import * as crypto from 'crypto';

export function md5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str); //将用于新的数据片段添加到要进行哈希的数据流当中, 可以多次使用update传入新的数据
  return hash.digest('hex'); //计算所有传递给哈希对象的哈希值
}
