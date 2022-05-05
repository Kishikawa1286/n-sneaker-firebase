import * as admin from 'firebase-admin';

export default interface SignInRewardV1 {
  id: string,
  product_id: string,
  consumed_point: number,
  created_at: admin.firestore.Timestamp,
  last_edited_at: admin.firestore.Timestamp,
}
