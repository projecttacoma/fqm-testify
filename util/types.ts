export interface ResourceCodeInfo {
  primaryCodePath: string;
  paths: Record<string, CodePathInfo>;
}

export interface CodePathInfo {
  codeType: string;
  multipleCardinality: boolean;
  choiceType: boolean;
}

export interface ResourceCodeInfo {
  primaryCodePath: string;
  paths: CodePathInfo;
}

export interface CodePathInfo {
  [key: string]: { codeType: string; multipleCardinality: boolean };
}
