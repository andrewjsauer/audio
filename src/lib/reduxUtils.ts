type AsyncSuffixes = {
  ERROR: 'Error';
  PENDING: 'Pending';
  SUCCESS: 'Success';
};

const asyncSuffixes: AsyncSuffixes = {
  ERROR: 'Error',
  PENDING: 'Pending',
  SUCCESS: 'Success',
};

export const actionTypeToString = (type: string): string => {
  try {
    const w = type
      .split('/')
      .pop()!
      .replace(/([A-Z][a-z]+|[A-Z]*(?![a-z]))/g, ' $1')
      .trim();

    return w.charAt(0).toUpperCase() + w.slice(1);
  } catch (e) {
    return type;
  }
};

type AsyncTypes = {
  [K in keyof AsyncSuffixes]: string;
};

export const createAsyncTypes = (typeString: string): AsyncTypes =>
  Object.keys(asyncSuffixes).reduce((acc, suffixKey) => {
    const suffix = asyncSuffixes[suffixKey as keyof AsyncSuffixes];

    return {
      ...acc,
      [suffixKey]: `${typeString}${suffix}`,
    };
  }, {} as AsyncTypes);

type ActionOptions = {
  log?: boolean;
};

type Action = {
  descriptor: string;
  log: boolean;
  payload: any;
  type: string;
  originalAction?: any;
};

export const createAction =
  (type: string, options: ActionOptions = {}) =>
  (payload: any, originalAction?: any): Action => ({
    descriptor: actionTypeToString(type),
    log: options.log ?? false,
    payload,
    type,
    ...(originalAction && { originalAction }),
  });

const defaultLogOptions = {
  ERROR: true,
  PENDING: false,
  SUCCESS: false,
};

type AsyncAction = {
  (payload: any, originalAction?: any): Action;
  error: (payload: any, originalAction?: any) => Action;
  success: (payload: any, originalAction?: any) => Action;
};

export const createAsyncAction = (
  type: AsyncTypes,
  options: ActionOptions = {},
): AsyncAction => {
  const logOptions = {
    ...defaultLogOptions,
    ...options.log,
  };

  const actionFunction = createAction(type.PENDING, {
    ...options,
    log: logOptions.PENDING,
  });

  const errorFunction = createAction(type.ERROR, {
    ...options,
    log: logOptions.ERROR,
  });

  const successFunction = createAction(type.SUCCESS, {
    ...options,
    log: logOptions.SUCCESS,
  });

  return Object.assign(actionFunction, {
    error: errorFunction,
    success: successFunction,
  });
};
