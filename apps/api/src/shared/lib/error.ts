export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errors = {
  unauthorized: () => new AppError(401, 'UNAUTHORIZED', '인증이 필요합니다.'),
  notFound: (message = '리소스를 찾을 수 없습니다.') => new AppError(404, 'NOT_FOUND', message),
  conflict: (message: string) => new AppError(409, 'CONFLICT', message),
  validation: (message: string) => new AppError(400, 'VALIDATION_ERROR', message),
};
