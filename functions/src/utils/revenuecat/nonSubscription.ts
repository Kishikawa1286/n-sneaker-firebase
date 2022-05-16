import axios from 'axios';
import { RevenuecatNonSubscription, RevenuecatNonSubscriptionWithProductId } from '../../interfaces/revenuecatNonSubscription';

const { REVENUECAT_KEY } = process.env;
const endPoint = (appUserId: string): string => `https://api.revenuecat.com/v1/subscribers/${appUserId}`;

// see: https://docs.revenuecat.com/reference/subscribers#the-subscriber-object
export const fetchNonSubscriptions = async (accountId: string)
:Promise<Array<RevenuecatNonSubscriptionWithProductId>> => {
  const res = await axios.get(endPoint(accountId), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${REVENUECAT_KEY}`,
    },
  });
  const { subscriber } = res.data;
  if (subscriber === undefined) {
    throw Error('recipt validation failed. (res.data.subscriber is undefined)');
  }
  const nonSubscriptions = subscriber.non_subscriptions;
  if (nonSubscriptions === undefined || nonSubscriptions === null) {
    throw Error('validation failed. (res.data.subscriber.non_subscriptions is undefined or null)');
  }

  /*
  A mapping of Non-Subscription object arrays keyed by product ID.
  Non-Subscription Purchases include consumables, non-consumables, and non-renewing subscriptions.
  */
  const nonSubscriptionProductIds = Object.keys(nonSubscriptions);
  const flattenedNonSubscriptions = nonSubscriptionProductIds.map(
    (nonSubscriptionProductId) => (nonSubscriptions[nonSubscriptionProductId] as
      Array<RevenuecatNonSubscription>)
      .map((nonSubscription) => ({
        id: nonSubscription.id,
        purchase_date: nonSubscription.purchase_date,
        store: nonSubscription.store,
        is_sandbox: nonSubscription.is_sandbox,
        product_id: nonSubscriptionProductId,
      } as RevenuecatNonSubscriptionWithProductId)),
  ).flat();

  return flattenedNonSubscriptions;
};
