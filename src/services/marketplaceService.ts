import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { db, storage } from '../lib/firebase';
import { Listing, Category } from '../types';

export const marketplaceService = {
  async getListings(
    params: { 
      category?: Category; 
      minPrice?: number; 
      maxPrice?: number; 
      lastVisible?: QueryDocumentSnapshot;
    } = {}
  ) {
    let q = query(
      collection(db, 'listings'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    if (params.category) {
      q = query(q, where('category', '==', params.category));
    }

    if (params.lastVisible) {
      q = query(q, startAfter(params.lastVisible));
    }

    const snapshot = await getDocs(q);
    return {
      docs: snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Listing)),
      lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
  },

  async getListing(id: string) {
    const docRef = doc(db, 'listings', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Listing not found');
    return { id: docSnap.id, ...docSnap.data() } as Listing;
  },

  async createListing(data: Partial<Listing>, images: File[]) {
    console.log('Starting listing creation with', images.length, 'images');
    
    // Compression options
    const compressionOptions = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    try {
      const imageUrls = await Promise.all(
        images.map(async (file, index) => {
          console.log(`Processing image ${index + 1}...`);
          
          // Compress image
          const compressedFile = await imageCompression(file, compressionOptions);
          console.log(`Image ${index + 1} compressed from ${file.size / 1024 / 1024}MB to ${compressedFile.size / 1024 / 1024}MB`);

          // Upload to storage
          const fileRef = ref(storage, `listings/${Date.now()}_${index}_${file.name}`);
          const uploadResult = await uploadBytes(fileRef, compressedFile);
          const url = await getDownloadURL(uploadResult.ref);
          
          console.log(`Image ${index + 1} uploaded successfully`);
          return url;
        })
      );

      console.log('All images uploaded, creating Firestore document...');
      const listingData = {
        ...data,
        images: imageUrls,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'listings'), listingData);
      console.log('Listing document created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error in createListing:', error);
      throw error;
    }
  },

  async getUserListings(userId: string) {
    const q = query(
      collection(db, 'listings'),
      where('sellerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Listing));
  }
};
