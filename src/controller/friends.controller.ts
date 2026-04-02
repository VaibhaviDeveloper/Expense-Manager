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

    addFriend(friend:iFriend): ReturnType<iFriend | null> {
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
}