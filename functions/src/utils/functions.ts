import * as f from 'firebase-functions';

export default f.runWith({ memory: '256MB' }).region('asia-northeast1');

export const functions512MB = f.runWith({ memory: '512MB' }).region('asia-northeast1');
export const functions128MB = f.runWith({ memory: '128MB' }).region('asia-northeast1');
