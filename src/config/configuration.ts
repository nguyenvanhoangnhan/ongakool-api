export default () => ({
  app: {
    env: process.env.APP_ENV || 'local',
    port: parseInt(process.env.APP_PORT, 10) || 8080,
    publicUrl: process.env.APP_PUBLIC_URL || '',
  },
  swagger: {
    docsUrl: process.env.DOCS_URL || 'docs',
  },
  apiVersion: 'v1',
  defaultAvatar:
    'https://ongakool.s3.ap-southeast-1.amazonaws.com/assets/deafultavatar.jpg',
  externalApi: {
    recommendation: {
      baseUrl: process.env.RECOMMENDATION_API_URL || 'http://127.0.0.1:8000/',
    },
    searchByLyrics: {
      baseUrl: process.env.SEARCH_BY_LYRICS_API_URL || 'http://127.0.0.1:8001/',
    },
  },
  aws: {
    s3: {
      bucketName: process.env.AWS_S3_BUCKET_NAME || 'ongakool',
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION || 'ap-southeast-1',
  },
});
