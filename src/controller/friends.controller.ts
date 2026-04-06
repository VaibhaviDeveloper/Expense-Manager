import type { iFriend } from "../models/friend.model.js";
import type { ReturnType } from "../core/return-type.js";
import { FriendRepository } from "../repositories/friends.repository.js";

export class FriendsController{
    private repository = FriendRepository.getInstance();

    checkEmailExists(email:string): boolean {
        return this.repository.findFriendByEmail(email) !== undefined;
    }

    checkPhoneExists(phone:string): boolean {
        return this.repository.findFriendByPhone(phone) !== undefined;
    }

    checkNameExists(name:string): boolean {
        return this.repository.findFriendByName(name) !== undefined;
    }

    getFriendByEmail(email: string): iFriend | null {
        return this.repository.findFriendByEmail(email) || null;
    }

    getFriendByPhone(phone: string): iFriend | null {
        return this.repository.findFriendByPhone(phone) || null;
    }

    getFriendByName(name: string): iFriend | null {
        return this.repository.findFriendByName(name) || null;
    }

    addFriend(friend:iFriend): ReturnType<iFriend | null> {
        // Check if name already exists
        if(this.checkNameExists(friend.name)) {
            return {
                success: 'false',
                data: null
            };
        }

        // Check if email already exists
        if(this.checkEmailExists(friend.email)) {
            return {
                success: 'false',
                data: null
            };
        }

        // Check if phone already exists
        if(this.checkPhoneExists(friend.phone)) {
            return {
                success: 'false',
                data: null
            };
        }

        console.log('Adding friend to database...', friend)
        const addedFriend = this.repository.addFriend(friend);
        return {
            success: 'true',
            data: addedFriend
        };
    }

    searchFriends(query:string): ReturnType<{data:iFriend[], matched:number, total:number}> {
       const result = this.repository.searchFriends(query);
  return {
    success: result.matched <= 0 ? 'false' : 'true',
    data: result  
  }
      }
      

    removeFriend(id: string): ReturnType<boolean> {
        const friend = this.repository.findFriendById(id);
        if(!friend) {
            return {
                success: 'false',
                data: false
            };
        }

        const removed = this.repository.removeFriend(id);
        return {
            success: removed ? 'true' : 'false',
            data: removed
        };
    }

    removeFriendByEmail(email: string): ReturnType<boolean> {
        const friend = this.repository.findFriendByEmail(email);
        if(!friend) {
            return {
                success: 'false',
                data: false
            };
        }

        const removed = this.repository.removeFriend(friend.id);
        return {
            success: removed ? 'true' : 'false',
            data: removed
        };
    }

    removeFriendByPhone(phone: string): ReturnType<boolean> {
        const friend = this.repository.findFriendByPhone(phone);
        if(!friend) {
            return {
                success: 'false',
                data: false
            };
        }

        const removed = this.repository.removeFriend(friend.id);
        return {
            success: removed ? 'true' : 'false',
            data: removed
        };
    }

    updateFriend(id: string, updatedData: Partial<Omit<iFriend, 'id'>>): ReturnType<iFriend | null> {
        const existingFriend = this.repository.findFriendById(id);
        if (!existingFriend) {
            return {
                success: 'false',
                data: null
            };
        }

        // Check if updating email and it already exists for another friend
        if (updatedData.email && updatedData.email !== existingFriend.email && this.checkEmailExists(updatedData.email)) {
            return {
                success: 'false',
                data: null
            };
        }

        // Check if updating phone and it already exists for another friend
        if (updatedData.phone && updatedData.phone !== existingFriend.phone && this.checkPhoneExists(updatedData.phone)) {
            return {
                success: 'false',
                data: null
            };
        }

        console.log('Updating friend in database...', { id, updatedData });
        const updatedFriend = this.repository.updateFriend(id, updatedData);
        return {
            success: updatedFriend ? 'true' : 'false',
            data: updatedFriend
        };
    }
}