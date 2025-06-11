import { z } from 'zod';
export const PresignedUploadFileBodySchema = z
  .object({
    filename: z.string(),
    filesize: z.number().optional(),
  })
  .strict();
export const UploadFilesResSchema = z.object({
  data: z.array(
    z.object({
      url: z.string(),
    }),
  ),
});
export const PresignUploadFileResSchema = z.object({
  presignUrl: z.string(),
  key: z.string(),
});

export type PresignedUploadFileBodyType = z.infer<
  typeof PresignedUploadFileBodySchema
>;
export type UploadFilesResType = z.infer<typeof UploadFilesResSchema>;
export type PresignUploadFileResType = z.infer<
  typeof PresignUploadFileResSchema
>;
