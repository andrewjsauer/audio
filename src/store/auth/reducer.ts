import { LOGOUT, LOGIN } from './actions';

export const INITIAL_STATE: any = {
  error: null,
  isLoading: false,
  user: null,
};

export default (state = INITIAL_STATE, action: any) => {
  const { payload, type } = action;

  switch (type) {
    case LOGOUT:
      return {
        user: null,
      };
    case LOGIN.PENDING:
      return {
        ...state,
        isLoading: true,
      };
    case LOGIN.SUCCESS:
      return {
        ...state,
        user: payload,
        isLoading: false,
      };
    case LOGIN.ERROR:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};
