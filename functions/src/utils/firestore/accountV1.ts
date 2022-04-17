import admin from '../firestore';

export const incrementNumberOfCollectionProducts = async (accountId: string): Promise<void> => {
  try {
    const ref = admin.firestore()
      .collection('accounts_v1')
      .doc(accountId);
    ref.set({
      number_of_collection_products: admin.firestore.FieldValue.increment(1),
      last_edited_at: admin.firestore.Timestamp.now(),
    }, { merge: true });
  } catch (e) {
    throw Error('failed to increment number_of_holders.');
  }
};
