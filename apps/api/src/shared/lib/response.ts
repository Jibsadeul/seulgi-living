import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './error';

function allowsDevMemberHeader() {
  return process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_MEMBER_HEADER === 'true';
}

function getAllowedHeaders() {
  const headers = ['Content-Type', 'Authorization'];

  if (allowsDevMemberHeader()) {
    headers.push('x-member-id');
  }

  return headers.join(', ');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': getAllowedHeaders(),
};

export function optionsResponse(methods = corsHeaders['Access-Control-Allow-Methods']) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Methods': methods,
    },
  });
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode, headers: corsHeaders },
    );
  }

  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    const path = firstError?.path.length ? `${firstError.path.join('.')}: ` : '';

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: firstError ? `${path}${firstError.message}` : '요청 값이 올바르지 않습니다.',
        },
      },
      { status: 400, headers: corsHeaders },
    );
  }

  console.error(error);

  return NextResponse.json(
    { error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다.' } },
    { status: 500, headers: corsHeaders },
  );
}
