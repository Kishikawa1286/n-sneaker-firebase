import * as admin from 'firebase-admin';

export default interface AccountV1 {
  id: string,
  number_of_collection_products: number,
  number_of_gallery_posts: number,
  created_at: admin.firestore.Timestamp,
  last_edited_at: admin.firestore.Timestamp,
  point: number,
  last_signed_in_at: admin.firestore.Timestamp,
}
