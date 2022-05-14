import CollectionProductV1 from '../../interfaces/collectionProductV1';
import admin from '../../utils/firestore';
import { fetchAccount, incrementNumberOfCollectionProducts } from '../../utils/firestore/accountV1';
import { collectionProductExists } from '../../utils/firestore/collectionProductV1';
import { fetchProduct, incrementNumberOfHolders } from '../../utils/firestore/productV1';
import { fetchSignInReward } from '../../utils/firestore/signInRewardV1';
import { functions128MB } from '../../utils/functions';

export default functions128MB.https
  .onCall(async (data, context) => {
    const { auth } = context;
    if (auth === undefined) {
      throw Error('firebase auth does not exist.');
    }
    const { uid } = auth;

    try {
      const signInReward = await fetchSignInReward();
      const account = await fetchAccount(uid);

      if (account.point < signInReward.consumed_point) {
        throw Error('not enough points.');
      }
      if (await collectionProductExists(uid, signInReward.product_id)) {
        throw Error('collection product already exists.');
      }

      const product = await fetchProduct(signInReward.product_id);

      const documentRef = admin.firestore().collection('collection_products_v1').doc();
      const now = admin.firestore.Timestamp.now();
      const collectionProduct: CollectionProductV1 = {
        id: documentRef.id,

        account_id: uid,
        payment_method: 'sign_in_reward',
        vendor_transaction_id: '',
        purchased_at: '',
        vendor_product_id: '',

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
      await incrementNumberOfHolders(signInReward.product_id);
      await incrementNumberOfCollectionProducts(uid);
    } catch (e) {
      console.error(e);
    }
  });
