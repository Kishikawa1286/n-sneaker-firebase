import axios from 'axios';
import CollectionProductV1 from '../../interfaces/collectionProductV1';
import { fetchNonSubscriptions } from '../../utils/adapty/nonSubscription';
import admin from '../../utils/firestore';
import { incrementNumberOfCollectionProducts } from '../../utils/firestore/accountV1';
import { collectionProductExists, generatePaymentMethod, purchasedCollectionProductAlreadyExists } from '../../utils/firestore/collectionProductV1';
import { fetchProduct, incrementNumberOfHolders } from '../../utils/firestore/productV1';
import { functions128MB } from '../../utils/functions';

axios.defaults.baseURL = 'https://api.adapty.io/api/v1/sdk';

interface AddCollectionProductArgs {
  product_id: string,
  purchase_id: string,
}

export default functions128MB.https
  .onCall(async (data: AddCollectionProductArgs, context): Promise<string> => {
    const productId = data.product_id;
    const purchaseId = data.purchase_id;

    const { auth } = context;
    try {
      if (auth === undefined) {
        throw Error('firebase auth does not exist.');
      }
      const { uid } = auth;

      if (await collectionProductExists(uid, productId)) {
        throw Error('document already exists.');
      }

      const allNonSubscriptions = await fetchNonSubscriptions(uid);
      // 空または要素1つ
      const nonSubscriptionsSpecifiedWithVendorProductId = allNonSubscriptions.filter(
        (ns) => ns.purchase_id === purchaseId,
      );
      if (nonSubscriptionsSpecifiedWithVendorProductId.length === 0) {
        throw Error('nonSubscriptionsSpecifiedWithVendorProductId is empty.');
      }
      const nonSubscription = nonSubscriptionsSpecifiedWithVendorProductId[0];

      if (await purchasedCollectionProductAlreadyExists(uid, nonSubscription.purchase_id)) {
        throw Error('document whose purchased_at is given one already exists.');
      }

      const product = await fetchProduct(productId);

      // no document created yet
      const documentRef = admin.firestore().collection('collection_products_v1').doc();
      const now = admin.firestore.Timestamp.now();
      const collectionProduct: CollectionProductV1 = {
        id: documentRef.id,

        account_id: uid,
        payment_method: generatePaymentMethod(nonSubscription.store ?? ''),
        purchase_id: nonSubscription.purchase_id,
        purchased_at: nonSubscription.purchased_at,
        vendor_product_id: nonSubscription.vendor_product_id ?? '',

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
