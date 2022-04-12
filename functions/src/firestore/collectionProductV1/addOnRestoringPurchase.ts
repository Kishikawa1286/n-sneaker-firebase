import CollectionProductV1 from '../../interfaces/collectionProductV1';
import { fetchNonSubscriptions } from '../../utils/adapty/nonSubscription';
import admin from '../../utils/firestore';
import { incrementNumberOfCollectionProducts } from '../../utils/firestore/accountV1';
import {
  collectionProductExists, convertPaywallIdToVendorProductIds,
  fetchAllCollectionProducts, generatePaymentMethod,
} from '../../utils/firestore/collectionProductV1';
import { fetchProduct, incrementNumberOfHolders } from '../../utils/firestore/productV1';
import { functions128MB } from '../../utils/functions';

interface AddCollectionProductArgs { product_id: string }

export default functions128MB.https
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

      const allCollectionProducts = await fetchAllCollectionProducts(uid, undefined);
      const purchaseIdsOfAllCollectionProducts = allCollectionProducts
        .map((collectionProduct) => collectionProduct.purchase_id);
      const restorableVendorProductIds = [
        ...product.restorable_adapty_vendor_product_ids,
        ...convertPaywallIdToVendorProductIds(product.adapty_paywall_id),
      ];

      const nonSubscriptions = await fetchNonSubscriptions(uid);
      // adaptyのデータとfirestoreのデータを照合してfirestoreに登録できていない決済を見つける
      const incompletedNonSubscriptions = nonSubscriptions
        .filter(
          (nonSubscription) => !purchaseIdsOfAllCollectionProducts
            .includes(nonSubscription.purchase_id),
        );
      const restorableNonSubscriptions = incompletedNonSubscriptions
        .filter(
          (nonSubscription) => restorableVendorProductIds
            .includes(nonSubscription.vendor_product_id ?? 'not set'),
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
        payment_method: generatePaymentMethod(restoredNonSubscription.store ?? ''),
        purchase_id: restoredNonSubscription.purchase_id,
        purchased_at: restoredNonSubscription.purchased_at,
        vendor_product_id: restoredNonSubscription.vendor_product_id ?? '',

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
