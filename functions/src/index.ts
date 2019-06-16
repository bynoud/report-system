import * as functions from 'firebase-functions';

import './app-init';
import { remindLateMembers, removeFcmToken } from './fcm';
import { setCompanyEmail, setManager, setRole, createUser } from './user';

exports.createUser = functions.https.onCall(createUser);
exports.setRole = functions.https.onCall(setRole);
exports.setManager = functions.https.onCall(setManager);
exports.setCompanyEmail = functions.https.onCall(setCompanyEmail);

exports.remindLateMembers = functions.https.onCall(remindLateMembers);
exports.removeFcmToken = functions.https.onCall(removeFcmToken);