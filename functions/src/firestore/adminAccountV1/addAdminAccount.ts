import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

export default functions128MB.firestore
  .document('admin_accounts_v1/{docID}').onCreate((snap) => {
    const newAdminAccount = snap.data();
    if (newAdminAccount === undefined) return;
    admin.auth().setCustomUserClaims(newAdminAccount.id, { admin: true });
  });
