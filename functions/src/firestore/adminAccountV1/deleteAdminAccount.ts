import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

export default functions128MB.firestore
  .document('admin_accounts_v1/{docID}').onDelete((snap) => {
    const { id } = snap;
    if (id === undefined) return;
    admin.auth().setCustomUserClaims(id, { admin: false });
  });
