import admin from '../utils/firestore';

export default interface ProductGlbFileV1 {
  available_for_viewer: boolean,
  available_for_ar: boolean,

  id: string,

  title: string,
  title_jp: string,
  images: Array<string>,

  created_at: admin.firestore.Timestamp,
  last_edited_at: admin.firestore.Timestamp,

  product_id: string,

  product_app_store_id: string,
  product_play_store_id: string,

  product_title: string,
  product_vendor: string,
  product_series: string,
  product_tags: Array<string>,

  product_title_jp: string,
  product_vendor_jp: string,
  product_series_jp: string,
  product_tags_jp: Array<string>,
}
