import CollectionProductV1 from '../../interfaces/collectionProductV1';
import admin from '../firestore';

export const collectionProductExists = async (accountId: string, productId: string):
Promise<boolean> => {
  try {
    const querySnapshot = await admin.firestore()
      .collection('collection_products_v1')
      .where('account_id', '==', accountId)
      .where('product_id', '==', productId)
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
  accountId: string,
  purchasedAt: string,
):Promise<boolean> => {
  try {
    const querySnapshot = await admin.firestore()
      .collection('collection_products_v1')
      .where('account_id', '==', accountId)
      .where('purchased_at', '==', purchasedAt)
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
