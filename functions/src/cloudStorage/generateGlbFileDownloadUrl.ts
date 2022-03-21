import admin from '../utils/firestore';
import { functions128MB } from '../utils/functions';

interface GenerateGlbFileDownloadUrlArgs {
  product_id: string,
  product_glb_file_id: string,
}

export default functions128MB.https
  .onCall(async (data: GenerateGlbFileDownloadUrlArgs): Promise<string> => {
    const productId = data.product_id;
    const productGlbFileId = data.product_glb_file_id;
    const filePath = `product_glb_files/${productId}/${productGlbFileId}.glb`;
    try {
      const bucket = admin.storage().bucket(); // default bucket
      const file = bucket.file(filePath);

      const result = await file.getSignedUrl({
        action: 'read',
        expires: new Date(Date.now() + 30 * 60000), // expires at 30 min later
      });
      const signedUrl = result[0];

      return signedUrl;
    } catch (e: unknown) {
      console.error(e);
      return 'failed';
    }
  });
