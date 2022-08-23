export interface ResourceCodeInfo {
  primaryCodePath: string;
  paths: CodePathInfo;
}

export interface CodePathInfo {
  [key: string]: { codeType: string; multipleCardinality: boolean; choiceType: boolean };
}
