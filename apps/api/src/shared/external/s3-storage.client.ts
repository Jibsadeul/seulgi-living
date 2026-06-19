import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { errors } from '@/shared/lib/error';

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type UploadedImage = {
  key: string;
  url: string;
};

type UploadRecipeImageInput = {
  file: File;
  memberId: string;
  recipeId: string;
  kind: 'main' | 'step';
  stepIndex?: number;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} 환경변수가 필요합니다.`);
  }

  return value;
}

function getS3Client() {
  return new S3Client({
    endpoint: getRequiredEnv('S3_ENDPOINT'),
    region: getRequiredEnv('S3_REGION'),
    credentials: {
      accessKeyId: getRequiredEnv('S3_ACCESS_KEY_ID'),
      secretAccessKey: getRequiredEnv('S3_SECRET_ACCESS_KEY'),
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });
}

function getImageExtension(mimeType: string) {
  if (mimeType === 'image/jpeg') {
    return 'jpg';
  }

  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  throw errors.validation('허용되지 않는 이미지 형식입니다.');
}

function assertImageFile(file: File) {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw errors.validation('이미지는 jpeg, png, webp 형식만 업로드할 수 있습니다.');
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw errors.validation('이미지 파일은 5MB 이하여야 합니다.');
  }
}

function buildRecipeImageKey(input: UploadRecipeImageInput) {
  const extension = getImageExtension(input.file.type);
  const suffix = `${Date.now()}-${randomUUID()}.${extension}`;

  if (input.kind === 'main') {
    return `recipes/${input.memberId}/${input.recipeId}/main-${suffix}`;
  }

  return `recipes/${input.memberId}/${input.recipeId}/steps/${input.stepIndex}-${suffix}`;
}

function buildPublicUrl(key: string) {
  const publicBaseUrl = getRequiredEnv('S3_PUBLIC_BASE_URL').replace(/\/$/, '');
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');

  return `${publicBaseUrl}/${encodedKey}`;
}

export async function uploadRecipeImage(input: UploadRecipeImageInput): Promise<UploadedImage> {
  assertImageFile(input.file);

  const bucket = getRequiredEnv('S3_BUCKET');
  const key = buildRecipeImageKey(input);
  const body = Buffer.from(await input.file.arrayBuffer());

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: input.file.type,
    }),
  );

  return {
    key,
    url: buildPublicUrl(key),
  };
}

export async function deleteRecipeImages(images: UploadedImage[]): Promise<void> {
  if (images.length === 0) {
    return;
  }

  const bucket = getRequiredEnv('S3_BUCKET');
  const client = getS3Client();

  await Promise.allSettled(
    images.map((image) =>
      client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: image.key,
        }),
      ),
    ),
  );
}
