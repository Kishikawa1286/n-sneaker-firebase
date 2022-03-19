import { CallableContext } from 'firebase-functions/v1/https';
import CollectionProductV1 from '../../interfaces/collectionProductV1';
import ProductV1 from '../../interfaces/productV1';
import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authenticateRecipt = async (context: CallableContext): Promise<boolean> => {
  const reciptAuthenticated = true;
  return reciptAuthenticated;
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

interface AddCollectionProductArgs {
  product_id: string,
  payment_method: string,
}

export default functions128MB.https
  .onCall(async (data: AddCollectionProductArgs, context): Promise<string> => {
  // TODO: 型安全が保証された段階で消す
    admin.firestore().settings({ ignoreUndefinedProperties: true });

    const productId = data.product_id;
    const paymentMethod = data.payment_method;

    const { auth } = context;
    try {
      if (auth === undefined) {
        throw Error('firebase auth does not exist.');
      }
      const { uid } = auth;

      if (!(await authenticateRecipt(context))) {
        throw Error('authenticating reciept failed.');
      }

      const product = await fetchProduct(productId);

      // no document created yet
      const documentRef = admin.firestore().collection('collection_products_v1').doc();
      const now = admin.firestore.Timestamp.now();
      const collectionProduct: CollectionProductV1 = {
        id: documentRef.id,

        account_id: uid,
        payment_method: paymentMethod,

        created_at: now,
        last_edited_at: now,

        product_id: product.id,

        title: product.title,
        vendor: product.verndor,
        series: product.series,
        tags: product.tags,
        description: product.description,
        collection_product_statement: product.collection_product_statement,
        ar_statement: product.ar_statement,
        other_statement: product.other_statement,

        title_jp: product.title_jp,
        verndor_jp: product.verndor_jp,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      return e.toString();
    }

    return 'success';
  });
