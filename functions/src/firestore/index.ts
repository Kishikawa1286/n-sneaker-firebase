import * as AccountV1 from './accountV1';
import * as AdminAccountV1 from './adminAccountV1';
import * as CollectionProductV1 from './collectionProductV1';
import * as Backup from './backup';
import * as FavoriteGalleryPostV1 from './favoriteGalleryPostV1';

export const accountV1 = { ...AccountV1 };
export const adminAccountV1 = { ...AdminAccountV1 };
export const collectionProductV1 = { ...CollectionProductV1 };
export const backup = Backup;
export const favoriteGalleryPostV1 = { ...FavoriteGalleryPostV1 };
