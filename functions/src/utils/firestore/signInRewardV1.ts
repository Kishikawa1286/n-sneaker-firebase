import SignInRewardV1 from '../../interfaces/signInRewardV1';
import admin from '../firestore';

export const fetchSignInReward = async (): Promise<SignInRewardV1> => {
  const querySnapshot = await admin.firestore()
    .collection('sign_in_rewards_v1').get();
  if (querySnapshot.docs.length === 0) {
    throw Error('failed to fetch sign in reward.');
  }
  const documentSnapshot = querySnapshot.docs[0].data() as SignInRewardV1;
  return documentSnapshot;
};
