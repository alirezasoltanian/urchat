// https://www.tigrisdata.com/docs/sdks/s3/aws-js-sdk/
"use server";

import type { StoredFile, UploadedFile } from "@/types";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

// import { uploadFilesToDB } from "@/lib/actions/file";
import { getIp } from "@/lib/getIp";
import { getErrorMessage } from "@/lib/errors";

import { rateLimiter } from "@/lib/redis/rate-limiter";
import { createUrlStorage } from "@/lib/utils";
import { currentUser } from "@/lib/actions/user";
import { uploadFilesToDB } from "@/lib/actions/file";

type GetSignedURLParams = {
  fileType: string;
  fileSize: number;
  checksum: string;
};
interface S3ClientCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}
const s3ClientLia = new S3Client({
  region: "default",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  } as S3ClientCredentials,
});
const s3ClientAlternative = new S3Client({
  region: "default",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // برای MinIO ضروری است
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } as S3ClientCredentials,
});

export async function deleteImages(images: StoredFile[]) {
  for (let i = 0; i < images.length; i++) {
    const url = images[i]?.url;
    const key = url?.split("/").slice(-1)[0];
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };
    await s3ClientLia.send(new DeleteObjectCommand(deleteParams));
  }
}
export async function deleteImage(image: string) {
  try {
    const url = image;
    const key = url?.split("/").slice(-1)[0];
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    const deleteResponse = await s3ClientLia.send(
      new DeleteObjectCommand(deleteParams)
    );
  } catch (err) {
    console.log(err);
  }
}

interface UploadFileToS3 {
  fileManagerType: UploadedFile;
  websiteType: StoredFile;
}
export const uploadFileToS3 = async ({
  file,
  maxFilesSize,
  maxFileSize,
  acceptFileTypes,
}: {
  file: File;
  maxFilesSize: number;
  maxFileSize: number;
  acceptFileTypes: { types: string[]; errorMessage?: string };
}): Promise<UploadFileToS3> => {
  try {
    if (!acceptFileTypes.types.includes(file.type)) {
      console.log("acceptFileTypes", acceptFileTypes, file.type);

      throw Error(acceptFileTypes.errorMessage);
    }

    if (file.size > maxFileSize) {
      console.log("File size too larg", acceptFileTypes, file.type);

      throw Error("File size too large");
    }
    const ip = (await getIp()) as string;
    if (!ip) {
      console.log("what is your ip", acceptFileTypes, file.type);

      throw Error("what is your ip !");
    }
    // const { success } = await rateLimiter().limit(ip);

    // if (!success) {
    //   throw Error("Rate upload limited");
    // }

    const random = Math.floor(Math.random() * 9000) + 1000;
    if (!file) throw new Error("no file");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const subImage = `${random}_${file.name}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: subImage,
      Body: buffer,
    };
    // thumbnail image
    if (file.type.includes("image/")) {
      const thumbnailBuffer = await sharp(Buffer.from(buffer))
        .blur(1)
        .resize(10)
        .toBuffer();
      const subThumbnailImage = `thumbnail_${random}_${file.name}`;
      const thumbnailParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: subThumbnailImage,
        Body: thumbnailBuffer,
      };
      const thumbnailRes = await s3ClientLia.send(
        new PutObjectCommand(thumbnailParams)
      );
      console.log("thumbnailRes", thumbnailRes, file.type, subThumbnailImage);
    }

    const res = await s3ClientLia.send(new PutObjectCommand(params));

    return {
      websiteType: {
        url: createUrlStorage(subImage),
        name: file.name,
        id: subImage,
        type: file.type,
      },
      fileManagerType: {
        name: file.name,
        size: file.size,
        key: subImage,
        type: file.type,
      },
    };
  } catch (err) {
    console.log("err123", err);

    return { error: getErrorMessage(err) };
  }
};

export const uploadFilesToS3 = async ({
  data,
  maxFilesSize,
  maxFileSize,
  acceptFileTypes,
  folder,
  uploadToDB,
  chatId,
}: {
  data: FormData;
  maxFilesSize: number;
  maxFileSize: number;
  acceptFileTypes?: { types: string[]; errorMessage?: string };
  folder?: string;
  uploadToDB?: boolean;
  chatId?: string;
}) => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "not authenticated" };
    }

    const uploadedFileWebsiteType = [];
    const uploadedFileManagerType = [];
    const totalSize = [...data].reduce((accumulatedSize, fileFormData) => {
      const file = fileFormData[1] as File; // Cast to File type to access size property
      return accumulatedSize + file.size;
    }, 0);

    // Convert 300MB to bytes (1 MB = 1,048,576 bytes)

    if (totalSize > maxFilesSize) {
      return { error: "Total file size exceeds 300MB" };
    }
    for (const fileFormData of data) {
      const file = fileFormData[1];

      try {
        const signedURLResult = await uploadFileToS3({
          file,
          maxFilesSize,
          maxFileSize,
          acceptFileTypes,
        });

        if (signedURLResult.error) {
          console.log(signedURLResult.error, signedURLResult); // You can handle the result as needed
          throw new Error(signedURLResult.error);
        } else {
          uploadedFileWebsiteType.push(signedURLResult.websiteType);
          uploadedFileManagerType.push(signedURLResult.fileManagerType);
        }
      } catch (error) {
        console.error("Error uploading file to S3:", getErrorMessage(error));
        return { error: getErrorMessage(error) };
      }
    }

    // after(() => {
    if (uploadToDB && chatId) {
      uploadFilesToDB({
        files: uploadedFileManagerType,
        folder,
        chatId,
      });
    }
    // })

    return {
      success: "آپلود باموفقیت انجام شد",
      data: uploadedFileWebsiteType,
    };
  } catch (error) {
    console.error("Error uploading files to S3:", error);
    return { error: getErrorMessage(error) };
  }
};
