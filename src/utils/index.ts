const utils = {
  /** 解析字串 "ColxRow" 格式，回傳 { cols, rows } */
  parseLabel(label: string): { cols: number; rows: number } {
    /** /i 是忽略大小寫的意思  */
    const match = label.match(/^(\d+)x(\d+)$/i);
    if (!match || !match[1] || !match[2]) return { cols: 1, rows: 1 };
    return { cols: parseInt(match[1]), rows: parseInt(match[2]) };
  },
};

export default utils;
