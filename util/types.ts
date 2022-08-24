export interface ResourceCodeInfo {
  primaryCodePath: string;
  paths: Record<string, CodePathInfo>;
}

export interface CodePathInfo {
  codeType: string;
  multipleCardinality: boolean;
  choiceType: boolean;
}
