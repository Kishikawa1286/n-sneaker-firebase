import CollectionProductV1 from '../../interfaces/collectionProductV1';
import admin from '../../utils/firestore';
import { incrementNumberOfCollectionProducts } from '../../utils/firestore/accountV1';
import {
  collectionProductExists,
  fetchAllCollectionProducts, generatePaymentMethod, packageIdToProductId,
} from '../../utils/firestore/collectionProductV1';
import { fetchProduct, incrementNumberOfHolders } from '../../utils/firestore/productV1';
import { functions512MB } from '../../utils/functions';
import { fetchNonSubscriptions } from '../../utils/revenuecat/nonSubscription';

interface AddCollectionProductArgs { product_id: string }

export default functions512MB.https
  .onCall(async (data: AddCollectionProductArgs, context): Promise<string> => {
    const productId = data.product_id;

    const { auth } = context;
    try {
      if (auth === undefined) {
        throw Error('firebase auth does not exist.');
      }
      const { uid } = auth;

      if (await collectionProductExists(uid, productId)) {
        throw Error('document already exists.');
      }

      const product = await fetchProduct(productId);
      const restorableProductIds = [
        ...product.restorable_revenuecat_package_ids,
        ...packageIdToProductId(product.revenuecat_package_id),
      ];

      const allCollectionProducts = await fetchAllCollectionProducts(uid, undefined);
      const revenuecatTransactionIdsOfAllCollectionProducts = allCollectionProducts
        .map((collectionProduct) => collectionProduct.revenuecat_transaction_id);

      const nonSubscriptions = await fetchNonSubscriptions(uid);
      // revenuecatのデータとfirestoreのデータを照合してfirestoreに登録できていない決済を見つける
      const incompletedNonSubscriptions = nonSubscriptions
        .filter(
          (nonSubscription) => !revenuecatTransactionIdsOfAllCollectionProducts
            .includes(nonSubscription.id ?? 'not set'),
        );
        // firestoreに未登録の決済の中から指定された商品の購入に使えるものを見つける
      const restorableNonSubscriptions = incompletedNonSubscriptions
        .filter(
          (nonSubscription) => restorableProductIds
            .includes(nonSubscription.product_id),
        );
      if (restorableNonSubscriptions.length === 0) {
        throw Error('no restorable non-subscription exists.');
      }
      const restoredNonSubscription = restorableNonSubscriptions[0];

      // no document created yet
      const documentRef = admin.firestore().collection('collection_products_v1').doc();
      const now = admin.firestore.Timestamp.now();
      const collectionProduct: CollectionProductV1 = {
        id: documentRef.id,

        account_id: uid,

        payment_method: generatePaymentMethod('app_store'),
        revenuecat_transaction_id: restoredNonSubscription.id,
        revenuecat_product_id: restoredNonSubscription.product_id,
        purchase_date: restoredNonSubscription.purchase_date,

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
