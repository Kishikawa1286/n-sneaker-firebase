import CollectionProductV1 from '../../interfaces/collectionProductV1';
import admin from '../../utils/firestore';
import { incrementNumberOfCollectionProducts } from '../../utils/firestore/accountV1';
import { collectionProductExists, generatePaymentMethod, purchasedCollectionProductAlreadyExists } from '../../utils/firestore/collectionProductV1';
import { fetchProduct, incrementNumberOfHolders } from '../../utils/firestore/productV1';
import { functions128MB } from '../../utils/functions';
import { fetchNonSubscriptions } from '../../utils/revenuecat/nonSubscription';

interface AddCollectionProductArgs {
  product_id: string,
  revenuecat_transaction_id: string,
}

export default functions128MB.https
  .onCall(async (data: AddCollectionProductArgs, context): Promise<string> => {
    const productId = data.product_id;
    const revenuecatTransactionId = data.revenuecat_transaction_id;

    const { auth } = context;
    try {
      if (auth === undefined) {
        throw Error('firebase auth does not exist.');
      }
      const { uid } = auth;

      // すでに所持している場合
      if (await collectionProductExists(uid, productId)) {
        throw Error('document already exists.');
      }
      // tra
      if (await purchasedCollectionProductAlreadyExists(revenuecatTransactionId)) {
        throw Error('document whose vendor_transaction_id is given one already exists.');
      }

      const nonSubscriptions = await fetchNonSubscriptions(uid);
      const nonSubscriptionsSpecifiedWithTransactionId = nonSubscriptions.filter(
        (ns) => ns.id === revenuecatTransactionId,
      );
      if (nonSubscriptionsSpecifiedWithTransactionId.length === 0) {
        throw Error('nonSubscriptionsSpecifiedWithTransactionId is empty.');
      }
      const nonSubscription = nonSubscriptionsSpecifiedWithTransactionId[0];

      const product = await fetchProduct(productId);

      // no document created yet
      const documentRef = admin.firestore().collection('collection_products_v1').doc();
      const now = admin.firestore.Timestamp.now();
      const collectionProduct: CollectionProductV1 = {
        id: documentRef.id,

        account_id: uid,

        payment_method: generatePaymentMethod(nonSubscription.store),
        revenuecat_transaction_id: revenuecatTransactionId,
        revenuecat_product_id: nonSubscription.product_id,
        purchase_date: nonSubscription.purchase_date,

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
