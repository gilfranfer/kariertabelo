const functions = require('firebase-functions');
const firebase_tools = require('firebase-tools');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

/* Cloud Function triggered when a document is deleted on the path: /users/{userId}/ ,
to recursively remove all the data inside the User Document collections: resumes, customs*/
exports.removeUserCollections = functions.firestore.document('users/{userId}')
  .onDelete((snap, context) => {
    // const deletedUser = snap.data();
    const userID = context.params.userId;
    let pathR = 'users/'+userID+'/resumes'
    let pathC = 'users/'+userID+'/customs'

    // console.log(pathR, pathC);
    firebase_tools.firestore.delete(pathR, {project: process.env.GCLOUD_PROJECT, recursive: true,yes: true});
    firebase_tools.firestore.delete(pathC, {project: process.env.GCLOUD_PROJECT, recursive: true,yes: true});
  });
