export type AuthedUser = {
  user_id: number;
  tenant_id: number;
  role: 'admin' | 'vendor' | 'customer';
};
