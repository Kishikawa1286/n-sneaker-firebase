import AccountV1 from '../../interfaces/accountV1';
import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

// ログイン状態で関数を呼び出すとFirestoreに書き込む
export default functions128MB.https.onCall(async (data, context) => {
  const { auth } = context;
  if (auth === undefined) {
    return 1;
  }
  const { uid } = auth;

  // accounts_v1/uid
  const documentRef = admin.firestore().collection('accounts_v1').doc(uid);

  const now = admin.firestore.Timestamp.now();
  const account: AccountV1 = {
    id: uid,
    number_of_collection_products: 0,
    created_at: now,
    last_edited_at: now,
  };
  try {
    // ドキュメントがない場合のみ新規作成
    await documentRef.create(account);
  } catch (e) {
    console.error(e);
    return 1;
  }

  return 0;
});
