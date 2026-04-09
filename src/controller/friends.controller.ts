import type { iFriend } from "../models/friend.model.js";
import type { ReturnType } from "../core/return-type.js";
import { FriendRepository } from "../repositories/friends.repository.js";

export class FriendsController {
  private repository = FriendRepository.getInstance();

  
  checkEmailExists(email: string): boolean {
    if (!email || !email.trim()) return false;
    return this.repository.findFriendByEmail(email.trim()) !== undefined;
  }

  checkPhoneExists(phone: string): boolean {
    if (!phone || !phone.trim()) return false;
    return this.repository.findFriendByPhone(phone.trim()) !== undefined;
  }

  checkNameExists(name: string): boolean {
    if (!name || !name.trim()) return false;
    return this.repository.findFriendByName(name.trim()) !== undefined;
  }

  
  getFriendByEmail(email: string): iFriend | null {
    if (!email || !email.trim()) return null;
    return this.repository.findFriendByEmail(email.trim()) || null;
  }

  getFriendByPhone(phone: string): iFriend | null {
    if (!phone || !phone.trim()) return null;
    return this.repository.findFriendByPhone(phone.trim()) || null;
  }

  getFriendByName(name: string): iFriend | null {
    if (!name || !name.trim()) return null;
    return this.repository.findFriendByName(name.trim()) || null;
  }

  
  getAllFriends(): ReturnType<iFriend[]> {
    const data = this.repository.getAllFriends();
    return {
      success: data.length > 0 ? 'true' : 'false',
      data
    };
  }

  
  async addFriend(friend: iFriend): Promise<ReturnType<iFriend | null>> {
   
    const name = friend.name?.trim();
    const email = friend.email?.trim();
    const phone = friend.phone?.trim();

    if (!name || !email || !phone) {
      return {
        success: 'false',
        data: null
      };
    }

    if (this.checkNameExists(name)) {
      return { success: 'false', data: null };
    }

    if (this.checkEmailExists(email)) {
      return { success: 'false', data: null };
    }

    if (this.checkPhoneExists(phone)) {
      return { success: 'false', data: null };
    }

    const cleanFriend: iFriend = {
      ...friend,
      name,
      email,
      phone,
      address: friend.address?.trim() || "",
      balance: Number(friend.balance) || 0
    };

    console.log('Adding friend to database...', cleanFriend);

    const addedFriend = await this.repository.addFriend(cleanFriend);

    return {
      success: 'true',
      data: addedFriend
    };
  }

  
  searchFriends(query: string): ReturnType<{ data: iFriend[]; matched: number; total: number }> {
    const safeQuery = (query || "").trim();

    const result = this.repository.searchFriends(safeQuery);

    return {
      success: result.matched > 0 ? 'true' : 'false',
      data: result
    };
  }

  
  removeFriend(id: string): ReturnType<boolean> {
    if (!id) return { success: 'false', data: false };

    const friend = this.repository.findFriendById(id);
    if (!friend) {
      return { success: 'false', data: false };
    }

    const removed = this.repository.removeFriend(id);

    return {
      success: removed ? 'true' : 'false',
      data: removed
    };
  }

  removeFriendByEmail(email: string): ReturnType<boolean> {
    if (!email || !email.trim()) return { success: 'false', data: false };

    const friend = this.repository.findFriendByEmail(email.trim());
    if (!friend) {
      return { success: 'false', data: false };
    }

    const removed = this.repository.removeFriend(friend.id);

    return {
      success: removed ? 'true' : 'false',
      data: removed
    };
  }

  removeFriendByPhone(phone: string): ReturnType<boolean> {
    if (!phone || !phone.trim()) return { success: 'false', data: false };

    const friend = this.repository.findFriendByPhone(phone.trim());
    if (!friend) {
      return { success: 'false', data: false };
    }

    const removed = this.repository.removeFriend(friend.id);

    return {
      success: removed ? 'true' : 'false',
      data: removed
    };
  }

  updateFriend(
  id: string,
  updatedData: Partial<Omit<iFriend, 'id'>>
): ReturnType<iFriend | null> {

  const existingFriend = this.repository.findFriendById(id);
  if (!existingFriend) {
    return { success: 'false', data: null };
  }

  const cleanUpdates: Partial<Omit<iFriend, 'id'>> = {};

  
  if (updatedData.name && updatedData.name.trim() !== '') {
    cleanUpdates.name = updatedData.name.trim();
  }

  
  if (updatedData.email && updatedData.email.trim() !== '') {
    const email = updatedData.email.trim();

    if (email !== existingFriend.email && this.checkEmailExists(email)) {
      return { success: 'false', data: null };
    }

    cleanUpdates.email = email;
  }

  
  if (updatedData.phone && updatedData.phone.trim() !== '') {
    const phone = updatedData.phone.trim();

    if (phone !== existingFriend.phone && this.checkPhoneExists(phone)) {
      return { success: 'false', data: null };
    }

    cleanUpdates.phone = phone;
  }

 
  if (updatedData.address && updatedData.address.trim() !== '') {
    cleanUpdates.address = updatedData.address.trim();
  }

  
  if (updatedData.balance !== undefined) {
    const val = Number(updatedData.balance);
    if (!isNaN(val)) {
      cleanUpdates.balance = val;
    }
  }

 
  if (Object.keys(cleanUpdates).length === 0) {
    return { success: 'false', data: null };
  }

  console.log('Updating friend...', { id, cleanUpdates });

  const updatedFriend = this.repository.updateFriend(id, cleanUpdates);

  return {
    success: updatedFriend ? 'true' : 'false',
    data: updatedFriend
  };
}
}