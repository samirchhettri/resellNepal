export type Category = 'Books' | 'Electronics' | 'Bikes' | 'Others';

export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  college?: string;
  verified?: boolean;
  role?: 'student' | 'admin';
  createdAt: any;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  area: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  status: 'active' | 'sold' | 'deleted';
  createdAt: any;
  updatedAt: any;
}

export interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: any;
}
