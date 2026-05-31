export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Participant {
  user: User;
  shareAmount?: number;
  sharedAmount?: number;
}

export interface Payment {
  user: User;
  paidAmount: number;
}

export interface Expense {
  _id: string;
  tripId: string;
  title: string;
  totalAmount: number;
  category: string;
  note: string;
  createdBy: User;
  participants: Participant[];
  payments: Payment[];
  date: string;
}
