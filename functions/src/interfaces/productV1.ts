import * as admin from 'firebase-admin';

export default interface ProductV1 {
  vivsible_in_market: boolean,

  id: string,

  title: string,
  vendor: string,
  series: string,
  tags: Array<string>,
  description: string,
  collection_product_statement: string,
  ar_statement: string,
  other_statement: string,

  title_jp: string,
  vendor_jp: string,
  series_jp: string,
  tags_jp: Array<string>,
  description_jp: string,
  collection_product_statement_jp: string,
  ar_statement_jp: string,
  other_statement_jp: string,

  images: Array<string>,
  tile_images: Array<string>,
  transparent_background_images: Array<string>,

  price_jpy: number,
  number_of_favorite: number,
  number_of_holders: number,
  number_of_glb_files: number,

  created_at: admin.firestore.Timestamp,
  last_edited_at: admin.firestore.Timestamp,
}
