import * as admin from 'firebase-admin';

export default interface AccountV1 {
  id: string,
  number_of_products_purchased: number,
  created_at: admin.firestore.Timestamp,
  last_edited_at: admin.firestore.Timestamp,
}