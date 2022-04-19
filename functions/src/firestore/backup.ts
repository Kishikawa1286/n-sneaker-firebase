import admin from '../utils/firestore';
import { functions512MB } from '../utils/functions';

const targetCollectionIds: Array<string> = [
  'accounts_v1',
  'admin_accounts_v1',
  'collection_products_v1',
  'launch_configs_v1',
  'market_page_tabs_v1',
  'products_v1',
  'product_glb_files_v1',
];

const client = new admin.firestore.v1.FirestoreAdminClient();
const { FIRESTORE_BACKUP_BUCKET } = process.env;

export default functions512MB
  .region('asia-northeast1')
  .pubsub.schedule('every 72 hours')
  .onRun(() => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    if (projectId === undefined) return -1;

    const databaseName = client.databasePath(projectId, '(default)');
    return client.exportDocuments({
      name: databaseName,
      outputUriPrefix: FIRESTORE_BACKUP_BUCKET,
      collectionIds: targetCollectionIds,
    })
      .then((responses) => {
        const response = responses[0];
        console.log(`Operation Name: ${response.name}`);
      })
      .catch((err) => {
        console.error(err);
        throw new Error('Export operation failed');
      });
  });
