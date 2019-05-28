import * as functions from 'firebase-functions';

import './app-init';
import './user';
import { remindLateMembers } from './fcm';
import { updateUser, createUser } from './user';

exports.createUser = functions.https.onCall(createUser);
exports.updateUser = functions.https.onCall(updateUser);

exports.remindLateMembers = functions.https.onCall(remindLateMembers);
