// see: https://docs.revenuecat.com/reference/subscribers
export interface RevenuecatNonSubscription {
  /*
  A unique identifier for the transaction.
  You can use this to ensure you track consumption of all consumable products.
  */
  id: string,

  /*
  The ISO 8601 datetime that the purchase happened.
  */
  purchase_date: string,

  /*
  Possible values for store:
  - app_store: The product was purchased through Apple App Store.
  - mac_app_store: The product was purchased through the Mac App Store.
  - play_store: The product was purchased through the Google Play Store.
  - amazon: The product was purchased through the Amazon Appstore.
  - stripe: The product was purchased through Stripe.
  */
  store: string,

  /*
  Boolean indicating whether the subscription was purchased in sandbox or production environment.
  */
  is_sandbox: boolean,
}

export interface RevenuecatNonSubscriptionWithProductId {
  id: string,
  purchase_date: string,
  store: string,
  is_sandbox: boolean,

  product_id: string,
}
