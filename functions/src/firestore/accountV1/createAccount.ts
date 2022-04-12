import AccountV1 from '../../interfaces/accountV1';
import CollectionProductV1 from '../../interfaces/collectionProductV1';
import ProductV1 from '../../interfaces/productV1';
import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

const { DEFAULT_PRODUCT_ID } = process.env;

const fetchDefaultProduct = async (): Promise<ProductV1> => {
  try {
    if (DEFAULT_PRODUCT_ID === undefined) {
      throw Error('DEFAULT_PRODUCT_ID is not set.');
    }
    const productDocumentSnapshot = await admin.firestore()
      .collection('products_v1')
      .doc(DEFAULT_PRODUCT_ID).get();
    const product = productDocumentSnapshot.data() as ProductV1;
    if (product === undefined) {
      throw Error('failed to fetch product.');
    }
    return product;
  } catch (e) {
    throw Error('failed to fetch product.');
  }
};

const incrementNumberOfHolders = async (): Promise<void> => {
  try {
    if (DEFAULT_PRODUCT_ID === undefined) {
      throw Error('DEFAULT_PRODUCT_ID is not set.');
    }
    const ref = admin.firestore()
      .collection('products_v1')
      .doc(DEFAULT_PRODUCT_ID);
    ref.set({
      number_of_holders: admin.firestore.FieldValue.increment(1),
    }, { merge: true });
  } catch (e) {
    throw Error('failed to increment number_of_holders.');
  }
};

const addDefaultCollectionProduct = async (accountId: string)
: Promise<void> => {
  try {
    const product = await fetchDefaultProduct();
    const now = admin.firestore.Timestamp.now();
    const collectionProductDocumentRef = await admin.firestore()
      .collection('collection_products_v1').add({});
    const collectionProduct: CollectionProductV1 = {
      id: collectionProductDocumentRef.id,

      account_id: accountId,
      purchase_id: '',
      payment_method: 'sign_up_reward',
      vendor_product_id: '',
      purchased_at: '',

      created_at: now,
      last_edited_at: now,

      product_id: product.id,

      title: product.title,
      vendor: product.vendor,
      series: product.series,
      tags: product.tags,
      description: product.description,
      collection_product_statement: product.collection_product_statement,
      ar_statement: product.ar_statement,
      other_statement: product.other_statement,

      title_jp: product.title_jp,
      vendor_jp: product.vendor_jp,
      series_jp: product.series_jp,
      tags_jp: product.tags_jp,
      description_jp: product.description_jp,
      collection_product_statement_jp: product.collection_product_statement_jp,
      ar_statement_jp: product.ar_statement_jp,
      other_statement_jp: product.other_statement_jp,

      images: product.images,
      tile_images: product.tile_images,
      transparent_background_images: product.transparent_background_images,
    };
    await collectionProductDocumentRef.set(collectionProduct, { merge: true });
    await incrementNumberOfHolders();
  } catch (e) {
    throw Error('failed to increment number_of_holders.');
  }
};

// ログイン状態で関数を呼び出すとFirestoreに書き込む
export default functions128MB.https.onCall(async (data, context) => {
  const { auth } = context;
  if (auth === undefined) {
    return 1;
  }
  const { uid } = auth;

  // accounts_v1/uid
  const accountDocumentRef = admin.firestore().collection('accounts_v1').doc(uid);

  const now = admin.firestore.Timestamp.now();
  const account: AccountV1 = {
    id: uid,
    number_of_collection_products: 1,
    created_at: now,
    last_edited_at: now,
  };
  try {
    // ドキュメントがない場合のみ新規作成
    await accountDocumentRef.create(account);
    await addDefaultCollectionProduct(uid);
  } catch (e) {
    console.error(e);
    return 1;
  }

  return 0;
});
