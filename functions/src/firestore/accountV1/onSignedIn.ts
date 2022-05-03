import AccountV1 from '../../interfaces/accountV1';
import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';
import { incrementPoint, updateLastSignedInAt } from '../../utils/firestore/accountV1';

const tryIncrementPoint = async (account: AccountV1, uid: string) => {
  const lastSignedInAt = account.last_edited_at.toDate();
  const now = admin.firestore.Timestamp.now().toDate();

  if (lastSignedInAt.getFullYear() > now.getFullYear()) {
    return;
  }
  if (lastSignedInAt.getFullYear() < now.getFullYear()) {
    await incrementPoint(uid);
    return;
  }
  // same year
  if (lastSignedInAt.getMonth() > now.getMonth()) {
    return;
  }
  if (lastSignedInAt.getMonth() < now.getMonth()) {
    await incrementPoint(uid);
    return;
  }
  // same year, same month
  if (lastSignedInAt.getDate() < now.getDate()) {
    await incrementPoint(uid);
  }
};

export default functions128MB.https.onCall(async (data, context) => {
  const { auth } = context;
  if (auth === undefined) {
    return 1;
  }
  const { uid } = auth;

  const documentRef = admin.firestore()
    .collection('accounts_v1')
    .doc(uid);
  const snapshot = await documentRef.get();
  const account = snapshot.data() as AccountV1;

  await tryIncrementPoint(account, uid);
  await updateLastSignedInAt(uid);

  return 0;
});
