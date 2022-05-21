import * as admin from 'firebase-admin';

export default interface GalleryPostV1 {
  id: string,
  product_id: string,
  account_id: string,
  image_urls: Array<string>,
  image_storage_paths: Array<string>,
  compressed_image_urls: Array<string>,
  compressed_image_storage_paths: Array<string>,
  number_of_favorites: number,
  created_at: admin.firestore.Timestamp,
  last_edited_at: admin.firestore.Timestamp,
}
