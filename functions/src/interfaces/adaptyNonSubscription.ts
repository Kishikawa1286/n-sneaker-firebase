// see: https://docs.adapty.io/docs/server-side-api-objects
export default interface AdaptyNonSubscription {
  purchase_id: string,
  vendor_product_id: string | null,
  vendor_transaction_id: string | null,
  vendor_original_transaction_id: string | null,
  store: string | null,
  purchased_at: string, // ISO 8601 date
  is_one_time: boolean,
  is_sandbox: boolean,
}
