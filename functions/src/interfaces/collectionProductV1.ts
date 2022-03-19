import * as admin from 'firebase-admin';

export default interface CollectionProductV1 {
  id: string,

  account_id: string,
  payment_method: string,

  created_at: admin.firestore.Timestamp,
  last_edited_at: admin.firestore.Timestamp,

  // 以下 ProductV1 のコピー

  product_id: string,

  title: string,
  vendor: string,
  series: string,
  tags: Array<string>,
  description: string,
  collection_product_statement: string,
  ar_statement: string,
  other_statement: string,

  title_jp: string,
  verndor_jp: string,
  series_jp: string,
  tags_jp: Array<string>,
  description_jp: string,
  collection_product_statement_jp: string,
  ar_statement_jp: string,
  other_statement_jp: string,

  images: Array<string>,
  tile_images: Array<string>,
  transparent_background_images: Array<string>,
}
