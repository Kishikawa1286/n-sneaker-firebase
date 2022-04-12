import axios from 'axios';
import AdaptyNonSubscription from '../../interfaces/adaptyNonSubscription';

const { ADAPTY_KEY } = process.env;
axios.defaults.baseURL = 'https://api.adapty.io/api/v1/sdk';

export const fetchNonSubscriptions = async (accountId: string):
Promise<Array<AdaptyNonSubscription>> => {
  const res = await axios.get(`/profiles/${accountId}/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Api-Key ${ADAPTY_KEY}`,
    },
  });
  const { data } = res.data;
  if (data === undefined) {
    throw Error('validation failed. (res.data.data is undefined)');
  }
  /// https://docs.adapty.io/docs/server-side-api-objects
  /// Dictionary where the keys are vendor product ids.
  /// Values are an array of Non Subscription objects.
  /// Can be null if the customer has no purchases.
  const allNonSubscriptions = data.non_subscriptions;
  if (allNonSubscriptions === undefined) {
    throw Error('validation failed. (res.data.data.non_subscriptions is undefined)');
  }
  const vendorProductIds = Object.keys(allNonSubscriptions);
  const flattenedAllNonSubscriptions = vendorProductIds.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vendorProductId) => allNonSubscriptions[vendorProductId] as Array<AdaptyNonSubscription>,
  ).flat();
  return flattenedAllNonSubscriptions;
};
