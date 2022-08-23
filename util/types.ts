export interface PrimaryCodePathInfo {
  primaryCodePath: string;
  primaryCodeType?: string;
  multipleCardinality: boolean;
}

export interface ResourceCodeInfo {
  primaryCodePath: string;
  paths: CodePathInfo;
}

export interface CodePathInfo {
  [key: string]: { codeType: string; multipleCardinality: boolean };
}
