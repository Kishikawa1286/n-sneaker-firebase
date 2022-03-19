import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

export default functions128MB.https
  .onCall(async (data, context): Promise<boolean> => {
    const { auth } = context;

    if (auth === undefined) {
      return false;
    }
    const { uid } = auth;
    if (uid === undefined) {
      return false;
    }

    const userRecord = await admin.auth().getUser(uid);
    const { customClaims } = userRecord;
    if (customClaims === undefined) {
      return false;
    }
    const isAdmin = customClaims.admin as boolean | undefined;

    return isAdmin ?? false;
  });
