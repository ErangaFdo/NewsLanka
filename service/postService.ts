// services/postService.ts
import { getAuth } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { db } from './firebase'

const auth = getAuth()
const postsCollection = collection(db, 'posts')

export const addPost = async (
  title: string,
  author: string,
  category: string,
  content: string,
  imageBase64: string | null = null
) => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated.')

  await addDoc(postsCollection, {
    title,
    author,
    category,
    content,
    imageBase64,
    userId: user.uid,
    likesCount: 0,             
    likedBy: [],
    createdAt: new Date().toISOString()
  })
}

export const getAllPosts = async () => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated.')

  const q = query(
    postsCollection,
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      title: data.title as string,
      author: data.author as string,
      category: data.category as string,
      content: data.content as string,
      imageBase64: data.imageBase64 || null,
      createdAt: data.createdAt as string
    }
  })
}

export const getPostById = async (id: string) => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated.')

  const ref = doc(db, 'posts', id)
  const postDoc = await getDoc(ref)

  if (!postDoc.exists()) throw new Error('Post not found')

  const data = postDoc.data()
  if (data.userId !== user.uid) throw new Error('Unauthorized')

  return {
    id: postDoc.id,
    title: data.title || '',
    author: data.author || '',
    category: data.category || '',
    content: data.content || '',
    imageBase64: data.imageBase64 || null,
    createdAt: data.createdAt || ''
  }
}

// Update a post
export const updatePost = async (
  id: string,
  title: string,
  // author: string,
  category: string,
  content: string,
  imageBase64?: string | null
) => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated.')

  const ref = doc(db, 'posts', id)
  const snap = await getDoc(ref)

  if (!snap.exists()) throw new Error('Post not found')

  const data = snap.data()
  if (data.userId !== user.uid) throw new Error('Unauthorized')

  await updateDoc(ref, {
    title,
    // author,
    category,
    content,
    imageBase64: imageBase64 ?? data.imageBase64
  })
}

export const deletePost = async (id: string) => {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated.')

  const ref = doc(db, 'posts', id)
  const snap = await getDoc(ref)

  if (!snap.exists()) throw new Error('Post not found')
  if (snap.data().userId !== user.uid) throw new Error('Unauthorized')

  await deleteDoc(ref)
}

export const addBookmarkToPost = async (postId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  await setDoc(doc(db, "users", user.uid, "bookmarks", postId), {
    createdAt: Timestamp.now(),
  });
};

// Remove a bookmark for a post
export const removeBookmarkFromPost = async (postId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  await deleteDoc(doc(db, "users", user.uid, "bookmarks", postId));
};