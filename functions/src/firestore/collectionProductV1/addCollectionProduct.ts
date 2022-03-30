import axios from 'axios';
import CollectionProductV1 from '../../interfaces/collectionProductV1';
import ProductV1 from '../../interfaces/productV1';
import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

const { ADAPTY_KEY } = process.env;
axios.defaults.baseURL = 'https://api.adapty.io/api/v1/sdk';

const authenticateRecipt = async (uid: string, productId: string): Promise<boolean> => {
  try {
    const res = await axios.get(`/profiles/${uid}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Api-Key ${ADAPTY_KEY}`,
      },
    });
    const { data } = res.data;
    if (data === undefined) {
      throw Error('recipt validation failed. (res.data.data is undefined)');
    }
    const paidAccessLevels = data.paid_access_levels;
    if (paidAccessLevels === undefined) {
      throw Error('recipt validation failed. (res.data.data.paid_access_levels is undefined)');
    }
    if (paidAccessLevels[productId] === undefined) {
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    throw Error('recipt validation failed.');
  }
};

const fetchProduct = async (productId: string): Promise<ProductV1> => {
  try {
    const productDocumentSnapshot = await admin.firestore()
      .collection('products_v1')
      .doc(productId).get();
    const product = productDocumentSnapshot.data() as ProductV1;
    if (product === undefined) {
      throw Error('failed to fetch product.');
    }
    return product;
  } catch (e) {
    throw Error('failed to fetch product.');
  }
};

const incrementNumberOfHolders = async (productId: string): Promise<void> => {
  try {
    const ref = admin.firestore()
      .collection('products_v1')
      .doc(productId);
    ref.set({
      number_of_holders: admin.firestore.FieldValue.increment(1),
    }, { merge: true });
  } catch (e) {
    throw Error('failed to increment number_of_holders.');
  }
};

const incrementNumberOfCollectionProducts = async (accountId: string): Promise<void> => {
  try {
    const ref = admin.firestore()
      .collection('accounts_v1')
      .doc(accountId);
    ref.set({
      number_of_collection_products: admin.firestore.FieldValue.increment(1),
    }, { merge: true });
  } catch (e) {
    throw Error('failed to increment number_of_holders.');
  }
};

const collectionProductExists = async (accountId: string, productId: string): Promise<boolean> => {
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

interface AddCollectionProductArgs {
  product_id: string,
  payment_method: string,
  receipt: string,
}

export default functions128MB.https
  .onCall(async (data: AddCollectionProductArgs, context): Promise<string> => {
    const productId = data.product_id;
    const paymentMethod = data.payment_method;
    const { receipt } = data;

    const { auth } = context;
    try {
      if (auth === undefined) {
        throw Error('firebase auth does not exist.');
      }
      const { uid } = auth;

      if (!(await authenticateRecipt(uid, productId))) {
        throw Error('recipt validation failed.');
      }

      if (await collectionProductExists(uid, productId)) {
        throw Error('document already exists.');
      }

      const product = await fetchProduct(productId);

      // no document created yet
      const documentRef = admin.firestore().collection('collection_products_v1').doc();
      const now = admin.firestore.Timestamp.now();
      const collectionProduct: CollectionProductV1 = {
        id: documentRef.id,

        app_store_id: product.app_store_id,
        play_store_id: product.play_store_id,

        account_id: uid,
        payment_method: paymentMethod,
        receipt,

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
      await documentRef.create(collectionProduct);
      await incrementNumberOfHolders(productId);
      await incrementNumberOfCollectionProducts(uid);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      return e.toString();
    }

    return 'success';
  });
