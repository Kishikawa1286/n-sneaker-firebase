import ProductV1 from '../../interfaces/productV1';
import admin from '../firestore';

export const fetchProduct = async (productId: string): Promise<ProductV1> => {
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

export const incrementNumberOfHolders = async (productId: string): Promise<void> => {
  try {
    const ref = admin.firestore()
      .collection('products_v1')
      .doc(productId);
    ref.set({
      number_of_holders: admin.firestore.FieldValue.increment(1),
      last_edited_at: admin.firestore.Timestamp.now(),
    }, { merge: true });
  } catch (e) {
    throw Error('failed to increment number_of_holders.');
  }
};
