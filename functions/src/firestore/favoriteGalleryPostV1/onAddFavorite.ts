import admin from '../../utils/firestore';
import { functions128MB } from '../../utils/functions';

export default functions128MB.firestore
  .document('gallery_posts_v1/{galleryPostId}/favorite_gallery_posts_v1/{favoriteGalleryPostId}')
  .onCreate(async (snap, context) => {
    const galleryPostId = context.params.galleryPostId as string;
    const ref = admin.firestore()
      .collection('gallery_posts_v1')
      .doc(galleryPostId);
    await ref.set({
      number_of_favorites: admin.firestore.FieldValue.increment(1),
      last_edited_at: admin.firestore.Timestamp.now(),
    }, { merge: true });
  });
