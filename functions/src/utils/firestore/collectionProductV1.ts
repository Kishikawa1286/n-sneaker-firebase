import CollectionProductV1 from '../../interfaces/collectionProductV1';
import admin from '../firestore';

const { FLAVOR } = process.env;

export const collectionProductExists = async (accountId: string, productId: string):
Promise<boolean> => {
  try {
    const querySnapshot = await admin.firestore()
      .collection('collection_products_v1')
      .where('account_id', '==', accountId)
      .where('product_id', '==', productId)
      .limit(1)
      .get();
    if (querySnapshot.docs.length === 0) {
      return false;
    }
    return true;
  } catch (e) {
    throw Error('failed to fetch collection product.');
  }
};

export const purchasedCollectionProductAlreadyExists = async (
  revenuecatTransactionId: string,
):Promise<boolean> => {
  try {
    const querySnapshot = await admin.firestore()
      .collection('collection_products_v1')
      .where('revenuecat_transaction_id', '==', revenuecatTransactionId)
      .limit(1)
      .get();
    if (querySnapshot.docs.length === 0) {
      return false;
    }
    return true;
  } catch (e) {
    throw Error('failed to fetch collection product.');
  }
};

export const fetchAllCollectionProducts = async (
  accountId: string,
  startAfter: admin.firestore.DocumentSnapshot | undefined,
):Promise<Array<CollectionProductV1>> => {
  const limit = 128;
  try {
    const querySnapshot = startAfter === undefined ? await admin.firestore()
      .collection('collection_products_v1')
      .where('account_id', '==', accountId)
      .limit(limit)
      .get()
      : await admin.firestore()
        .collection('collection_products_v1')
        .where('account_id', '==', accountId)
        .startAfter(startAfter)
        .limit(limit)
        .get();
    const { docs } = querySnapshot;
    const data = docs.map((doc) => doc.data() as CollectionProductV1);
    if (docs.length < limit) {
      return data;
    }
    return [
      ...data,
      ...(await fetchAllCollectionProducts(accountId, docs[docs.length - 1])),
    ];
  } catch (e) {
    throw Error('failed to fetch collection product.');
  }
};

export const convertPaywallIdToVendorProductIds = (paywallId: string): Array<string> => {
  if (FLAVOR === 'prod') {
    return [
      `com.nevermind.nsneaker.play_store.${paywallId}`,
      `com.nevermind.nsneaker.app_store.${paywallId}`,
    ];
  }
  return [
    `com.nevermind.nsneakerdev.play_store.${paywallId}`,
    `com.nevermind.nsneakerdev.app_store.${paywallId}`,
  ];
};

export const generatePaymentMethod = (store: string): string => {
  if (store === 'play_store') {
    return 'play_store';
  }
  if (store === 'app_store') {
    return 'app_store';
  }
  return 'unknown';
};
