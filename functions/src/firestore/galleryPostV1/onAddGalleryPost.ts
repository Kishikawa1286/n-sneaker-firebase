import GalleryPostV1 from '../../interfaces/galleryPostV1';
import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

export default functions128MB.firestore
  .document('gallery_posts_v1/{galleryPostId}')
  .onCreate(async (snap) => {
    const galleryPost = snap.data() as GalleryPostV1;
    const accountId = galleryPost.account_id;
    const ref = admin.firestore()
      .collection('accounts_v1')
      .doc(accountId);
    await ref.set({
      number_of_gallery_posts: admin.firestore.FieldValue.increment(1),
      last_edited_at: admin.firestore.Timestamp.now(),
    }, { merge: true });
  });
