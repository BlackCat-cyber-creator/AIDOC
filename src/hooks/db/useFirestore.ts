'use client';

import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  DocumentReference,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface UseFirestoreResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  add: (data: Omit<T, 'id'>) => Promise<DocumentReference<DocumentData> | null>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFirestore<T extends { id?: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): UseFirestoreResult<T> {
  const [user] = useAuthState(auth);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCollectionRef = useCallback(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, collectionName);
  }, [user, collectionName]);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const colRef = getCollectionRef();
      if (!colRef) return;

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // IMPORTANT: doc.id must overwrite any 'id' field in data to ensure correct selection/deletion
      })) as T[];

      setData(items);
    } catch (err: any) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, getCollectionRef, constraints, collectionName]);

  // Initial fetch
  useState(() => {
    refresh();
  });

  const add = async (item: Omit<T, 'id'>) => {
    if (!user) return null;
    try {
      const colRef = getCollectionRef();
      if (!colRef) return null;

      const docRef = await addDoc(colRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        id: user.uid, // Explicitly set the internal ID to user UID for ownership rules
      });

      await refresh();
      return docRef;
    } catch (err: any) {
      console.error(`Error adding to ${collectionName}:`, err);
      setError(err);
      return null;
    }
  };

  const update = async (id: string, item: Partial<T>) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, collectionName, id);

      // Remove 'id' from the item to prevent overwriting the internal ownership ID with the document ID
      const { id: _, ...dataToUpdate } = item as any;

      await updateDoc(docRef, {
        ...dataToUpdate,
        updatedAt: serverTimestamp(),
      });
      await refresh();
    } catch (err: any) {
      console.error(`Error updating ${collectionName}:`, err);
      setError(err);
    }
  };

  const remove = async (id: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, collectionName, id);
      await deleteDoc(docRef);
      await refresh();
    } catch (err: any) {
      console.error(`Error deleting from ${collectionName}:`, err);
      setError(err);
    }
  };

  return { data, loading, error, add, update, remove, refresh };
}
