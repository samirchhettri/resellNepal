import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chat, Message } from '../types';

export const chatService = {
  async getOrCreateChat(buyerId: string, sellerId: string, listing: { id: string; title: string; price: number; image: string }) {
    if (buyerId === sellerId) throw new Error("You cannot chat with yourself");

    // Check if chat already exists
    const q = query(
      collection(db, 'chats'),
      where('listingId', '==', listing.id),
      where('participants', 'array-contains', buyerId)
    );
    
    const snapshot = await getDocs(q);
    const existingChat = snapshot.docs.find(d => (d.data() as Chat).participants.includes(sellerId));

    if (existingChat) {
      return existingChat.id;
    }

    // Create new chat
    const chatData = {
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingImage: listing.image,
      participants: [buyerId, sellerId],
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'chats'), chatData);
    return docRef.id;
  },

  subscribeToChats(userId: string, callback: (chats: Chat[]) => void) {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Chat));
      callback(chats);
    });
  },

  subscribeToMessages(chatId: string, callback: (msgs: Message[]) => void) {
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(msgs);
    });
  },

  async sendMessage(chatId: string, senderId: string, content: string) {
    const messageData = {
      senderId,
      content,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
    
    // Update chat metadata for list preview
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: content,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};
