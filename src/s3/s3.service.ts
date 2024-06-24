import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  GetObjectCommand,
  S3,
  DeleteObjectsCommandInput,
} from '@aws-sdk/client-s3';

import { ConfigService } from '@nestjs/config';
import * as path from 'path';

import { Readable } from 'stream';
import { groupBy } from 'lodash';

@Injectable()
export class S3Service {
  private readonly s3: S3;

  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: this.configService.get('aws.s3.accessKeyId'),
        secretAccessKey: this.configService.get('aws.s3.secretAccessKey'),
      },
      region: this.configService.get('aws.region'),
    });

    this.bucketName = configService.get('aws.s3.bucketName');
    this.region = configService.get('aws.region');
  }

  async uploadFile(options: {
    fileBody: Buffer;
    fileName: string;
    directory?: string;
    s3Object?: string;
  }) {
    if (!options.s3Object) {
      if (options.directory !== undefined && options.directory !== null) {
        options.s3Object = path.join(options.directory, options.fileName);
      }
    }

    console.log('::: options.fileName', options.fileName);
    console.log('::: options.directory', options.directory);

    const params = {
      Bucket: this.bucketName,
      Key: String(options.s3Object),
      Body: options.fileBody,
    };

    await this.s3.send(new PutObjectCommand(params));
    return {
      object: options.s3Object,
      fullUrl: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${options.s3Object}`,
    };
  }

  matchUrl = (url: string) => {
    return url.match(
      new RegExp(
        `https://${this.bucketName}.s3.${this.region}.amazonaws.com/(.*)`,
      ),
    );
  };

  getObjectKeyFromUrl(url: string): string {
    return url.replace(
      `https://${this.bucketName}.s3.${this.region}.amazonaws.com/`,
      '',
    );
  }

  async uploadFiles(
    options: Array<{
      fileBody: Buffer;
      fileName: string;
      directory: string;
    }>,
  ): Promise<
    Array<{
      key: string;
      fullUrl: string;
    }>
  > {
    const keys = options.map(async (obj) => {
      const { object, fullUrl } = await this.uploadFile(obj);

      return { key: object, fullUrl };
    });
    return await Promise.all(keys);
  }

  async deleteFiles(files: Array<{ key: string }>) {
    console.log('::: S3Services deleteFiles files', files);
    if (files.length <= 0) return;

    const filesByBucket = groupBy(files, 's3BucketId');

    for (const _files of Object.values(filesByBucket)) {
      const _filteredFiles = _files.filter((file) => Boolean(file.key));
      if (_filteredFiles.length <= 0) continue;

      const params: DeleteObjectsCommandInput = {
        Bucket: this.bucketName,
        Delete: { Objects: _filteredFiles.map((file) => ({ Key: file.key })) },
      };

      // await this.s3.send(new DeleteObjectsCommand(params));
      await this.s3.deleteObjects(params, {});
    }
  }

  async getFileContent(s3ObjectKey: string): Promise<Buffer> {
    const resp = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3ObjectKey,
      }),
    );
    const chunks = [];
    for await (const chunk of resp.Body as Readable) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  getFileNameFromS3Object(s3Object: string): string {
    if (s3Object === null || s3Object === undefined) {
      return null;
    }

    if (s3Object.includes('?')) {
      const basename = path.basename(s3Object);
      return basename.split('?')[0];
    }

    return path.basename(s3Object);
  }

  async createDir(params: { dirName: string }): Promise<void> {
    const dirKey = `${params.dirName}/`;
    const paramsS3 = {
      Bucket: this.bucketName,
      Key: dirKey,
      Body: '',
    };
    await this.s3.send(new PutObjectCommand(paramsS3));
  }

  async deleteDir(params: { dirName: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      // get all keys and delete objects
      const getAndDelete = (ct: string = null) => {
        this.s3
          .listObjectsV2({
            Bucket: this.bucketName,
            MaxKeys: 1000,
            ContinuationToken: ct,
            Prefix: params.dirName + '/',
            Delimiter: '',
          })
          .then(async (data) => {
            // params for delete operation
            const operationParams = {
              Bucket: this.bucketName,
              Delete: { Objects: [] },
            };
            // add keys to Delete Object
            data.Contents?.forEach((content) => {
              operationParams.Delete.Objects.push({ Key: content.Key });
            });
            // delete all keys

            if (operationParams.Delete.Objects.length > 0)
              await this.s3.deleteObjects(operationParams);
            // check if ct is present
            if (data.NextContinuationToken)
              getAndDelete(data.NextContinuationToken);
            else resolve();
          })
          .catch((err) => reject(err));
      };

      // init call
      getAndDelete();
    });
  }

  async renameDir(params: {
    oldDirName: string;
    newDirName: string;
  }): Promise<void> {
    const oldDirKey = `${params.oldDirName}/`;
    const newDirKey = `${params.newDirName}/`;
    const paramsS3 = {
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${oldDirKey}`,
      Key: newDirKey,
    };
    await this.s3.send(new PutObjectCommand(paramsS3));
    await this.deleteDir({
      dirName: params.oldDirName,
    });
  }

  async isExistingObject(params: { key: string }): Promise<boolean> {
    try {
      await this.s3.headObject({
        Bucket: this.bucketName,
        Key: params.key,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
