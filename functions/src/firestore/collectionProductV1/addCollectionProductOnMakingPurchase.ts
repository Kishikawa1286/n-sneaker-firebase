import axios from 'axios';
import AdaptyNonSubscription from '../../interfaces/adaptyNonSubscription';
import CollectionProductV1 from '../../interfaces/collectionProductV1';
import admin from '../../utils/firestore';
import { incrementNumberOfCollectionProducts } from '../../utils/firestore/accountV1';
import { collectionProductExists, purchasedCollectionProductAlreadyExists } from '../../utils/firestore/collectionProductV1';
import { fetchProduct, incrementNumberOfHolders } from '../../utils/firestore/productV1';
import { functions128MB } from '../../utils/functions';

const { ADAPTY_KEY } = process.env;
axios.defaults.baseURL = 'https://api.adapty.io/api/v1/sdk';

const authenticateRecipt = async (uid: string, vendorProductId: string, purchasedAt: string):
Promise<boolean> => {
  try {
    const res = await axios.get(`/profiles/${uid}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Api-Key ${ADAPTY_KEY}`,
      },
    });
    const { data } = res.data;
    if (data === undefined) {
      throw Error('validation failed. (res.data.data is undefined)');
    }
    // non subscription全部
    const allNonSubscriptions = data.non_subscriptions;
    if (allNonSubscriptions === undefined) {
      throw Error('validation failed. (res.data.data.non_subscriptions is undefined)');
    }
    // 指定したpaywallのnon subscriptionの配列
    // 型定義を作っていないのでとりあえずArray<any>にキャストしている
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nonSubscriptions = allNonSubscriptions[vendorProductId] as
      Array<AdaptyNonSubscription> | undefined;
    // 決済情報がない場合はこれなので、throwはせず、falseを返す
    if (!nonSubscriptions) {
      console.error(`validation failed. (res.data.data.non_subscriptions.${vendorProductId} is undefined)`);
      return false;
    }
    // APIドキュメントを読む限りない(undefinedになる)はずだが、空配列の場合の処理
    if (nonSubscriptions.length === 0) {
      throw Error(`validation failed. (res.data.data.non_subscriptions.${vendorProductId} is empty array)`);
    }
    const purchasedAtOfNonSubscriptions = nonSubscriptions
      .map<string>((nonSubscription) => {
      const purchasedAtOfNonSubscription = nonSubscription.purchased_at as string | null;
      if (!purchasedAtOfNonSubscription) {
        return '';
      }
      return purchasedAtOfNonSubscription;
    });
    return purchasedAtOfNonSubscriptions.includes(purchasedAt);
  } catch (e) {
    console.error(e);
    return false;
  }
};

interface AddCollectionProductArgs {
  product_id: string,
  payment_method: string,
  purchased_at: string,
  vendor_product_id: string,
}

export default functions128MB.https
  .onCall(async (data: AddCollectionProductArgs, context): Promise<string> => {
    const productId = data.product_id;
    const paymentMethod = data.payment_method;
    const purchasedAt = data.purchased_at;
    const vendorProductId = data.vendor_product_id;

    const { auth } = context;
    try {
      if (auth === undefined) {
        throw Error('firebase auth does not exist.');
      }
      const { uid } = auth;

      if (!(await authenticateRecipt(uid, vendorProductId, purchasedAt))) {
        throw Error('recipt validation failed.');
      }

      if (await collectionProductExists(uid, productId)) {
        throw Error('document already exists.');
      }

      if (await purchasedCollectionProductAlreadyExists(uid, purchasedAt)) {
        throw Error('document whose purchased_at is given one already exists.');
      }

      const product = await fetchProduct(productId);

      // no document created yet
      const documentRef = admin.firestore().collection('collection_products_v1').doc();
      const now = admin.firestore.Timestamp.now();
      const collectionProduct: CollectionProductV1 = {
        id: documentRef.id,

        account_id: uid,
        payment_method: paymentMethod,
        purchased_at: purchasedAt,
        vendor_product_id: vendorProductId,

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
